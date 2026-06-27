package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"cross-border-saas/shared"
)

var products = []shared.Product{
	{ID: "P001", TenantID: "T001", ShopID: "SHOP-001", Title: "夏季新款连衣裙", TitleI18n: map[string]string{"en-US": "Summer New Dress", "th-TH": "เดรสฤดูร้อนใหม่"}, Description: "轻盈透气的夏季连衣裙，优雅时尚", Price: 29.99, Currency: "USD", Images: []string{"/img/p001-1.jpg", "/img/p001-2.jpg"}, Category: "服装", SKU: "DRS-001", Stock: 500, Status: "active", CreatedAt: "2025-03-01"},
	{ID: "P002", TenantID: "T001", ShopID: "SHOP-001", Title: "男士休闲T恤", Price: 19.99, Currency: "USD", Images: []string{"/img/p002-1.jpg"}, Category: "服装", SKU: "TSH-001", Stock: 800, Status: "active", CreatedAt: "2025-03-05"},
	{ID: "P003", TenantID: "T002", ShopID: "SHOP-002", Title: "无线蓝牙耳机", TitleI18n: map[string]string{"en-US": "Wireless Bluetooth Earbuds"}, Description: "高音质降噪蓝牙耳机，续航48小时", Price: 49.99, Currency: "USD", Images: []string{"/img/p003-1.jpg"}, Category: "电子", SKU: "EAR-001", Stock: 300, Status: "active", CreatedAt: "2025-04-10"},
	{ID: "P004", TenantID: "T002", ShopID: "SHOP-002", Title: "Type-C快充数据线", Price: 9.99, Currency: "USD", Images: []string{"/img/p004-1.jpg"}, Category: "电子", SKU: "CBL-001", Stock: 2000, Status: "active", CreatedAt: "2025-04-15"},
	{ID: "P005", TenantID: "T003", ShopID: "SHOP-003", Title: "北欧简约台灯", Price: 39.99, Currency: "USD", Images: []string{"/img/p005-1.jpg"}, Category: "家居", SKU: "LMP-001", Stock: 150, Status: "active", CreatedAt: "2025-07-01"},
	{ID: "P006", TenantID: "T003", ShopID: "SHOP-003", Title: "记忆棉枕头", Price: 24.99, Currency: "USD", Images: []string{"/img/p006-1.jpg"}, Category: "家居", SKU: "PLW-001", Stock: 400, Status: "active", CreatedAt: "2025-07-05"},
	{ID: "P007", TenantID: "T005", ShopID: "SHOP-004", Title: "保湿精华液", TitleI18n: map[string]string{"en-US": "Hydrating Serum"}, Description: "高浓度玻尿酸保湿精华", Price: 34.99, Currency: "USD", Images: []string{"/img/p007-1.jpg"}, Category: "美妆", SKU: "SRM-001", Stock: 200, Status: "active", CreatedAt: "2025-02-15"},
	{ID: "P008", TenantID: "T005", ShopID: "SHOP-004", Title: "防晒霜SPF50+", Price: 19.99, Currency: "USD", Images: []string{"/img/p008-1.jpg"}, Category: "美妆", SKU: "SUN-001", Stock: 600, Status: "active", CreatedAt: "2025-03-20"},
	{ID: "P009", TenantID: "T001", ShopID: "SHOP-001", Title: "韩版宽松卫衣", Price: 32.99, Currency: "USD", Images: []string{"/img/p009-1.jpg"}, Category: "服装", SKU: "HDY-001", Stock: 350, Status: "active", CreatedAt: "2025-08-01"},
	{ID: "P010", TenantID: "T002", ShopID: "SHOP-002", Title: "便携充电宝20000mAh", Price: 29.99, Currency: "USD", TitleI18n: map[string]string{"en-US": "Portable Power Bank 20000mAh"}, Images: []string{"/img/p010-1.jpg"}, Category: "电子", SKU: "PWR-001", Stock: 500, Status: "active", CreatedAt: "2025-05-20"},
}

func main() {
	rt := shared.NewRouter()
	rt.GET("/health", h("product-service"))
	rt.GET("/products", list)
	rt.GET("/products/search", search)
	rt.GET("/products/{id}", get)
	rt.GET("/products/tenant/{tenantId}", byTenant)
	rt.POST("/products", createProduct)
	rt.PUT("/products/{id}", updateProduct)
	rt.DELETE("/products/{id}", deleteProduct)
	port := getEnv("PORT", "8083")
	shared.Start(port, shared.CORS(rt.Build()), "Product Service")
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
func h(n string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		shared.WriteJSON(w, 200, shared.HealthResponse{Status: "healthy", Service: n, Version: "v2.0.0", Uptime: shared.GetUptime()})
	}
}

func list(w http.ResponseWriter, r *http.Request) {
	shared.WriteJSON(w, 200, shared.Success(products))
}

func search(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(r.URL.Query().Get("q"))
	cat := r.URL.Query().Get("category")
	result := []shared.Product{}
	for _, p := range products {
		if (q == "" || strings.Contains(strings.ToLower(p.Title), q)) &&
			(cat == "" || p.Category == cat) {
			result = append(result, p)
		}
	}
	shared.WriteJSON(w, 200, shared.Success(result))
}

func get(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for _, p := range products {
		if p.ID == id {
			shared.WriteJSON(w, 200, shared.Success(p))
			return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "product not found"))
}

func byTenant(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query().Get("tenantId")
	result := []shared.Product{}
	for _, p := range products {
		if p.TenantID == tid {
			result = append(result, p)
		}
	}
	shared.WriteJSON(w, 200, shared.Success(result))
}

func createProduct(w http.ResponseWriter, r *http.Request) {
	var p shared.Product
	if err := shared.ReadJSON(r, &p); err != nil {
		shared.WriteJSON(w, 400, shared.Error(400, err.Error()))
		return
	}
	p.ID = fmt.Sprintf("P%03d", time.Now().UnixNano()%100000)
	p.CreatedAt = time.Now().Format("2006-01-02")
	if p.Status == "" {
		p.Status = "active"
	}
	products = append(products, p)
	shared.WriteJSON(w, 201, shared.Success(p))
}

func updateProduct(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	var body shared.Product
	if err := shared.ReadJSON(r, &body); err != nil {
		shared.WriteJSON(w, 400, shared.Error(400, err.Error()))
		return
	}
	for i, p := range products {
		if p.ID == id {
			body.ID = id
			body.CreatedAt = p.CreatedAt
			products[i] = body
			shared.WriteJSON(w, 200, shared.Success(products[i]))
			return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "product not found"))
}

func deleteProduct(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for i, p := range products {
		if p.ID == id {
			products = append(products[:i], products[i+1:]...)
			shared.WriteJSON(w, 200, shared.Success(map[string]string{"deleted": id}))
			return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "product not found"))
}
