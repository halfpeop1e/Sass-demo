package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"cross-border-saas/shared"
)

var payments = []shared.Payment{
	{ID: "PAY-001", OrderID: "ORD-001", Amount: 89.97, Currency: "USD", Channel: "Stripe", Status: "success", IdempotencyKey: "IDEM-001", ExchangeRate: 7.25, CreatedAt: "2025-06-15 10:31:00"},
	{ID: "PAY-002", OrderID: "ORD-002", Amount: 59.98, Currency: "USD", Channel: "PayPal", Status: "success", IdempotencyKey: "IDEM-002", ExchangeRate: 7.25, CreatedAt: "2025-06-16 09:16:00"},
}

func main() {
	rt := shared.NewRouter()
	rt.GET("/health", h("payment-service"))
	rt.GET("/payments", list)
	rt.GET("/payments/{id}", get)
	rt.POST("/payments", create)
	rt.POST("/payments/callback", callback)
	rt.GET("/payments/channels", channels)
	port := getEnv("PORT", "8085")
	shared.Start(port, shared.CORS(rt.Build()), "Payment Service")
}

func getEnv(k, d string) string { if v := os.Getenv(k); v != "" { return v }; return d }
func h(n string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		shared.WriteJSON(w, 200, shared.HealthResponse{Status: "healthy", Service: n, Version: "v2.0.0", Uptime: shared.GetUptime()})
	}
}

func list(w http.ResponseWriter, r *http.Request) { shared.WriteJSON(w, 200, shared.Success(payments)) }

func get(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for _, p := range payments { if p.ID == id { shared.WriteJSON(w, 200, shared.Success(p)); return } }
	shared.WriteJSON(w, 404, shared.Error(404, "payment not found"))
}

func create(w http.ResponseWriter, r *http.Request) {
	var p shared.Payment
	if err := shared.ReadJSON(r, &p); err != nil { shared.WriteJSON(w, 400, shared.Error(400, err.Error())); return }
	p.ID = fmt.Sprintf("PAY-%d", time.Now().UnixNano())
	p.IdempotencyKey = fmt.Sprintf("IDEM-%d", time.Now().UnixNano())
	p.Status = "pending"; p.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	if p.Channel == "" { p.Channel = "Stripe" }
	p.ExchangeRate = 7.25
	payments = append(payments, p)
	go func() { time.Sleep(2 * time.Second)
		for i := range payments { if payments[i].ID == p.ID { payments[i].Status = "success"; break } }
	}()
	shared.WriteJSON(w, 201, shared.Success(p))
}

func callback(w http.ResponseWriter, r *http.Request) {
	var body struct{ OrderID string `json:"orderId"`; Status string `json:"status"` }
	if err := shared.ReadJSON(r, &body); err != nil { shared.WriteJSON(w, 400, shared.Error(400, err.Error())); return }
	for _, p := range payments {
		if p.OrderID == body.OrderID && p.Status == "success" {
			shared.WriteJSON(w, 200, shared.Success(map[string]string{"message": "idempotent: already processed"})); return
		}
	}
	for i, p := range payments { if p.OrderID == body.OrderID { payments[i].Status = body.Status; break } }
	shared.WriteJSON(w, 200, shared.Success(map[string]string{"message": "callback processed"}))
}

func channels(w http.ResponseWriter, r *http.Request) {
	shared.WriteJSON(w, 200, shared.Success([]map[string]interface{}{
		{"id": "stripe", "name": "Stripe", "region": "美国/全球", "type": "信用卡", "successRate": 99.5, "status": "online"},
		{"id": "paypal", "name": "PayPal", "region": "全球", "type": "电子钱包", "successRate": 98.8, "status": "online"},
		{"id": "xendit", "name": "Xendit", "region": "印尼/东南亚", "type": "电子钱包", "successRate": 97.2, "status": "online"},
		{"id": "omise", "name": "Omise", "region": "泰国", "type": "电子钱包", "successRate": 98.0, "status": "online"},
		{"id": "adyen", "name": "Adyen", "region": "欧洲/全球", "type": "信用卡", "successRate": 99.3, "status": "online"},
		{"id": "cod", "name": "COD", "region": "东南亚", "type": "货到付款", "successRate": 85.5, "status": "online"},
	}))
}
