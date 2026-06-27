package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"sync"
	"syscall"
	"time"

	"cross-border-saas/shared"
)

var (
	defaultRegion  string
	disasterRegion string
	primaryUp      bool
	healthMu       sync.RWMutex
)

var primaryPorts = map[string]string{
	"tenants":       "8081",
	"shops":         "8082",
	"products":      "8083",
	"orders":        "8084",
	"payments":      "8085",
	"shipments":     "8086",
	"notifications": "8087",
	"tire":          "8088",
}

var disasterPorts = map[string]string{
	"tenants":       "9081",
	"shops":         "9082",
	"products":      "9083",
	"orders":        "9084",
	"payments":      "9085",
	"shipments":     "9086",
	"notifications": "9087",
	"tire":          "9088",
}

var bgBinDir = "/tmp"

func main() {
	defaultRegion = getEnv("REGION", "华东")
	disasterRegion = getEnv("DISASTER_REGION", "东京")
	primaryUp = getEnv("DISASTER_MODE", "normal") != "failover"
	port := getEnv("PORT", "8080")

	go primaryHealthMonitor()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", makeHealthHandler("api-gateway"))
	mux.HandleFunc("/api/services", servicesHandler)
	mux.HandleFunc("/api/disaster/status", disasterStatusHandler)
	mux.HandleFunc("/api/disaster/failover", failoverHandler)
	mux.HandleFunc("/api/disaster/fire", fireHandler)
	mux.HandleFunc("/api/disaster/recover", recoveryHandler)
	mux.HandleFunc("/api/", apiProxyHandler)

	handler := shared.CORS(rateLimitMiddleware(mux))
	log.Printf("🚪 API Gateway :%s | Primary=%s | Disaster=%s", port, defaultRegion, disasterRegion)
	shared.Start(port, handler, "API Gateway")
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

func getActivePort(serviceName string) string {
	healthMu.RLock()
	defer healthMu.RUnlock()
	if primaryUp {
		return primaryPorts[serviceName]
	}
	return disasterPorts[serviceName]
}

func checkHealth(port string) bool {
	resp, err := http.Get(fmt.Sprintf("http://localhost:%s/health", port))
	if err != nil {
		return false
	}
	resp.Body.Close()
	return resp.StatusCode == 200
}

func primaryHealthMonitor() {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()
	for range ticker.C {
		allDown := true
		for _, pp := range primaryPorts {
			if checkHealth(pp) {
				allDown = false
				break
			}
		}
		healthMu.Lock()
		if !allDown && !primaryUp {
			log.Printf("✅ 主区域恢复: 自动切回 %s", defaultRegion)
		}
		if allDown && primaryUp {
			log.Printf("🔥 主区域全部不可用! 自动切换至灾备区域 %s", disasterRegion)
		}
		primaryUp = !allDown
		healthMu.Unlock()
	}
}

func apiProxyHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if !strings.HasPrefix(path, "/api/") {
		shared.WriteJSON(w, 404, shared.Error(404, "not an API path"))
		return
	}
	rest := path[len("/api/"):]
	parts := strings.SplitN(rest, "/", 2)
	serviceName := parts[0]

	activePort := getActivePort(serviceName)
	if activePort == "" {
		shared.WriteJSON(w, 404, shared.Error(404, "unknown service: "+serviceName))
		return
	}

	var targetPath string
	if len(parts) > 1 {
		targetPath = rest
	} else {
		targetPath = serviceName
	}

	// Try active (primary) port first
	targetURL := fmt.Sprintf("http://localhost:%s/%s", activePort, targetPath)
	if r.URL.RawQuery != "" {
		targetURL += "?" + r.URL.RawQuery
	}

	ok := proxyToURL(w, r, targetURL)
	if ok {
		return
	}

	// Primary failed, try disaster port
	healthMu.RLock()
	fallbackPort := disasterPorts[serviceName]
	fallbackRegion := disasterRegion
	if activePort == disasterPorts[serviceName] {
		fallbackPort = primaryPorts[serviceName]
		fallbackRegion = defaultRegion
	}
	healthMu.RUnlock()

	fallbackURL := fmt.Sprintf("http://localhost:%s/%s", fallbackPort, targetPath)
	if r.URL.RawQuery != "" {
		fallbackURL += "?" + r.URL.RawQuery
	}

	log.Printf("🔄 主端口 :%s 不可用, 切换到备端口 :%s (%s)", activePort, fallbackPort, fallbackRegion)
	ok2 := proxyToURL(w, r, fallbackURL)
	if !ok2 {
		shared.WriteJSON(w, 503, shared.Error(503,
			fmt.Sprintf("service %s DOWN on both regions", serviceName)))
	}
}

