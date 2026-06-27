package shared

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
)

type Tenant struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Tier           string `json:"tier"`
	IsolationLevel string `json:"isolationLevel"`
	Status         string `json:"status"`
	SPUCount       int    `json:"spuCount"`
	OrderCount     int    `json:"orderCount"`
	APIQPS         int    `json:"apiQps"`
	QuotaLimit     int    `json:"quotaLimit"`
	StorageGB      int    `json:"storageGB"`
	CreatedAt      string `json:"createdAt"`
	Domain         string `json:"domain"`
}

type Shop struct {
	ID        string `json:"id"`
	TenantID  string `json:"tenantId"`
	Name      string `json:"name"`
	Domain    string `json:"domain"`
	Theme     string `json:"theme"`
	Status    string `json:"status"`
	CreatedAt string `json:"createdAt"`
}

type Product struct {
	ID          string            `json:"id"`
	TenantID    string            `json:"tenantId"`
	ShopID      string            `json:"shopId"`
	Title       string            `json:"title"`
	TitleI18n   map[string]string `json:"titleI18n,omitempty"`
	Description string            `json:"description"`
	Price       float64           `json:"price"`
	Currency    string            `json:"currency"`
	Images      []string          `json:"images"`
	Category    string            `json:"category"`
	SKU         string            `json:"sku"`
	Stock       int               `json:"stock"`
	Status      string            `json:"status"`
	CreatedAt   string            `json:"createdAt"`
}

type Order struct {
	ID           string      `json:"id"`
	TenantID     string      `json:"tenantId"`
	BuyerID      string      `json:"buyerId"`
	Status       string      `json:"status"`
	TotalAmount  float64     `json:"totalAmount"`
	Currency     string      `json:"currency"`
	ShippingAddr Address     `json:"shippingAddr"`
	Items        []OrderItem `json:"items"`
	PaymentID    string      `json:"paymentId,omitempty"`
	ShipmentID   string      `json:"shipmentId,omitempty"`
	CreatedAt    string      `json:"createdAt"`
	UpdatedAt    string      `json:"updatedAt"`
}

type OrderItem struct {
	ProductID string  `json:"productId"`
	Title     string  `json:"title"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unitPrice"`
}

type Address struct {
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Country  string `json:"country"`
	State    string `json:"state"`
	City     string `json:"city"`
	Line1    string `json:"line1"`
	Line2    string `json:"line2,omitempty"`
	PostCode string `json:"postCode"`
}

type Payment struct {
	ID             string  `json:"id"`
	OrderID        string  `json:"orderId"`
	Amount         float64 `json:"amount"`
	Currency       string  `json:"currency"`
	Channel        string  `json:"channel"`
	Status         string  `json:"status"`
	IdempotencyKey string  `json:"idempotencyKey"`
	ExchangeRate   float64 `json:"exchangeRate,omitempty"`
	CreatedAt      string  `json:"createdAt"`
}

type Shipment struct {
	ID          string `json:"id"`
	OrderID     string `json:"orderId"`
	TenantID    string `json:"tenantId"`
	Carrier     string `json:"carrier"`
	TrackingNo  string `json:"trackingNo"`
	Status      string `json:"status"`
	TrackingURL string `json:"trackingUrl,omitempty"`
	CreatedAt   string `json:"createdAt"`
}

type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type HealthResponse struct {
	Status       string            `json:"status"`
	Service      string            `json:"service"`
	Version      string            `json:"version"`
	Uptime       string            `json:"uptime"`
	Dependencies map[string]string `json:"dependencies,omitempty"`
}

func Success(data interface{}) APIResponse {
	return APIResponse{Code: 200, Message: "success", Data: data}
}

func Error(code int, msg string) APIResponse {
	return APIResponse{Code: code, Message: msg}
}

var startTime = time.Now()

