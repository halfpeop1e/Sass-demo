package main

import (
	"net/http"
	"os"

	"cross-border-saas/shared"
)

var notifs = []map[string]interface{}{
	{"id": "NTF-001", "buyerId": "BUY-001", "type": "order_confirmed", "title": "订单确认", "message": "您的订单 ORD-001 已确认，预计3-5天送达", "status": "sent", "channel": "email"},
	{"id": "NTF-002", "buyerId": "BUY-002", "type": "shipped", "title": "已发货", "message": "您的订单 ORD-002 已发货，运单号 TRK20250616091600", "status": "sent", "channel": "email"},
	{"id": "NTF-003", "buyerId": "BUY-003", "type": "payment_reminder", "title": "待付款提醒", "message": "您的订单 ORD-003 待付款，请在30分钟内完成支付", "status": "sent", "channel": "sms"},
}

func main() {
	rt := shared.NewRouter()
	rt.GET("/health", h("notification-service"))
	rt.GET("/notifications", list)
	rt.POST("/notifications", send)
	rt.GET("/notifications/buyer/{bid}", byBuyer)
	port := getEnv("PORT", "8087")
	shared.Start(port, shared.CORS(rt.Build()), "Notification Service")
}

func getEnv(k, d string) string { if v := os.Getenv(k); v != "" { return v }; return d }
func h(n string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		shared.WriteJSON(w, 200, shared.HealthResponse{Status: "healthy", Service: n, Version: "v2.0.0", Uptime: shared.GetUptime()})
	}
}

func list(w http.ResponseWriter, r *http.Request) { shared.WriteJSON(w, 200, shared.Success(notifs)) }

func send(w http.ResponseWriter, r *http.Request) {
	var n map[string]interface{}
	if err := shared.ReadJSON(r, &n); err != nil { shared.WriteJSON(w, 400, shared.Error(400, err.Error())); return }
	n["id"] = "NTF-NEW"; n["status"] = "sent"
	notifs = append(notifs, n)
	shared.WriteJSON(w, 201, shared.Success(n))
}

func byBuyer(w http.ResponseWriter, r *http.Request) {
	bid := r.URL.Query().Get("bid")
	result := []map[string]interface{}{}
	for _, n := range notifs { if b, ok := n["buyerId"].(string); ok && b == bid { result = append(result, n) } }
	shared.WriteJSON(w, 200, shared.Success(result))
}
