export interface Tenant {
  id: string;
  name: string;
  tier: 'Starter' | 'Pro' | 'Enterprise';
  isolationLevel: '共享表' | '独立Schema' | '独立数据库';
  status: 'active' | 'suspended' | 'pending';
  spuCount: number;
  orderCount: number;
  apiQps: number;
  quotaLimit: number;
  storageGB: number;
  createdAt: string;
  domain: string;
}

export const tenantList: Tenant[] = [
  {
    id: 'T001', name: '潮流服饰旗舰店', tier: 'Enterprise', isolationLevel: '独立数据库',
    status: 'active', spuCount: 38500, orderCount: 125000, apiQps: 320,
    quotaLimit: 500, storageGB: 250, createdAt: '2025-01-15', domain: 'fashion.saas.com',
  },
  {
    id: 'T002', name: '数码配件专营店', tier: 'Pro', isolationLevel: '独立Schema',
    status: 'active', spuCount: 4200, orderCount: 68000, apiQps: 180,
    quotaLimit: 500, storageGB: 80, createdAt: '2025-03-22', domain: 'digital.saas.com',
  },
  {
    id: 'T003', name: '家居好物精选', tier: 'Starter', isolationLevel: '共享表',
    status: 'active', spuCount: 320, orderCount: 4500, apiQps: 45,
    quotaLimit: 100, storageGB: 12, createdAt: '2025-06-10', domain: 'home.saas.com',
  },
  {
    id: 'T004', name: '运动户外装备', tier: 'Pro', isolationLevel: '独立Schema',
    status: 'active', spuCount: 2800, orderCount: 35000, apiQps: 120,
    quotaLimit: 500, storageGB: 55, createdAt: '2025-02-18', domain: 'sports.saas.com',
  },
  {
    id: 'T005', name: '美妆护肤品牌店', tier: 'Enterprise', isolationLevel: '独立数据库',
    status: 'active', spuCount: 22000, orderCount: 98000, apiQps: 280,
    quotaLimit: 500, storageGB: 180, createdAt: '2025-01-08', domain: 'beauty.saas.com',
  },
  {
    id: 'T006', name: '母婴用品小店', tier: 'Starter', isolationLevel: '共享表',
    status: 'active', spuCount: 180, orderCount: 2200, apiQps: 25,
    quotaLimit: 100, storageGB: 6, createdAt: '2025-07-05', domain: 'baby.saas.com',
  },
  {
    id: 'T007', name: '3C电子专营', tier: 'Enterprise', isolationLevel: '独立数据库',
    status: 'suspended', spuCount: 15000, orderCount: 85000, apiQps: 0,
    quotaLimit: 500, storageGB: 160, createdAt: '2025-04-12', domain: 'threec.saas.com',
  },
  {
    id: 'T008', name: '食品零食铺', tier: 'Starter', isolationLevel: '共享表',
    status: 'pending', spuCount: 50, orderCount: 120, apiQps: 5,
    quotaLimit: 100, storageGB: 2, createdAt: '2025-08-20', domain: 'food.saas.com',
  },
];

export interface Microservice {
  name: string;
  category: '核心业务' | '平台能力' | '基础设施' | '接入层';
  status: 'healthy' | 'degraded' | 'down';
  replicas: number;
  cpuUsage: number;
  memoryUsage: number;
  p99Latency: number;
  qps: number;
  errorRate: number;
  dependencies: string[];
}

