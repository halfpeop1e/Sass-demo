# Cross-Border SaaS Platform (跨境电商独立站 SaaS 平台)

A full-stack multi-tenant e-commerce SaaS platform demonstrating a large-scale cross-border retail architecture. Built with **Go** microservices on the backend and **React + TypeScript + antd** for three separate frontend portals.

---

## 🏗️ Architecture

```
                              ┌─────────────────────┐
                              │    API Gateway :8080  │  ← Go (rate-limit / CORS / disaster-recovery)
                              └──────┬────────┬──────┘
                                     │        │
       ┌─────────────────────────────┤        ├─────────────────────────┐
       │                             │                         (disaster region)
  ┌────▼────┐ ┌────▼────┐ ┌────▼────┐                  ┌────▼────┐      ...
  │ tenants │ │  shops  │ │ products│  ... × 8  svc     │ tenants │
  │  :8081  │ │  :8082  │ │  :8083  │                  │  :9081  │
  └─────────┘ └─────────┘ └─────────┘                  └─────────┘
       主区域 (华东，8081-8088)                         灾备区域 (东京，9081-9088)
```

### Frontend Portals (React + Vite + antd)

| Portal | Port | Role | Key Features |
|--------|------|------|--------------|
| **demo-user** | 5173 | 🛒 Buyer | Browse shops/products, search, cart, order, pay, track |
| **demo-dashboard** | 5174 | 🏢 Admin | Tenant management, monitoring, scaling, disaster recovery |
| **demo-merchant** | 5175 | 🏪 Merchant | Dashboard, shop management, product CRUD, order fulfillment |

### Backend Microservices (Go)

| Service | Port | Responsibility |
|---------|------|----------------|
| **api-gateway** | 8080 | Reverse proxy, rate limiting, CORS, dual-region auto-failover |
| **tenant-service** | 8081 | Tenant lifecycle (register, upgrade, quota) |
| **shop-service** | 8082 | Shop CRUD, publish to CDN |
| **product-service** | 8083 | Product inventory (SPU/SKU, i18n, multi-currency) |
| **order-service** | 8084 | Order lifecycle (create → ship → complete) |
| **payment-service** | 8085 | Payment channels (Stripe, multi-currency) |
| **fulfillment-service** | 8086 | Shipment tracking, carrier integration |
| **notification-service** | 8087 | Buyer/merchant notifications |
| **tire-engine** | 8088 | TIRE multi-tenant isolation engine (resolve/validate/quota) |

---

## 🚀 Quick Start

### Prerequisites
- **Go 1.21+**
- **Node.js 20+**
- **npm** (or pnpm/yarn)

### One-Click Startup

```bash
bash run-all.sh
```

This builds all 9 Go microservices to `/tmp/` and starts:
- API Gateway → `http://localhost:8080`
- Buyer Portal → `http://localhost:5173`
- Admin Dashboard → `http://localhost:5174`
- Merchant Center → `http://localhost:5175`

### Manual Startup

```bash
# 1. Build & run backend
cd demo-backend
for dir in tenant-service shop-service product-service order-service \
           payment-service fulfillment-service notification-service tire-engine; do
  cd "$dir" && go build -o /tmp/saas-$dir . && /tmp/saas-$dir &
done
cd api-gateway && go build -o /tmp/saas-api-gateway . && /tmp/saas-api-gateway &

# 2. Start frontends
cd ../demo-user      && npm install && npm run dev          # Buyer :5173
cd ../demo-dashboard  && npm install && npm run dev          # Admin :5174
cd ../demo-merchant  && npm install && npm run dev           # Merchant :5175
```

---

## 🔥 Disaster Recovery (Real Dual-Region)

The API Gateway actively monitors primary region (8081-8088) health every 3 seconds.

```bash
# Start disaster region (Tokyo, ports 9081-9088)
bash demo-backend/disaster-region/start.sh

# Simulate datacenter fire — actually kills primary processes
curl -X POST http://localhost:8080/api/disaster/fire

# Gateway auto-detects and routes ALL traffic to disaster region in ≤3s
# Buyer/merchant API calls work normally through disaster region

# Recover primary region — restarts processes and auto-switches back
curl -X POST http://localhost:8080/api/disaster/recover
```

**Verified flow:** Fire → auto-detect → switch to disaster (≤3s) → business APIs normal → recover primary → auto-switch back.

---

## 📁 Project Structure

```
Sass-demo/
├── run-all.sh                         # One-click startup
├── README.md
├── .gitignore
├── demo-backend/
│   ├── shared/                        # Shared library (types, router, CORS, circuit-breaker)
│   ├── api-gateway/                   # Entry gateway with DR auto-failover
│   ├── disaster-region/start.sh       # Launch backup region (Tokyo, 9081-9088)
│   ├── tenant-service/
│   ├── shop-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── fulfillment-service/
│   ├── notification-service/
│   └── tire-engine/
├── demo-user/                         # Buyer portal (React)
├── demo-dashboard/                    # Admin dashboard (React)
└── demo-merchant/                     # Merchant center (React)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8, antd 6, React Router 7 |
| **Backend** | Go 1.21, net/http, sync (circuit-breaker) |
| **Architecture** | Microservices, API Gateway pattern, Multi-tenant (TIRE) |
| **Reliability** | Dual-region DR, auto-failover ≤3s, health monitoring |

---

## ▶️ Development

```bash
# Backend — build a single service
cd demo-backend/api-gateway && go build -o /tmp/saas-gw . && PORT=8080 /tmp/saas-gw

# Frontend — dev with HMR
cd demo-user && npm run dev       # :5173
cd demo-dashboard && npm run dev   # :5174
cd demo-merchant && npm run dev   # :5175
```

---

## 📜 License

MIT
