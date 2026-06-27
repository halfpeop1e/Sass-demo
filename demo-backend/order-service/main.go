package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"cross-border-saas/shared"
)

var orders = []shared.Order{
	{ID: "ORD-001", TenantID: "T001", BuyerID: "BUY-001", Status: "已完成", TotalAmount: 89.97, Currency: "USD",
		ShippingAddr: shared.Address{Name: "John Doe", Phone: "+1-555-0100", Country: "US", State: "CA", City: "LA", Line1: "123 Main St", PostCode: "90001"},
		Items: []shared.OrderItem{{ProductID: "P001", Title: "夏季新款连衣裙", Quantity: 2, UnitPrice: 29.99}, {ProductID: "P009", Title: "韩版宽松卫衣", Quantity: 1, UnitPrice: 32.99}},
		PaymentID: "PAY-001", ShipmentID: "SHP-001", CreatedAt: "2025-06-15 10:30:00", UpdatedAt: "2025-06-25 14:00:00"},
	{ID: "ORD-002", TenantID: "T002", BuyerID: "BUY-002", Status: "已发货", TotalAmount: 59.98, Currency: "USD",
		ShippingAddr: shared.Address{Name: "Jane Smith", Phone: "+1-555-0200", Country: "US", State: "NY", City: "NYC", Line1: "456 Park Ave", PostCode: "10022"},
		Items: []shared.OrderItem{{ProductID: "P003", Title: "无线蓝牙耳机", Quantity: 1, UnitPrice: 49.99}, {ProductID: "P004", Title: "Type-C快充数据线", Quantity: 1, UnitPrice: 9.99}},
		PaymentID: "PAY-002", ShipmentID: "SHP-002", CreatedAt: "2025-06-16 09:15:00", UpdatedAt: "2025-06-17 11:00:00"},
	{ID: "ORD-003", TenantID: "T005", BuyerID: "BUY-003", Status: "待付款", TotalAmount: 54.98, Currency: "USD",
		ShippingAddr: shared.Address{Name: "Mike Wilson", Phone: "+66-81-2345678", Country: "TH", State: "Bangkok", City: "Bangkok", Line1: "789 Sukhumvit Rd", PostCode: "10110"},
		Items: []shared.OrderItem{{ProductID: "P007", Title: "保湿精华液", Quantity: 1, UnitPrice: 34.99}, {ProductID: "P008", Title: "防晒霜SPF50+", Quantity: 1, UnitPrice: 19.99}},
		CreatedAt: "2025-06-27 14:22:00", UpdatedAt: "2025-06-27 14:22:00"},
}

func main() {
	rt := shared.NewRouter()
	rt.GET("/health", h("order-service"))
	rt.GET("/orders", list)
	rt.GET("/orders/{id}", get)
	rt.POST("/orders", create)
	rt.PUT("/orders/{id}/status", updateStatus)
	rt.GET("/orders/tenant/{tid}", byTenant)
	rt.GET("/orders/buyer/{bid}", byBuyer)
	port := getEnv("PORT", "8084")
	shared.Start(port, shared.CORS(rt.Build()), "Order Service")
}

func getEnv(k, d string) string { if v := os.Getenv(k); v != "" { return v }; return d }
func h(n string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		shared.WriteJSON(w, 200, shared.HealthResponse{Status: "healthy", Service: n, Version: "v2.0.0", Uptime: shared.GetUptime()})
	}
}

func list(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query().Get("tenantId")
	if tid != "" {
		result := []shared.Order{}
		for _, o := range orders { if o.TenantID == tid { result = append(result, o) } }
		shared.WriteJSON(w, 200, shared.Success(result)); return
	}
	shared.WriteJSON(w, 200, shared.Success(orders))
}

func get(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for _, o := range orders { if o.ID == id { shared.WriteJSON(w, 200, shared.Success(o)); return } }
	shared.WriteJSON(w, 404, shared.Error(404, "order not found"))
}

func create(w http.ResponseWriter, r *http.Request) {
	var o shared.Order
	if err := shared.ReadJSON(r, &o); err != nil { shared.WriteJSON(w, 400, shared.Error(400, err.Error())); return }
	o.ID = fmt.Sprintf("ORD-%d", time.Now().UnixNano())
	o.Status = "待付款"; o.CreatedAt = time.Now().Format("2006-01-02 15:04:05"); o.UpdatedAt = o.CreatedAt
	orders = append(orders, o)
	shared.WriteJSON(w, 201, shared.Success(o))
}

func updateStatus(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	var body struct{ Status string `json:"status"` }
	if err := shared.ReadJSON(r, &body); err != nil { shared.WriteJSON(w, 400, shared.Error(400, err.Error())); return }
	for i, o := range orders {
		if o.ID == id { orders[i].Status = body.Status; orders[i].UpdatedAt = time.Now().Format("2006-01-02 15:04:05")
			shared.WriteJSON(w, 200, shared.Success(orders[i])); return }
	}
	shared.WriteJSON(w, 404, shared.Error(404, "order not found"))
}

func byTenant(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query().Get("tid")
	result := []shared.Order{}
	for _, o := range orders { if o.TenantID == tid { result = append(result, o) } }
	shared.WriteJSON(w, 200, shared.Success(result))
}

func byBuyer(w http.ResponseWriter, r *http.Request) {
	bid := r.URL.Query().Get("bid")
	result := []shared.Order{}
	for _, o := range orders { if o.BuyerID == bid { result = append(result, o) } }
	shared.WriteJSON(w, 200, shared.Success(result))
}
