package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"cross-border-saas/shared"
)

var shipments = []shared.Shipment{
	{ID: "SHP-001", OrderID: "ORD-001", TenantID: "T001", Carrier: "DHL Express", TrackingNo: "TRK20250615103100", Status: "已签收", CreatedAt: "2025-06-16 08:00:00"},
	{ID: "SHP-002", OrderID: "ORD-002", TenantID: "T002", Carrier: "FedEx", TrackingNo: "TRK20250616091600", Status: "运输中", CreatedAt: "2025-06-17 10:00:00"},
}

func main() {
	rt := shared.NewRouter()
	rt.GET("/health", h("fulfillment-service"))
	rt.GET("/shipments", list)
	rt.GET("/shipments/{id}", get)
	rt.POST("/shipments", create)
	rt.GET("/shipments/{id}/tracking", tracking)
	rt.GET("/shipments/carriers", carriers)
	rt.GET("/shipments/tenant/{tid}", byTenant)
	port := getEnv("PORT", "8086")
	shared.Start(port, shared.CORS(rt.Build()), "Fulfillment Service")
}

func getEnv(k, d string) string { if v := os.Getenv(k); v != "" { return v }; return d }
func h(n string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		shared.WriteJSON(w, 200, shared.HealthResponse{Status: "healthy", Service: n, Version: "v2.0.0", Uptime: shared.GetUptime()})
	}
}

func list(w http.ResponseWriter, r *http.Request) { shared.WriteJSON(w, 200, shared.Success(shipments)) }

func get(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for _, s := range shipments { if s.ID == id { shared.WriteJSON(w, 200, shared.Success(s)); return } }
	shared.WriteJSON(w, 404, shared.Error(404, "shipment not found"))
}

func create(w http.ResponseWriter, r *http.Request) {
	var s shared.Shipment
	if err := shared.ReadJSON(r, &s); err != nil { shared.WriteJSON(w, 400, shared.Error(400, err.Error())); return }
	s.ID = fmt.Sprintf("SHP-%d", time.Now().UnixNano())
	s.Status = "待揽收"; s.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	if s.Carrier == "" { s.Carrier = "DHL Express" }
	s.TrackingNo = fmt.Sprintf("TRK%s", time.Now().Format("20060102150405"))
	shipments = append(shipments, s)
	go func() {
		statuses := []string{"已揽收", "运输中", "到达目的国", "清关中", "派送中", "已签收"}
		for _, st := range statuses { time.Sleep(1 * time.Second)
			for i := range shipments { if shipments[i].ID == s.ID { shipments[i].Status = st; break } }
		}
	}()
	shared.WriteJSON(w, 201, shared.Success(s))
}

func tracking(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	for _, s := range shipments {
		if s.ID == id {
			shared.WriteJSON(w, 200, shared.Success(map[string]interface{}{
				"shipmentId": s.ID, "trackingNo": s.TrackingNo, "carrier": s.Carrier, "status": s.Status,
				"events": []map[string]string{
					{"time": time.Now().Add(-48*time.Hour).Format("2006-01-02 15:04"), "status": "已揽收", "location": "深圳转运中心"},
					{"time": time.Now().Add(-36*time.Hour).Format("2006-01-02 15:04"), "status": "运输中", "location": "香港国际机场"},
					{"time": time.Now().Add(-20*time.Hour).Format("2006-01-02 15:04"), "status": "到达目的国", "location": "LAX 洛杉矶"},
					{"time": time.Now().Add(-12*time.Hour).Format("2006-01-02 15:04"), "status": "清关中", "location": "US Customs"},
					{"time": time.Now().Add(-4*time.Hour).Format("2006-01-02 15:04"), "status": "派送中", "location": "Local Delivery"},
				},
			})); return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "shipment not found"))
}

func byTenant(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query().Get("tid")
	result := []shared.Shipment{}
	for _, s := range shipments { if s.TenantID == tid { result = append(result, s) } }
	shared.WriteJSON(w, 200, shared.Success(result))
}

func carriers(w http.ResponseWriter, r *http.Request) {
	shared.WriteJSON(w, 200, shared.Success([]map[string]interface{}{
		{"id": "dhl", "name": "DHL Express", "region": "全球", "type": "国际快递", "avgDays": "3-5天", "status": "online"},
		{"id": "fedex", "name": "FedEx", "region": "美国/全球", "type": "国际快递", "avgDays": "3-7天", "status": "online"},
		{"id": "usps", "name": "USPS", "region": "美国", "type": "邮政", "avgDays": "5-10天", "status": "online"},
		{"id": "yanwen", "name": "燕文物流", "region": "东南亚", "type": "专线物流", "avgDays": "7-12天", "status": "online"},
		{"id": "yuntu", "name": "云途物流", "region": "全球", "type": "专线物流", "avgDays": "7-15天", "status": "online"},
		{"id": "jtexpress", "name": "极兔国际", "region": "东南亚", "type": "专线物流", "avgDays": "5-10天", "status": "online"},
		{"id": "cainiao", "name": "菜鸟国际", "region": "全球", "type": "海外仓", "avgDays": "1-3天(本地)", "status": "online"},
	}))
}
