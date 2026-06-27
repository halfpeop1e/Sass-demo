# 跨境电商独立站 SaaS 平台

> 面向海外市场的多租户电商 SaaS 系统，展示大型跨境零售平台的分层架构设计。

基于 **Go 微服务** 构建后端集群，**React + TypeScript + antd** 实现三端前端门户，覆盖买家购物、商户运营、平台管理的全业务链路。内置 TIRE 多租户隔离引擎与双 Region 真实容灾机制。

---

## 系统架构

```
                         ┌──────────────────────────┐
                         │   API Gateway (:8080)     │  ← 限流 / CORS / 自动容灾切换
                         └──────────┬───────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
    ┌─────────▼─────┐   ┌──────────▼──────┐   ┌─────────▼─────┐
    │  tenant-service │   │  shop-service   │   │ product-service│   ... × 8
    │     (:8081)     │   │    (:8082)      │   │    (:8083)     │
    └─────────────────┘   └─────────────────┘   └────────────────┘
            主区域（华东，端口 8081 - 8088）

                             ║ 实时健康检测 3s ║
                             ║ 自动故障切换       ║

    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
    │  tenant-service │   │  shop-service   │   │ product-service │   ... × 8
    │     (:9081)     │   │    (:9082)      │   │    (:9083)     │
    └─────────────────┘   └─────────────────┘   └─────────────────┘
            灾备区域（东京，端口 9081 - 9088）
```

### 前端门户矩阵

| 门户 | 端口 | 角色 | 核心功能 |
|------|------|------|----------|
| **demo-user** | 5173 | 🛒 消费者 | 店铺浏览、商品搜索、购物车、下单支付、物流追踪 |
| **demo-merchant** | 5175 | 🏪 商户 | 经营仪表盘、多店铺管理、商品 CRUD、订单发货处理 |
| **demo-dashboard** | 5174 | 🏢 平台运营 | 租户管理、微服务拓扑、实时监控、弹性伸缩、灾备演练 |

### 后端微服务矩阵

| 服务 | 端口 | 职责域 | 核心能力 |
|------|------|--------|----------|
| **api-gateway** | 8080 | 网关层 | 反向代理、租户级限流、CORS、双 Region 自动故障切换 |
| **tenant-service** | 8081 | 租户域 | 租户注册入驻、套餐升降级、配额管理 |
| **shop-service** | 8082 | 店铺域 | 店铺 CRUD、主题装修、CDN 发布与回滚 |
| **product-service** | 8083 | 商品域 | SPU/SKU 商品模型、多语言标题、多币种标价 |
| **order-service** | 8084 | 交易域 | 订单全生命周期（下单→支付→发货→签收） |
| **payment-service** | 8085 | 支付域 | 多渠道支付路由（Stripe/PayPal/Xendit 等） |
| **fulfillment-service** | 8086 | 物流域 | 物流单生成、轨迹追踪、全球承运商对接 |
| **notification-service** | 8087 | 通知域 | 买家/商户实时通知推送 |
| **tire-engine** | 8088 | 租户隔离引擎 | 域名解析租户、隔离级别校验、资源配额检查 |

---

## 技术架构特性

### 多租户隔离（TIRE 引擎）

| 套餐等级 | 隔离模式 | 适用规模 |
|----------|----------|----------|
| **Starter** | 共享数据表 | SPU ≤ 500，日订单 ≤ 100 |
| **Pro** | 独立 Schema | SPU ≤ 5,000，日订单 ≤ 2,000 |
| **Enterprise** | 独立数据库 | SPU ≤ 50,000，日订单 ≤ 10,000 |

TIRE 引擎接管租户识别→隔离级别判定→会话注入→资源配额校验的全链路，确保多租户数据安全与资源公平。

### 双 Region 真实容灾

API Gateway 每 3 秒对主区域 8 个微服务进行健康探测。主区域全部不可用时，**自动将流量切换至灾备区域**（东京，9081-9088），恢复后自动切回。