export const microserviceList: Microservice[] = [
  { name: 'API Gateway', category: '接入层', status: 'healthy', replicas: 6, cpuUsage: 45, memoryUsage: 52, p99Latency: 12, qps: 8500, errorRate: 0.02, dependencies: [] },
  { name: 'Tenant Service', category: '核心业务', status: 'healthy', replicas: 3, cpuUsage: 35, memoryUsage: 48, p99Latency: 25, qps: 320, errorRate: 0.01, dependencies: ['MySQL', 'Redis'] },
  { name: 'Shop Service', category: '核心业务', status: 'healthy', replicas: 4, cpuUsage: 55, memoryUsage: 62, p99Latency: 45, qps: 1800, errorRate: 0.05, dependencies: ['MySQL', 'Redis', 'S3'] },
  { name: 'Product Service', category: '核心业务', status: 'degraded', replicas: 5, cpuUsage: 72, memoryUsage: 78, p99Latency: 85, qps: 5200, errorRate: 0.12, dependencies: ['MySQL', 'Redis', 'Elasticsearch'] },
  { name: 'Order Service', category: '核心业务', status: 'healthy', replicas: 6, cpuUsage: 60, memoryUsage: 65, p99Latency: 35, qps: 4200, errorRate: 0.03, dependencies: ['MySQL', 'Redis', 'Kafka', 'Product Service'] },
  { name: 'Payment Service', category: '核心业务', status: 'healthy', replicas: 4, cpuUsage: 40, memoryUsage: 45, p99Latency: 120, qps: 2800, errorRate: 0.08, dependencies: ['MySQL', 'Redis', 'Kafka', 'Payment Gateway'] },
  { name: 'Fulfillment Service', category: '核心业务', status: 'healthy', replicas: 3, cpuUsage: 38, memoryUsage: 42, p99Latency: 65, qps: 1500, errorRate: 0.04, dependencies: ['MySQL', 'Kafka', 'Logistics Adapter'] },
  { name: 'Notification Service', category: '核心业务', status: 'healthy', replicas: 2, cpuUsage: 20, memoryUsage: 30, p99Latency: 180, qps: 800, errorRate: 0.06, dependencies: ['Kafka', 'SMTP'] },
  { name: 'TIRE Engine', category: '平台能力', status: 'healthy', replicas: 3, cpuUsage: 28, memoryUsage: 35, p99Latency: 2, qps: 22000, errorRate: 0.001, dependencies: ['Redis', 'MySQL'] },
  { name: 'Payment Router', category: '平台能力', status: 'healthy', replicas: 2, cpuUsage: 30, memoryUsage: 38, p99Latency: 150, qps: 2800, errorRate: 0.15, dependencies: ['Redis', 'Stripe', 'PayPal', 'Xendit'] },
  { name: 'Logistics Adapter', category: '平台能力', status: 'degraded', replicas: 3, cpuUsage: 55, memoryUsage: 50, p99Latency: 320, qps: 1200, errorRate: 0.25, dependencies: ['DHL', 'FedEx', '燕文', '云途'] },
  { name: 'MySQL Cluster', category: '基础设施', status: 'healthy', replicas: 8, cpuUsage: 48, memoryUsage: 72, p99Latency: 8, qps: 35000, errorRate: 0.005, dependencies: [] },
  { name: 'Redis Cluster', category: '基础设施', status: 'healthy', replicas: 6, cpuUsage: 25, memoryUsage: 55, p99Latency: 1, qps: 85000, errorRate: 0.001, dependencies: [] },
  { name: 'Kafka Cluster', category: '基础设施', status: 'healthy', replicas: 5, cpuUsage: 35, memoryUsage: 60, p99Latency: 3, qps: 45000, errorRate: 0.002, dependencies: [] },
  { name: 'Elasticsearch', category: '基础设施', status: 'healthy', replicas: 6, cpuUsage: 42, memoryUsage: 68, p99Latency: 15, qps: 3200, errorRate: 0.01, dependencies: [] },
];

export interface SystemMetrics {
  timestamp: string;
  totalQps: number;
  activeTenants: number;
  orderRate: number;
  paymentSuccessRate: number;
  avgP99Latency: number;
  cpuUtilization: number;
  memoryUtilization: number;
  kafkaThroughput: number;
  redisHitRate: number;
  esSearchQps: number;
  cdnBandwidth: number;
}

