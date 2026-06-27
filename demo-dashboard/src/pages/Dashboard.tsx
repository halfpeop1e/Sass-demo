import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Progress, Tag, Space, Typography, Timeline, Tooltip, Badge, Divider } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  ApiOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  NodeIndexOutlined,
  RadarChartOutlined,
  FireOutlined,
} from '@ant-design/icons';
import {
  generateTimeSeriesData,
  microserviceList,
  alertList,
  tenantList,
} from '../data/mockData';
import { adminApi } from '../api/adminApi';
import styles from './Dashboard.module.css';

const { Text, Title } = Typography;

const categoryColorMap: Record<string, string> = {
  '接入层': '#38bdf8',
  '核心业务': '#34d399',
  '平台能力': '#fbbf24',
  '基础设施': '#a78bfa',
};

const statusColorMap: Record<string, string> = {
  'healthy': '#34d399',
  'degraded': '#fbbf24',
  'down': '#f87171',
};

const alertLevelColor: Record<string, string> = {
  'P0-紧急': '#f87171',
  'P1-重要': '#fbbf24',
  'P2-普通': '#38bdf8',
};

function ServiceStatusBadge({ name }: { name: string }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    adminApi.getServices().then(res => {
      const svcs = res?.data || [];
      setOk(svcs.some((s: { name: string }) => s.name === name));
    }).catch(() => setOk(false));
  }, [name]);
  return <Tag color={ok === null ? 'default' : ok ? 'success' : 'error'}>{name}</Tag>;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(() => {
    const data = generateTimeSeriesData(1);
    return data[data.length - 1];
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const data = generateTimeSeriesData(1);
      setMetrics(data[0]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalTenants = tenantList.length;
  const activeTenants = tenantList.filter(t => t.status === 'active').length;
  const healthyServices = microserviceList.filter(s => s.status === 'healthy').length;
  const totalServices = microserviceList.length;
  const byCategory: Record<string, typeof microserviceList> = {};
  microserviceList.forEach(s => {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  });

  const tierDistribution = {
    Starter: tenantList.filter(t => t.tier === 'Starter').length,
    Pro: tenantList.filter(t => t.tier === 'Pro').length,
    Enterprise: tenantList.filter(t => t.tier === 'Enterprise').length,
  };

  return (
    <div>
      <Title level={4} className={styles.pageTitle}>
        <RadarChartOutlined /> 平台运行总览
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card size="small" styles={{ body: { padding: '8px 16px' } }}>
            <Space split={<Divider type="vertical" />} wrap>
              <Text strong>后端微服务：</Text>
              {['tenants','shops','products','orders','payments','shipments','tire','api-gateway'].map(svc => (
                <ServiceStatusBadge key={svc} name={svc} />
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="实时 QPS"
              value={Math.round(metrics.totalQps)}
              prefix={<ThunderboltOutlined />}
              suffix="req/s"
              valueStyle={{ color: '#38bdf8' }}
            />
            <Progress percent={Math.round(metrics.totalQps / 10000 * 100)} size="small" strokeColor="#38bdf8" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="活跃租户"
              value={activeTenants}
              prefix={<TeamOutlined />}
              suffix={`/ ${totalTenants}`}
            />
            <Progress percent={activeTenants / totalTenants * 100} size="small" strokeColor="#34d399" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="服务健康率"
              value={healthyServices}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${totalServices}`}
              valueStyle={{ color: healthyServices === totalServices ? '#34d399' : '#fbbf24' }}
            />
            <Progress percent={healthyServices / totalServices * 100} size="small" strokeColor="#34d399" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="支付成功率"
              value={metrics.paymentSuccessRate}
              precision={2}
              prefix={metrics.paymentSuccessRate > 98 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
              valueStyle={{ color: metrics.paymentSuccessRate > 98 ? '#34d399' : '#fbbf24' }}
            />
            <Progress percent={metrics.paymentSuccessRate} size="small" strokeColor="#34d399" showInfo={false} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.sectionRow}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small"><Statistic title="P99延迟" value={Math.round(metrics.avgP99Latency)} suffix="ms" valueStyle={{ fontSize: 20 }} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small"><Statistic title="CPU利用率" value={Math.round(metrics.cpuUtilization)} suffix="%" valueStyle={{ fontSize: 20 }} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small"><Statistic title="内存利用率" value={Math.round(metrics.memoryUtilization)} suffix="%" valueStyle={{ fontSize: 20 }} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small"><Statistic title="Redis命中率" value={metrics.redisHitRate} precision={1} suffix="%" valueStyle={{ fontSize: 20, color: '#34d399' }} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small"><Statistic title="Kafka吞吐" value={Math.round(metrics.kafkaThroughput)} suffix="msg/s" valueStyle={{ fontSize: 20 }} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small"><Statistic title="CDN带宽" value={metrics.cdnBandwidth} precision={1} suffix="Gbps" valueStyle={{ fontSize: 20 }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.sectionRow}>
        <Col xs={24} lg={14}>
          <Card title={<><GlobalOutlined /> 四层架构：控制面与数据面物理隔离</>} size="small">
            <div className={styles.fourLayerContainer}>
              <div className={`${styles.layerCard} ${styles.accessLayer}`}>
                <Space>
                  <Tag color="blue" icon={<GlobalOutlined />}>接入层 Access Layer</Tag>
                  <Text type="secondary">GeoDNS · CDN边缘加速 · WAF防护 · API Gateway (Kong/APISIX)</Text>
                </Space>
                <div className={styles.layerTags}>
                  <Tag color="blue">HTTPS终结</Tag>
                  <Tag color="blue">OAuth2/JWT鉴权</Tag>
                  <Tag color="blue">租户域名解析</Tag>
                  <Tag color="blue">X-Tenant-ID注入</Tag>
                  <Tag color="blue">全局限流</Tag>
                  <Tag color="blue">熔断保护</Tag>
                  <Tag color="blue">协议转换(gRPC/REST)</Tag>
                </div>
              </div>
              <div className={styles.arrowDivider}>⬇️ 经鉴权与租户标识注入后路由 ⬇️</div>
              <div className={`${styles.layerCard} ${styles.businessLayer}`}>
                <Space>
                  <Tag color="green" icon={<ApiOutlined />}>业务层 Business Layer</Tag>
                  <Text type="secondary">自治微服务集群 · 独立Schema · gRPC/Kafka通信</Text>
                </Space>
                <div className={styles.layerTags}>
                  {byCategory['核心业务']?.map(s => (
                    <Tooltip key={s.name} title={`${s.qps} QPS | P99: ${s.p99Latency}ms | ${s.replicas}副本`}>
                      <Tag color={statusColorMap[s.status]} style={{ cursor: 'pointer' }}>
                        {s.name} <Badge status={s.status === 'healthy' ? 'success' : s.status === 'degraded' ? 'warning' : 'error'} />
                      </Tag>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <div className={styles.arrowDivider}>⬇️ 标准SDK与中间件调用 ⬇️</div>
              <div className={`${styles.layerCard} ${styles.platformLayer}`}>
                <Space>
                  <Tag color="gold" icon={<NodeIndexOutlined />}>平台能力层 Platform Capability Layer</Tag>
                  <Text type="secondary">可复用技术组件 · 跨境业务中间件 · TIRE引擎</Text>
                </Space>
                <div className={styles.layerTags}>
                  <Tag color="orange">TIRE多租户引擎</Tag>
                  <Tag color="orange">统一支付路由</Tag>
                  <Tag color="orange">统一物流适配</Tag>
                  <Tag color="orange">Kafka事件总线</Tag>
                  <Tag color="orange">Elasticsearch</Tag>
                  <Tag color="orange">Redis Cluster</Tag>
                  <Tag color="orange">对象存储 S3/OSS</Tag>
                </div>
              </div>
              <div className={styles.arrowDivider}>⬇️ 标准化PV/PVC·Service/DNS·ConfigMap/Secret ⬇️</div>
              <div className={`${styles.layerCard} ${styles.infraLayer}`}>
                <Space>
                  <Tag color="purple" icon={<CloudServerOutlined />}>基础设施层 Infrastructure Layer</Tag>
                  <Text type="secondary">K8s集群 · MySQL分库分表 · Redis Cluster · 可观测性体系</Text>
                </Space>
                <div className={styles.layerTags}>
                  <Tag color="purple">K8s (HPA/VPA)</Tag>
                  <Tag color="purple">MySQL (ShardingSphere)</Tag>
                  <Tag color="purple">Redis Sentinel</Tag>
                  <Tag color="purple">Kafka Broker</Tag>
                  <Tag color="purple">ES Data Node</Tag>
                  <Tag color="purple">Prometheus+Grafana</Tag>
                  <Tag color="purple">Jaeger链路追踪</Tag>
                  <Tag color="purple">ArgoCD (GitOps)</Tag>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title={<><SafetyCertificateOutlined /> 服务健康状态</>} size="small">
            {Object.entries(byCategory).map(([cat, services]) => (
              <div key={cat} className={styles.categoryLabel}>
                <Text strong style={{ color: categoryColorMap[cat] }}>{cat}</Text>
                {services.map(s => (
                  <div key={s.name} className={styles.serviceRow}>
                    <Badge status={s.status === 'healthy' ? 'success' : s.status === 'degraded' ? 'warning' : 'error'} />
                    <Text className={styles.serviceName}>{s.name}</Text>
                    <Text type="secondary" className={styles.serviceMeta}>
                      {s.replicas}副本 | P99:{s.p99Latency}ms | {s.qps}QPS
                    </Text>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.sectionRow}>
        <Col xs={24} md={12}>
          <Card title={<><TeamOutlined /> 租户套餐分布与隔离策略</>} size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" className={`${styles.tierCard} ${styles.tierCardStarter}`}>
                  <Statistic title="Starter" value={tierDistribution.Starter} suffix="户" valueStyle={{ color: '#34d399', fontSize: 28 }} />
                  <Text type="secondary" className={styles.tierSubText}>共享表 | 100 QPS</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className={`${styles.tierCard} ${styles.tierCardPro}`}>
                  <Statistic title="Pro" value={tierDistribution.Pro} suffix="户" valueStyle={{ color: '#fbbf24', fontSize: 28 }} />
                  <Text type="secondary" className={styles.tierSubText}>独立Schema | 500 QPS</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className={`${styles.tierCard} ${styles.tierCardEnterprise}`}>
                  <Statistic title="Enterprise" value={tierDistribution.Enterprise} suffix="户" valueStyle={{ color: '#38bdf8', fontSize: 28 }} />
                  <Text type="secondary" className={styles.tierSubText}>独立数据库 | 自定义</Text>
                </Card>
              </Col>
            </Row>
            <div className={styles.storageProgress}>
              <Text strong>混合存储阶梯模型：</Text>
              <Progress
                percent={70}
                success={{ percent: 70, strokeColor: '#34d399' }}
                strokeColor="#fbbf24"
                format={() => '70% 共享表 + 20% 独立Schema + 10% 独立库'}
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<><FireOutlined style={{ color: '#f87171' }} /> 实时告警</>} size="small">
            {alertList.filter(a => a.status !== 'resolved').map(alert => (
              <div key={alert.id} className={`${styles.alertCard} ${alert.level === 'P0-紧急' ? styles.alertCritical : alert.level === 'P1-重要' ? styles.alertImportant : styles.alertNormal}`}>
                <Space>
                  <Tag color={alertLevelColor[alert.level]} style={{ margin: 0 }}>{alert.level}</Tag>
                  <Text strong style={{ fontSize: 13 }}>{alert.service}</Text>
                </Space>
                <div className={styles.alertMessage}>{alert.message}</div>
                <Text type="secondary" className={styles.alertTime}>{alert.timestamp}</Text>
              </div>
            ))}
            {alertList.filter(a => a.status !== 'resolved').length === 0 && (
              <Text type="success"><CheckCircleOutlined /> 当前无活跃告警</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.sectionRow}>
        <Col span={24}>
          <Card title={<><ShoppingCartOutlined /> 核心交易链路：买家下单全流程</>} size="small">
            <Timeline
              items={[
                { color: 'blue', content: <><Text strong>买家端 → CDN → API Gateway</Text><br /><Text type="secondary">CDN动态请求回源，Gateway校验JWT Token，根据店铺域名识别tenant_id，注入X-Tenant-ID</Text></> },
                { color: 'green', content: <><Text strong>Order Service 创建订单</Text><br /><Text type="secondary">创建待付款订单，gRPC调用Product Service锁定库存（Redis分布式锁+MySQL行级锁），调用Tax Service计算税费</Text></> },
                { color: 'orange', content: <><Text strong>Payment Service → 支付路由引擎</Text><br /><Text type="secondary">引擎根据买家国家+币种+金额+通道健康度选择最优支付渠道（美国→Stripe，印尼→Xendit），生成汇率快照</Text></> },
                { color: 'purple', content: <><Text strong>异步回调 → Kafka事件驱动</Text><br /><Text type="secondary">支付回调验签+幂等校验→发布payment.success事件→Order Service消费更新订单→Fulfillment Service创建发货单</Text></> },
                { color: 'green', content: <><Text strong>物流履约 → 通知买家</Text><br /><Text type="secondary">物流适配层选择最优渠道，发起3PL下单→Notification Service发送邮件/短信确认</Text></> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