```bash
# 启动灾备区域
bash demo-backend/disaster-region/start.sh

# 模拟机房着火 — 真实杀掉主区域全部进程
curl -X POST http://localhost:8080/api/disaster/fire

# 灾备区域接管，业务 API 正常响应
curl http://localhost:8080/api/products  # → 200 OK

# 一键恢复主区域
curl -X POST http://localhost:8080/api/disaster/recover
```

**已验证链路：** 着火 → 3s 自动检测 → 切换灾备 → 业务 API 正常 → 恢复主区域 → 自动切回。

### 熔断与限流

每个微服务独立配置熔断器（5 次连续失败/30s 冷却窗口），API Gateway 按租户维度（`X-Tenant-ID`）实施令牌桶限流（500 QPS/租户），保障平台稳定性。

---

## 快速开始

### 环境要求

- **Go** ≥ 1.21
- **Node.js** ≥ 20
- **npm**

### 一键启动

```bash
git clone <本仓库>
cd Sass-demo
bash run-all.sh
```

脚本自动完成 Go 微服务编译与启动，并拉起三端前端：

| 服务 | 地址 |
|------|------|
| API Gateway | http://localhost:8080 |
| 消费者端 | http://localhost:5173 |
| 商户中心 | http://localhost:5175 |
| 管理后台 | http://localhost:5174 |

### 分步启动

```bash
# 后端：构建并启动 9 个微服务
cd demo-backend
for svc in tenant-service shop-service product-service order-service \
           payment-service fulfillment-service notification-service tire-engine; do
  cd "$svc" && go build -o /tmp/saas-$svc . && /tmp/saas-$svc &
done
cd api-gateway && go build -o /tmp/saas-api-gateway . && /tmp/saas-api-gateway &

# 前端：分别启动
cd ../demo-user      && npm install && npm run dev    # 消费者 :5173
cd ../demo-merchant  && npm install && npm run dev    # 商户   :5175
cd ../demo-dashboard  && npm install && npm run dev    # 管理后台 :5174
```

---

## 项目结构

```
Sass-demo/
├── run-all.sh                         # 一键启动脚本
├── README.md
├── .gitignore
├── demo-backend/                      # Go 微服务集群
│   ├── shared/                        # 共享组件（类型定义、路由、CORS、熔断器）
│   ├── api-gateway/                   # API 网关（含双 Region 容灾）
│   ├── disaster-region/start.sh       # 灾备区域启动脚本
│   ├── tenant-service/                # 租户服务
│   ├── shop-service/                  # 店铺服务
│   ├── product-service/               # 商品服务
│   ├── order-service/                 # 订单服务
│   ├── payment-service/               # 支付服务
│   ├── fulfillment-service/           # 物流履约服务
│   ├── notification-service/          # 通知服务
│   └── tire-engine/                   # TIRE 多租户隔离引擎
├── demo-user/                         # 消费者前端（React）
├── demo-dashboard/                    # 管理后台（React）
└── demo-merchant/                     # 商户中心（React）
```

---

## 技术栈

| 层次 | 技术选型 |
|------|----------|
| **前端** | React 19 · TypeScript · Vite 8 · antd 6 · React Router 7 |
| **后端** | Go 1.21 · net/http · sync（熔断器 / 限流器） |
| **架构** | 微服务 · API Gateway · TIRE 多租户引擎 |
| **可靠性** | 双 Region 容灾 · 自动故障切换（≤3s）· 熔断降级 · 租户级限流 |

---

## 业务全链路

### 消费者流程
浏览店铺广场 → 搜索/筛选商品 → 商品详情 → 加入购物车 → 提交订单 → 支付 → 查看订单 → 物流追踪

### 商户流程
注册入驻 → 创建店铺 → 店铺装修 → 发布上线 → 商品上架 → 接单 → 发货处理 → 订单完成

### 平台运营
租户全生命周期管理 → 实时监控大盘 → 微服务拓扑 → 弹性伸缩策略 → 灾备演练 → 系统瓶颈评估

---

## 许可证

MIT
