#!/bin/bash
# =====================================================
#  跨境电商独立站 SaaS 平台 - 一键启动脚本
#  启动顺序：后端微服务 → 买家前端 → 管理后台
# =====================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/demo-backend"
USER_DIR="$SCRIPT_DIR/demo-user"
ADMIN_DIR="$SCRIPT_DIR/demo-dashboard"
MERCHANT_DIR="$SCRIPT_DIR/demo-merchant"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

trap 'kill 0' EXIT

SERVICES=(
  "tenant-service:8081"
  "shop-service:8082"
  "product-service:8083"
  "order-service:8084"
  "payment-service:8085"
  "fulfillment-service:8086"
  "notification-service:8087"
  "tire-engine:8088"
)
API_GATEWAY="api-gateway:8080"

is_port_free() {
  ! lsof -i :$1 >/dev/null 2>&1
}

kill_port() {
  lsof -ti :$1 2>/dev/null | xargs kill -9 2>/dev/null || true
}

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  跨境电商独立站 SaaS 平台 一键启动${NC}"
echo -e "${BLUE}  大型平台设计 | V2 阶段${NC}"
echo -e "${BLUE}=============================================${NC}"

echo -e "\n${YELLOW}[1/4] 释放可能被占用的端口...${NC}"
for svc in "${SERVICES[@]}"; do
  port="${svc#*:}"
  kill_port "$port"
done
kill_port "8080"
kill_port "5173"
kill_port "5174"
kill_port "5175"
sleep 1

echo -e "\n${YELLOW}[2/4] 构建后端微服务...${NC}"
cd "$BACKEND_DIR"
for svc in "${SERVICES[@]}"; do
  name="${svc%%:*}"
  echo -n "  Building $name..."
  cd "$BACKEND_DIR/$name" && go build -o "/tmp/saas-$name" . 2>/dev/null && echo -e " ${GREEN}OK${NC}" || echo -e " ${RED}FAILED${NC}"
done
echo -n "  Building api-gateway..."
cd "$BACKEND_DIR/api-gateway" && go build -o "/tmp/saas-api-gateway" . 2>/dev/null && echo -e " ${GREEN}OK${NC}" || echo -e " ${RED}FAILED${NC}"

echo -e "\n${YELLOW}[3/4] 启动后端微服务 (计 9 个服务)...${NC}"

# 先启动各微服务
for svc in "${SERVICES[@]}"; do
  name="${svc%%:*}"
  port="${svc#*:}"
  if is_port_free "$port"; then
    echo -e "  🚀 $name :${port}"
    "/tmp/saas-$name" &
    sleep 0.3
  else
    echo -e "  ${RED}✗ Port $port busy${NC}"
  fi
done

# 再启动 API Gateway
sleep 1
if is_port_free "8080"; then
  echo -e "  🚀 api-gateway :8080 (入口网关)"
  "/tmp/saas-api-gateway" &
else
  echo -e "  ${RED}✗ Port 8080 busy${NC}"
fi

sleep 2

echo -e "\n${YELLOW}[4/4] 启动前端项目...${NC}"

# 买家端 (端口 5173)
if is_port_free "5173"; then
  echo -e "  🛒 买家端 (CrossMall) :5173"
  cd "$USER_DIR" && npx vite --port 5173 --strictPort &
else
  echo -e "  ${RED}✗ Port 5173 busy${NC}"
fi

# 管理后台 (端口 5174)
if is_port_free "5174"; then
  echo -e "  🏢 管理后台 (运营中心) :5174"
  cd "$ADMIN_DIR" && npx vite --port 5174 --strictPort &
else
  echo -e "  ${RED}✗ Port 5174 busy${NC}"
fi

# 商户端 (端口 5175)
if is_port_free "5175"; then
  echo -e "  🏪 商户中心 :5175"
  cd "$MERCHANT_DIR" && npx vite --port 5175 --strictPort &
else
  echo -e "  ${RED}✗ Port 5175 busy${NC}"
fi

echo -e "\n${GREEN}=============================================${NC}"
echo -e "${GREEN}  全部服务已启动！${NC}"
echo -e "${GREEN}=============================================${NC}"
echo -e ""
echo -e "  📡 API Gateway:    ${BLUE}http://localhost:8080${NC}"
echo -e "  🛒 买家端:         ${BLUE}http://localhost:5173${NC}"
echo -e "  🏢 管理后台:       ${BLUE}http://localhost:5174${NC}"
echo -e "  🏪 商户中心:       ${BLUE}http://localhost:5175${NC}"
echo -e ""
echo -e "  微服务端口："
for svc in "${SERVICES[@]}"; do
  name="${svc%%:*}"
  port="${svc#*:}"
  printf "    %-25s ${BLUE}:%s${NC}\n" "$name" "$port"
done
echo -e ""
echo -e "  ${YELLOW}按 Ctrl+C 停止所有服务${NC}"
echo -e ""

wait
