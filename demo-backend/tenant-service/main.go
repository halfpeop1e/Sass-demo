package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"cross-border-saas/shared"
)

var tenants = []shared.Tenant{
	{ID: "T001", Name: "潮流服饰旗舰店", Tier: "Enterprise", IsolationLevel: "独立数据库", Status: "active", SPUCount: 38500, OrderCount: 125000, APIQPS: 320, QuotaLimit: 500, StorageGB: 250, CreatedAt: "2025-01-15", Domain: "fashion.saas.com"},
	{ID: "T002", Name: "数码配件专营店", Tier: "Pro", IsolationLevel: "独立Schema", Status: "active", SPUCount: 4200, OrderCount: 68000, APIQPS: 180, QuotaLimit: 500, StorageGB: 80, CreatedAt: "2025-03-22", Domain: "digital.saas.com"},
	{ID: "T003", Name: "家居好物精选", Tier: "Starter", IsolationLevel: "共享表", Status: "active", SPUCount: 320, OrderCount: 4500, APIQPS: 45, QuotaLimit: 100, StorageGB: 12, CreatedAt: "2025-06-10", Domain: "home.saas.com"},
	{ID: "T004", Name: "运动户外装备", Tier: "Pro", IsolationLevel: "独立Schema", Status: "active", SPUCount: 2800, OrderCount: 35000, APIQPS: 120, QuotaLimit: 500, StorageGB: 55, CreatedAt: "2025-02-18", Domain: "sports.saas.com"},
	{ID: "T005", Name: "美妆护肤品牌店", Tier: "Enterprise", IsolationLevel: "独立数据库", Status: "active", SPUCount: 22000, OrderCount: 98000, APIQPS: 280, QuotaLimit: 500, StorageGB: 180, CreatedAt: "2025-01-08", Domain: "beauty.saas.com"},
}

func main() {
	rt := shared.NewRouter()
	rt.GET("/health", health("tenant-service"))
	rt.GET("/tenants", list)
	rt.GET("/tenants/{id}", get)
	rt.POST("/tenants", create)
	rt.PUT("/tenants/{id}/tier", upgrade)

	port := getEnv("PORT", "8081")
	shared.Start(port, shared.CORS(rt.Build()), "Tenant Service")
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" { return v }
	return d
}

func health(name string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		shared.WriteJSON(w, 200, shared.HealthResponse{Status: "healthy", Service: name, Version: "v2.0.0", Uptime: shared.GetUptime()})
	}
}

func list(w http.ResponseWriter, r *http.Request) {
	shared.WriteJSON(w, 200, shared.Success(tenants))
}

func get(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for _, t := range tenants {
		if t.ID == id { shared.WriteJSON(w, 200, shared.Success(t)); return }
	}
	shared.WriteJSON(w, 404, shared.Error(404, "tenant not found"))
}

func create(w http.ResponseWriter, r *http.Request) {
	var t shared.Tenant
	if err := shared.ReadJSON(r, &t); err != nil {
		shared.WriteJSON(w, 400, shared.Error(400, err.Error()))
		return
	}
	t.ID = fmt.Sprintf("T%s", time.Now().Format("0102150405"))
	t.CreatedAt = time.Now().Format("2006-01-02")
	t.Status = "pending"
	if t.Tier == "" { t.Tier = "Starter" }
	if t.IsolationLevel == "" {
		switch t.Tier {
		case "Enterprise": t.IsolationLevel = "独立数据库"; t.QuotaLimit = 500
		case "Pro": t.IsolationLevel = "独立Schema"; t.QuotaLimit = 500
		default: t.IsolationLevel = "共享表"; t.QuotaLimit = 100
		}
	}
	tenants = append(tenants, t)
	shared.WriteJSON(w, 201, shared.Success(t))
}

func upgrade(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	var body struct{ Tier string `json:"tier"` }
	if err := shared.ReadJSON(r, &body); err != nil {
		shared.WriteJSON(w, 400, shared.Error(400, err.Error()))
		return
	}
	for i, t := range tenants {
		if t.ID == id {
			tenants[i].Tier = body.Tier
			switch body.Tier {
			case "Enterprise": tenants[i].IsolationLevel = "独立数据库"; tenants[i].QuotaLimit = 500
			case "Pro": tenants[i].IsolationLevel = "独立Schema"; tenants[i].QuotaLimit = 500
			default: tenants[i].IsolationLevel = "共享表"; tenants[i].QuotaLimit = 100
			}
			shared.WriteJSON(w, 200, shared.Success(tenants[i]))
			return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "tenant not found"))
}
