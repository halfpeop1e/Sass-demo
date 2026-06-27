package main

import (
	"net/http"
	"os"

	"cross-border-saas/shared"
)

type tTenant struct {
	ID, Name, Tier, IsolationLevel, Status, Domain string
	QuotaLimit int
}

var tireTenants = []tTenant{
	{ID: "T001", Name: "潮流服饰旗舰店", Tier: "Enterprise", IsolationLevel: "独立数据库", Status: "active", QuotaLimit: 500, Domain: "fashion.saas.com"},
	{ID: "T002", Name: "数码配件专营店", Tier: "Pro", IsolationLevel: "独立Schema", Status: "active", QuotaLimit: 500, Domain: "digital.saas.com"},
	{ID: "T003", Name: "家居好物精选", Tier: "Starter", IsolationLevel: "共享表", Status: "active", QuotaLimit: 100, Domain: "home.saas.com"},
	{ID: "T005", Name: "美妆护肤品牌店", Tier: "Enterprise", IsolationLevel: "独立数据库", Status: "active", QuotaLimit: 500, Domain: "beauty.saas.com"},
}

func main() {
	rt := shared.NewRouter()
	rt.GET("/health", h("tire-engine"))
	rt.POST("/tire/resolve", resolveTenant)
	rt.POST("/tire/validate", validateAccess)
	rt.GET("/tire/isolation/{tenantId}", getIsolation)
	rt.POST("/tire/quota/check", checkQuota)
	port := getEnv("PORT", "8088")
	shared.Start(port, shared.CORS(rt.Build()), "TIRE Engine")
}

func getEnv(k, d string) string { if v := os.Getenv(k); v != "" { return v }; return d }
func h(n string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		shared.WriteJSON(w, 200, shared.HealthResponse{Status: "healthy", Service: n, Version: "v2.0.0", Uptime: shared.GetUptime()})
	}
}

func resolveTenant(w http.ResponseWriter, r *http.Request) {
	var body struct{ Domain string `json:"domain"`; Token string `json:"token,omitempty"` }
	if err := shared.ReadJSON(r, &body); err != nil { shared.WriteJSON(w, 400, shared.Error(400, err.Error())); return }
	for _, t := range tireTenants {
		if t.Domain == body.Domain {
			shared.WriteJSON(w, 200, shared.Success(map[string]interface{}{
				"tenantId": t.ID, "tier": t.Tier, "isolationLevel": t.IsolationLevel, "resolved": true,
			})); return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "tenant not resolved"))
}

func validateAccess(w http.ResponseWriter, r *http.Request) {
	var body struct{ TenantID string `json:"tenantId"`; Resource string `json:"resource"`; Action string `json:"action"` }
	if err := shared.ReadJSON(r, &body); err != nil { shared.WriteJSON(w, 400, shared.Error(400, err.Error())); return }
	valid := false
	for _, t := range tireTenants { if t.ID == body.TenantID && t.Status == "active" { valid = true; break } }
	shared.WriteJSON(w, 200, shared.Success(map[string]interface{}{
		"authorized": valid, "tenantId": body.TenantID, "resource": body.Resource, "action": body.Action,
	}))
}

func getIsolation(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query().Get("tenantId")
	for _, t := range tireTenants {
		if t.ID == tid {
			strategy := map[string]interface{}{
				"isolationLevel": t.IsolationLevel,
				"dbStrategy": "shared_table", "cachePrefix": "tenant:" + tid,
				"sqlFilter": "AND tenant_id = '" + tid + "'",
			}
			if t.Tier == "Enterprise" { strategy["dbStrategy"] = "dedicated_instance"
			} else if t.Tier == "Pro" { strategy["dbStrategy"] = "dedicated_schema" }
			shared.WriteJSON(w, 200, shared.Success(strategy)); return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "tenant not found"))
}

func checkQuota(w http.ResponseWriter, r *http.Request) {
	var body struct{ TenantID string `json:"tenantId"`; Resource string `json:"resource"`; Current int `json:"current"` }
	if err := shared.ReadJSON(r, &body); err != nil { shared.WriteJSON(w, 400, shared.Error(400, err.Error())); return }
	for _, t := range tireTenants {
		if t.ID == body.TenantID {
			allowed := body.Current < t.QuotaLimit
			shared.WriteJSON(w, 200, shared.Success(map[string]interface{}{
				"allowed": allowed, "quota": t.QuotaLimit, "current": body.Current,
				"remaining": t.QuotaLimit - body.Current,
			})); return
		}
	}
	shared.WriteJSON(w, 404, shared.Error(404, "tenant not found"))
}