export const generateTimeSeriesData = (points: number = 60): SystemMetrics[] => {
  const data: SystemMetrics[] = [];
  const baseTime = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(baseTime.getTime() - i * 60000);
    data.push({
      timestamp: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      totalQps: 6000 + Math.random() * 4000,
      activeTenants: 1800 + Math.floor(Math.random() * 200),
      orderRate: 45 + Math.random() * 15,
      paymentSuccessRate: 98.2 + Math.random() * 1.5,
      avgP99Latency: 45 + Math.random() * 30,
      cpuUtilization: 40 + Math.random() * 20,
      memoryUtilization: 55 + Math.random() * 15,
      kafkaThroughput: 8000 + Math.random() * 4000,
      redisHitRate: 96.5 + Math.random() * 2.5,
      esSearchQps: 800 + Math.random() * 400,
      cdnBandwidth: 4.5 + Math.random() * 2,
    });
  }
  return data;
};

export interface Alert {
  id: string;
  level: 'P0-紧急' | 'P1-重要' | 'P2-普通';
  service: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export const alertList: Alert[] = [
  { id: 'ALT-001', level: 'P1-重要', service: 'Product Service', message: 'P99延迟超过500ms阈值，当前值850ms，持续5分钟', timestamp: '2026-06-27 14:32:15', status: 'active' },
  { id: 'ALT-002', level: 'P0-紧急', service: 'Fulfillment Service', message: '物流适配层 DHL渠道连续失败5次，熔断器已开启', timestamp: '2026-06-27 14:28:40', status: 'active' },
  { id: 'ALT-003', level: 'P1-重要', service: 'MySQL Cluster', message: '主从复制延迟超过10秒，当前延迟15秒', timestamp: '2026-06-27 14:25:10', status: 'acknowledged' },
  { id: 'ALT-004', level: 'P2-普通', service: 'Redis Cluster', message: '大Key告警：tenant_cache:T005商品列表超过1MB', timestamp: '2026-06-27 14:20:05', status: 'active' },
  { id: 'ALT-005', level: 'P2-普通', service: 'CDN', message: 'cdn.saas.com域名缓存刷新频率接近上限（950/1000次）', timestamp: '2026-06-27 14:15:30', status: 'resolved' },
  { id: 'ALT-006', level: 'P1-重要', service: 'Kafka Cluster', message: 'Consumer Group order-consumer 消息堆积超过10000条', timestamp: '2026-06-27 14:10:22', status: 'acknowledged' },
  { id: 'ALT-007', level: 'P0-紧急', service: 'Payment Service', message: 'Stripe支付渠道回调超时率达15%，触发渠道降级切换', timestamp: '2026-06-27 14:05:48', status: 'active' },
];

export interface ScalingEvent {
  id: string;
  service: string;
  type: '扩容' | '缩容' | '定时扩容';
  trigger: string;
  replicasBefore: number;
  replicasAfter: number;
  timestamp: string;
  status: 'success' | 'failed' | 'in_progress';
}

export const scalingHistory: ScalingEvent[] = [
  { id: 'SC-001', service: 'Order Service', type: '扩容', trigger: 'CPU使用率 72% > 70%', replicasBefore: 4, replicasAfter: 6, timestamp: '2026-06-27 14:30:00', status: 'success' },
  { id: 'SC-002', service: 'Product Service', type: '扩容', trigger: '内存使用率 85% > 80%', replicasBefore: 3, replicasAfter: 5, timestamp: '2026-06-27 14:25:00', status: 'success' },
  { id: 'SC-003', service: 'API Gateway', type: '定时扩容', trigger: '大促预扩容策略触发', replicasBefore: 4, replicasAfter: 8, timestamp: '2026-06-27 14:00:00', status: 'success' },
  { id: 'SC-004', service: 'Notification Service', type: '缩容', trigger: 'CPU使用率 25% < 30% 持续10分钟', replicasBefore: 3, replicasAfter: 2, timestamp: '2026-06-27 13:45:00', status: 'success' },
  { id: 'SC-005', service: 'Elasticsearch', type: '扩容', trigger: '活跃连接数 85% > 80%', replicasBefore: 4, replicasAfter: 6, timestamp: '2026-06-27 13:30:00', status: 'success' },
];

export interface PaymentChannel {
  id: string;
  name: string;
  region: string;
  type: '信用卡' | '电子钱包' | '货到付款' | '银行转账';
  successRate: number;
  avgLatency: number;
  status: 'online' | 'degraded' | 'offline';
  qps: number;
}

export const paymentChannels: PaymentChannel[] = [
  { id: 'PC-001', name: 'Stripe', region: '美国/全球', type: '信用卡', successRate: 99.5, avgLatency: 120, status: 'online', qps: 1800 },
  { id: 'PC-002', name: 'PayPal', region: '全球', type: '电子钱包', successRate: 98.8, avgLatency: 150, status: 'degraded', qps: 1200 },
  { id: 'PC-003', name: 'Xendit', region: '印尼/东南亚', type: '电子钱包', successRate: 97.2, avgLatency: 200, status: 'online', qps: 800 },
  { id: 'PC-004', name: 'Omise', region: '泰国', type: '电子钱包', successRate: 98.0, avgLatency: 180, status: 'online', qps: 350 },
  { id: 'PC-005', name: 'Adyen', region: '欧洲/全球', type: '信用卡', successRate: 99.3, avgLatency: 110, status: 'online', qps: 900 },
  { id: 'PC-006', name: 'COD（货到付款）', region: '东南亚', type: '货到付款', successRate: 85.5, avgLatency: -1, status: 'online', qps: 500 },
  { id: 'PC-007', name: 'Doku', region: '印尼', type: '电子钱包', successRate: 96.5, avgLatency: 220, status: 'online', qps: 250 },
  { id: 'PC-008', name: 'Rabbit LINE Pay', region: '泰国', type: '电子钱包', successRate: 97.8, avgLatency: 190, status: 'online', qps: 300 },
];

export interface LogisticsCarrier {
  id: string;
  name: string;
  region: string;
  type: '国际快递' | '专线物流' | '海外仓' | '邮政';
  avgDeliveryDays: string;
  costLevel: '高' | '中' | '低';
  status: 'online' | 'degraded' | 'offline';
  trackingSupport: boolean;
}

export const logisticsCarriers: LogisticsCarrier[] = [
  { id: 'LC-001', name: 'DHL Express', region: '全球', type: '国际快递', avgDeliveryDays: '3-5天', costLevel: '高', status: 'degraded', trackingSupport: true },
  { id: 'LC-002', name: 'FedEx', region: '美国/全球', type: '国际快递', avgDeliveryDays: '3-7天', costLevel: '高', status: 'online', trackingSupport: true },
  { id: 'LC-003', name: 'USPS', region: '美国', type: '邮政', avgDeliveryDays: '5-10天', costLevel: '低', status: 'online', trackingSupport: true },
  { id: 'LC-004', name: '燕文物流', region: '东南亚', type: '专线物流', avgDeliveryDays: '7-12天', costLevel: '中', status: 'online', trackingSupport: true },
  { id: 'LC-005', name: '云途物流', region: '全球', type: '专线物流', avgDeliveryDays: '7-15天', costLevel: '中', status: 'online', trackingSupport: true },
  { id: 'LC-006', name: '极兔国际', region: '东南亚', type: '专线物流', avgDeliveryDays: '5-10天', costLevel: '低', status: 'online', trackingSupport: true },
  { id: 'LC-007', name: '菜鸟国际', region: '全球', type: '海外仓', avgDeliveryDays: '1-3天（本地）', costLevel: '中', status: 'online', trackingSupport: true },
  { id: 'LC-008', name: '万邑通', region: '欧洲/美国', type: '海外仓', avgDeliveryDays: '2-5天', costLevel: '中', status: 'online', trackingSupport: true },
];

export interface SystemLimit {
  category: string;
  description: string;
  strategy: string;
}

export const systemLimits: SystemLimit[] = [
  { category: '单租户API速率', description: 'Starter 100 QPS / Pro 500 QPS / Enterprise 自定义', strategy: 'API Gateway层基于X-Tenant-ID实施令牌桶限流，超限返回HTTP 429' },
  { category: '单租户商品上限', description: 'Starter 500 SPU / Pro 5,000 SPU / Enterprise 50,000 SPU', strategy: 'Product Service创建时校验配额，超限引导套餐升级' },
  { category: '批量导入限制', description: '单次最多1,000行，文件≤10MB', strategy: '超限分批导入，异步任务处理并返回进度报告' },
  { category: '订单超时关单', description: '待付款订单30分钟未支付自动关闭', strategy: '延迟消息队列触发关单，支持商户自定义15-60分钟' },
  { category: '文件上传限制', description: '图片≤5MB，视频≤50MB', strategy: '前端预校验+网关层拦截，超限提示压缩后重新上传' },
  { category: '支付回调重试', description: '最多8次，指数退避 15s→2h', strategy: '超出后触发人工审核工单，提供手动查询补偿接口' },
  { category: 'MySQL单表行数', description: '不超过5,000万行', strategy: 'ShardingSphere按tenant_id水平拆分，提前扩容' },
  { category: 'Redis单Key大小', description: '≤1MB，集合元素≤10,000', strategy: '大Value拆分为多Key，定期扫描大Key并告警' },
  { category: 'Kafka单消息', description: '默认上限1MB', strategy: '大消息先存S3，Kafka仅传递引用Key' },
  { category: 'ES单索引分片', description: '不超过50个分片，30-50GB/分片', strategy: '按月/租户等级拆分索引，ILM策略自动归档冷数据' },
  { category: 'CDN缓存刷新', description: '每域名1,000次URL刷新/小时', strategy: '批量提交刷新任务，合并同域名请求' },
  { category: '灾备RTO/RPO', description: 'RTO≤30分钟，RPO≤5分钟', strategy: 'MySQL异步复制+Kafka MirrorMaker同步+DNS TTL 60s' },
  { category: '第三方接口超时', description: '调用超时5秒，连续5次熔断', strategy: '熔断后自动切换备选渠道，半开状态每30秒探测恢复' },
];

export interface DataScaleEstimate {
  entity: string;
  v1Range: string;
  v2Range: string;
  rowSize: string;
}

export const dataScaleEstimates: DataScaleEstimate[] = [
  { entity: '租户（商户）', v1Range: '500 ~ 2,000', v2Range: '5,000 ~ 20,000', rowSize: '~2 KB' },
  { entity: '店铺', v1Range: '500 ~ 2,000', v2Range: '5,000 ~ 25,000', rowSize: '~5 KB' },
  { entity: '商品 SPU', v1Range: '50,000 ~ 200,000', v2Range: '500,000 ~ 2,000,000', rowSize: '~3 KB' },
  { entity: '商品 SKU', v1Range: '200,000 ~ 800,000', v2Range: '2,000,000 ~ 8,000,000', rowSize: '~1 KB' },
  { entity: '订单（父+子）', v1Range: '10万 ~ 50万/年', v2Range: '500万 ~ 2,000万/年', rowSize: '~4 KB' },
  { entity: '订单明细快照', v1Range: '30万 ~ 150万/年', v2Range: '1,500万 ~ 6,000万/年', rowSize: '~2 KB' },
  { entity: '支付流水', v1Range: '10万 ~ 50万/年', v2Range: '500万 ~ 2,000万/年', rowSize: '~2 KB' },
  { entity: '物流发货单', v1Range: '8万 ~ 40万/年', v2Range: '400万 ~ 1,600万/年', rowSize: '~2 KB' },
  { entity: '物流轨迹事件', v1Range: '50万 ~ 200万/年', v2Range: '2,000万 ~ 8,000万/年', rowSize: '~0.5 KB' },
  { entity: '买家会员', v1Range: '1万 ~ 5万', v2Range: '50万 ~ 200万', rowSize: '~1.5 KB' },
];