func proxyToURL(w http.ResponseWriter, r *http.Request, targetURL string) bool {
	req, err := http.NewRequest(r.Method, targetURL, r.Body)
	if err != nil {
		return false
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Tenant-ID", r.Header.Get("X-Tenant-ID"))
	req.Header.Set("X-Request-ID", r.Header.Get("X-Request-ID"))
	req.Header.Set("Authorization", r.Header.Get("Authorization"))
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode >= 500 {
		return false
	}
	defer resp.Body.Close()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
	return true
}

func makeHealthHandler(name string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		deps := map[string]string{}
		healthMu.RLock()
		up := primaryUp
		healthMu.RUnlock()
		mode := "primary"
		if !up {
			mode = "disaster"
		}
		for svcName := range primaryPorts {
			pp := primaryPorts[svcName]
			deps[svcName] = healthStatus(pp)
		}
		shared.WriteJSON(w, 200, map[string]interface{}{
			"status":       "healthy",
			"service":      name,
			"version":      "v3.0.0",
			"uptime":       shared.GetUptime(),
			"mode":         mode,
			"region":       defaultRegion,
			"dependencies": deps,
		})
	}
}

func healthStatus(port string) string {
	if port == "" {
		return "unknown"
	}
	if checkHealth(port) {
		return "healthy"
	}
	return "unreachable"
}

func servicesHandler(w http.ResponseWriter, r *http.Request) {
	svcs := []map[string]interface{}{}
	healthMu.RLock()
	up := primaryUp
	healthMu.RUnlock()
	for name := range primaryPorts {
		pp := primaryPorts[name]
		dp := disasterPorts[name]
		svcs = append(svcs, map[string]interface{}{
			"name":            name,
			"primaryPort":     pp,
			"disasterPort":    dp,
			"primaryHealthy":  checkHealth(pp),
			"disasterHealthy": checkHealth(dp),
			"activeRegion":    map[bool]string{true: "primary", false: "disaster"}[up],
		})
	}
	shared.WriteJSON(w, 200, shared.Success(svcs))
}

func disasterStatusHandler(w http.ResponseWriter, r *http.Request) {
	healthMu.RLock()
	mode := "primary"
	if !primaryUp {
		mode = "disaster"
	}
	healthMu.RUnlock()

	primaryCount := 0
	disasterCount := 0
	for _, pp := range primaryPorts {
		if checkHealth(pp) {
			primaryCount++
		}
	}
	for _, dp := range disasterPorts {
		if checkHealth(dp) {
			disasterCount++
		}
	}

	shared.WriteJSON(w, 200, shared.Success(map[string]interface{}{
		"primaryRegion":   defaultRegion,
		"disasterRegion":  disasterRegion,
		"mode":            mode,
		"primaryHealthy":  primaryCount,
		"disasterHealthy": disasterCount,
		"totalServices":   len(primaryPorts),
		"rtoTarget":       "≤30min",
		"rpoTarget":       "≤5min",
		"autoFailover":    true,
	}))
}

func fireHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔥🔥🔥 模拟机房着火! 停止主区域(%s)所有服务...", defaultRegion)

	stopped := []string{}
	for pport := range primaryPorts {
		pid := findPidOnPort(pport)
		if pid > 0 {
			proc, _ := os.FindProcess(pid)
			if proc != nil {
				proc.Signal(os.Interrupt)
				stopped = append(stopped, fmt.Sprintf(":%s", pport))
			}
		}
	}

	time.Sleep(500 * time.Millisecond)
	for _, pp := range primaryPorts {
		exec.Command("kill", "-9", findPidStr(pp)).Run()
	}

	healthMu.Lock()
	primaryUp = false
	healthMu.Unlock()

	log.Printf("🔥 着火模拟完成: 已停止 %d 个主区域服务, 网关将自动路由至灾备区域 %s", len(stopped), disasterRegion)
	shared.WriteJSON(w, 200, shared.Success(map[string]interface{}{
		"message":         fmt.Sprintf("🔥 机房着火! %s 服务已停止, 自动切换至 %s", defaultRegion, disasterRegion),
		"stoppedServices": stopped,
		"status":          "failover",
		"region":          disasterRegion,
	}))
}

func recoveryHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔧 恢复主区域服务...")

	successCount := 0
	for name, pport := range primaryPorts {
		if checkHealth(pport) {
			successCount++
			continue
		}
		binName := name
		if name == "tire" {
			binName = "tire-engine"
		} else if name == "tenants" {
			binName = "tenant-service"
		} else if name == "shops" {
			binName = "shop-service"
		} else if name == "products" {
			binName = "product-service"
		} else if name == "orders" {
			binName = "order-service"
		} else if name == "payments" {
			binName = "payment-service"
		} else if name == "shipments" {
			binName = "fulfillment-service"
		} else if name == "notifications" {
			binName = "notification-service"
		}
		binPath := fmt.Sprintf("%s/saas-%s", bgBinDir, binName)
		cmd := exec.Command(binPath)
		cmd.Env = append(os.Environ(), fmt.Sprintf("PORT=%s", pport), fmt.Sprintf("REGION=%s", defaultRegion))
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
		if err := cmd.Start(); err == nil {
			successCount++
			log.Printf("   ✅ 恢复 %s :%s PID=%d", name, pport, cmd.Process.Pid)
			go func() { cmd.Process.Release() }()
		} else {
			log.Printf("   ❌ 恢复 %s 失败: %v", name, err)
		}
	}

	time.Sleep(2 * time.Second)

	healthUp := 0
	for _, pp := range primaryPorts {
		if checkHealth(pp) {
			healthUp++
		}
	}

	if healthUp >= len(primaryPorts)/2 {
		healthMu.Lock()
		primaryUp = true
		healthMu.Unlock()
	}

	shared.WriteJSON(w, 200, shared.Success(map[string]interface{}{
		"message":      fmt.Sprintf("🔧 恢复完成! %s 已恢复为主区域 (%d/%d 服务健康)", defaultRegion, healthUp, len(primaryPorts)),
		"status":       "recovered",
		"region":       defaultRegion,
		"healthyCount": healthUp,
		"totalCount":   len(primaryPorts),
	}))
}

func failoverHandler(w http.ResponseWriter, r *http.Request) {
	healthMu.Lock()
	primaryUp = false
	healthMu.Unlock()
	shared.WriteJSON(w, 200, shared.Success(map[string]string{
		"message": fmt.Sprintf("手动切换: %s -> %s", defaultRegion, disasterRegion),
		"status":  "failover",
	}))
}

func rateLimitMiddleware(next http.Handler) http.Handler {
	tokens := map[string]int{}
	var mu sync.Mutex
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tid := r.Header.Get("X-Tenant-ID")
		if tid == "" {
			tid = "anonymous"
		}
		mu.Lock()
		tokens[tid]++
		cur := tokens[tid]
		mu.Unlock()
		time.AfterFunc(1*time.Second, func() { mu.Lock(); tokens[tid]--; mu.Unlock() })
		if cur > 500 {
			shared.WriteJSON(w, 429, shared.Error(429, "rate limit exceeded"))
			return
		}
		next.ServeHTTP(w, r)
	})
}

func findPidOnPort(port string) int {
	out, err := exec.Command("lsof", "-ti", fmt.Sprintf(":%s", port)).Output()
	if err != nil {
		return 0
	}
	s := strings.TrimSpace(string(out))
	if s == "" {
		return 0
	}
	n := 0
	fmt.Sscanf(s, "%d", &n)
	return n
}

func findPidStr(port string) string {
	out, _ := exec.Command("lsof", "-ti", fmt.Sprintf(":%s", port)).Output()
	return strings.TrimSpace(string(out))
}