func GetUptime() string {
	return time.Since(startTime).Round(time.Second).String()
}

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Tenant-ID,X-Request-ID")
		if r.Method == "OPTIONS" {
			w.WriteHeader(204)
			return
		}
		next.ServeHTTP(w, r)
	})
}

type CircuitBreaker struct {
	mu           sync.Mutex
	state        string
	failureCount int
	successCount int
	threshold    int
	timeout      time.Duration
	lastFailTime time.Time
	halfOpenMax  int
}

func NewCircuitBreaker(threshold int, timeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		state:       "closed",
		threshold:   threshold,
		timeout:     timeout,
		halfOpenMax: 3,
	}
}

func (cb *CircuitBreaker) State() string {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	return cb.state
}

func (cb *CircuitBreaker) Call(fn func() bool) bool {
	cb.mu.Lock()
	if cb.state == "open" {
		if time.Since(cb.lastFailTime) > cb.timeout {
			cb.state = "half-open"
			cb.successCount = 0
		} else {
			cb.mu.Unlock()
			return false
		}
	}
	cb.mu.Unlock()

	ok := fn()

	cb.mu.Lock()
	defer cb.mu.Unlock()
	if !ok {
		cb.failureCount++
		cb.lastFailTime = time.Now()
		if cb.state == "half-open" || cb.failureCount >= cb.threshold {
			cb.state = "open"
		}
		return false
	}
	if cb.state == "half-open" {
		cb.successCount++
		if cb.successCount >= cb.halfOpenMax {
			cb.state = "closed"
			cb.failureCount = 0
		}
	} else {
		cb.failureCount = 0
	}
	return true
}

func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func ReadJSON(r *http.Request, v interface{}) error {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	defer r.Body.Close()
	return json.Unmarshal(body, v)
}

type Route struct {
	Method  string
	Pattern string
	Handler http.HandlerFunc
}

type Router struct {
	mux      *http.ServeMux
	routes   []Route
	prefix   string
}

func NewRouter() *Router {
	return &Router{mux: http.NewServeMux()}
}

func (rt *Router) GET(pattern string, handler http.HandlerFunc) {
	rt.routes = append(rt.routes, Route{"GET", pattern, handler})
}

func (rt *Router) POST(pattern string, handler http.HandlerFunc) {
	rt.routes = append(rt.routes, Route{"POST", pattern, handler})
}

func (rt *Router) PUT(pattern string, handler http.HandlerFunc) {
	rt.routes = append(rt.routes, Route{"PUT", pattern, handler})
}

func (rt *Router) DELETE(pattern string, handler http.HandlerFunc) {
	rt.routes = append(rt.routes, Route{"DELETE", pattern, handler})
}

func (rt *Router) Build() http.Handler {
	rt.mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		method := r.Method

		for _, route := range rt.routes {
			if route.Method != method {
				continue
			}
			if matched, params := matchPath(route.Pattern, path); matched {
				q := r.URL.Query()
				for k, v := range params {
					q.Set(k, v)
				}
				r.URL.RawQuery = q.Encode()
				route.Handler(w, r)
				return
			}
		}
		WriteJSON(w, 404, Error(404, "not found: "+method+" "+path))
	})
	return rt.mux
}

func matchPath(pattern, path string) (bool, map[string]string) {
	pparts := strings.Split(strings.Trim(pattern, "/"), "/")
	uparts := strings.Split(strings.Trim(path, "/"), "/")
	if len(pparts) != len(uparts) {
		return false, nil
	}
	params := map[string]string{}
	for i, p := range pparts {
		if strings.HasPrefix(p, ":") {
			params[p[1:]] = uparts[i]
		} else if strings.HasPrefix(p, "{") && strings.HasSuffix(p, "}") {
			params[p[1:len(p)-1]] = uparts[i]
		} else if p != uparts[i] {
			return false, nil
		}
	}
	return true, params
}

func Start(port string, handler http.Handler, name string) {
	log.Printf("🚀 %s starting on :%s", name, port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("%s failed: %v", name, err)
	}
}
