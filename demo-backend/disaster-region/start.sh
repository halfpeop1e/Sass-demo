#!/bin/bash
# =======================================================
#  灾备区域 (东京) 微服务启动脚本
#  每个服务运行在 9081-9088 端口，对应主区域 8081-8088
# =======================================================
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
BIN_DIR="/tmp"

SERVICES=(
  "tenant-service:8081:9081"
  "shop-service:8082:9082"
  "product-service:8083:9083"
  "order-service:8084:9084"
  "payment-service:8085:9085"
  "fulfillment-service:8086:9086"
  "notification-service:8087:9087"
  "tire-engine:8088:9088"
)

is_port_free() { ! lsof -i :"$1" >/dev/null 2>&1; }
kill_port() { lsof -ti :"$1" 2>/dev/null | xargs kill -9 2>/dev/null || true; }

if [ "$1" = "stop" ]; then
  echo "🛑 停止灾备区域所有服务..."
  for svc in "${SERVICES[@]}"; do
    dport="${svc##*:}"
    kill_port "$dport"
    echo "   已停止 :${dport}"
  done
  exit 0
fi

echo "🔄 清理灾备区域端口..."
for svc in "${SERVICES[@]}"; do
  dport="${svc##*:}"
  kill_port "$dport"
done

echo "🏗️  构建灾备区域二进制..."
for svc in "${SERVICES[@]}"; do
  name="${svc%%:*}"
  pp="${svc#*:}"; pport="${pp%:*}"
  dport="${svc##*:}"
  if [ ! -f "${BIN_DIR}/saas-d-${name}" ]; then
    echo -n "  构建 ${name} (:$dport)..."
    cd "${BACKEND_DIR}/${name}" && go build -o "${BIN_DIR}/saas-d-${name}" . 2>/dev/null && echo " OK" || echo " FAIL"
  fi
done

echo ""
echo "🚀 启动灾备区域 (东京) 微服务..."
for svc in "${SERVICES[@]}"; do
  name="${svc%%:*}"
  pp="${svc#*:}"; pport="${pp%:*}"
  dport="${svc##*:}"
  if is_port_free "$dport"; then
    DISASTER=true REGION="东京" PORT="$dport" "${BIN_DIR}/saas-d-${name}" &
    echo "   🏮 $name :${dport} (东京灾备)  PID=$!"
  else
    echo "   ⚠️  $name :${dport} 端口被占用，跳过"
  fi
done

echo ""
echo "✅ 灾备区域启动完成 (东京, 9081-9088)"
