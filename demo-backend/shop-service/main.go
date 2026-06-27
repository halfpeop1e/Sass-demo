package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"cross-border-saas/shared"
)

var shops = []shared.Shop{
	{ID: "SHOP-001", TenantID: "T001", Name: "潮流服饰旗舰店", Domain: "fashion.saas.com", Theme: "modern", Status: "published", CreatedAt: "2025-01-15"},
	{ID: "SHOP-002", TenantID: "T002", Name: "数码配件专营店", Domain: "digital.saas.com", Theme: "tech", Status: "published", CreatedAt: "2025-03-22"},
	{ID: "SHOP-003", TenantID: "T003", Name: "家居好物精选", Domain: "home.saas.com", Theme: "minimal", Status: "published", CreatedAt: "2025-06-10"},
	{ID: "SHOP-004", TenantID: "T005", Name: "美妆护肤品牌店", Domain: "beauty.saas.com", Theme: "luxury", Status: "published", CreatedAt: "2025-01-08"},
}

func main() {
	rt := shared.NewRouter()
	rt.GET("/health", health("shop-service"))
	rt.GET("/shops", list)
	rt.GET("/shops/{id}", get)
	rt.GET("/shops/tenant/{tenantId}", getByTenant)
	rt.POST("/shops", create)
	rt.POST("/shops/{id}/publish", publish)
	rt.PUT("/shops/{id}", updateShop)
	rt.DELETE("/shops/{id}", deleteShop)

	port := getEnv("PORT", "8082")
	shared.Start(port, shared.CORS(rt.Build()), "Shop Service")
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
func health(n string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		shared.WriteJSON(w, 200, shared.HealthResponse{Status: "healthy", Service: n, Version: "v2.0.0", Uptime: shared.GetUptime()})
	}
}

func list(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query().Get("tenantId")
	if tid != "" {
		result := []shared.Shop{}
		for _, s := range shops {
			if s.TenantID == tid {
				result = append(result, s)
			}
		}
		shared.WriteJSON(w, 200, shared.Success(result))
		return
	}
	shared.WriteJSON(w, 200, shared.Success(shops))
}

func get(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for _, s := range shops {
		if s.ID == id {
			shared.WriteJSON(w, 200, shared.Success(s))
			return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "shop not found"))
}

func getByTenant(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query().Get("tenantId")
	result := []shared.Shop{}
	for _, s := range shops {
		if s.TenantID == tid {
			result = append(result, s)
		}
	}
	shared.WriteJSON(w, 200, shared.Success(result))
}

func create(w http.ResponseWriter, r *http.Request) {
	var s shared.Shop
	if err := shared.ReadJSON(r, &s); err != nil {
		shared.WriteJSON(w, 400, shared.Error(400, err.Error()))
		return
	}
	s.ID = fmt.Sprintf("SHOP-%d", time.Now().Unix())
	s.Status = "draft"
	s.CreatedAt = time.Now().Format("2006-01-02")
	shops = append(shops, s)
	shared.WriteJSON(w, 201, shared.Success(s))
}

func publish(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for i, s := range shops {
		if s.ID == id {
			shops[i].Status = "published"
			shared.WriteJSON(w, 200, shared.Success(map[string]string{
				"message": "published, CDN refreshed", "cdnUrl": fmt.Sprintf("https://cdn.saas.com/shops/%s/index.html", id),
				"version": time.Now().Format("20060102150405"),
			}))
			return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "shop not found"))
}

func updateShop(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	var body shared.Shop
	if err := shared.ReadJSON(r, &body); err != nil {
		shared.WriteJSON(w, 400, shared.Error(400, err.Error()))
		return
	}
	for i, s := range shops {
		if s.ID == id {
			body.ID = id
			body.CreatedAt = s.CreatedAt
			shops[i] = body
			shared.WriteJSON(w, 200, shared.Success(shops[i]))
			return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "shop not found"))
}

func deleteShop(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for i, s := range shops {
		if s.ID == id {
			shops = append(shops[:i], shops[i+1:]...)
			shared.WriteJSON(w, 200, shared.Success(map[string]string{"deleted": id}))
			return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "shop not found"))
}
