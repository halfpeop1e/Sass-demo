import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Statistic,
  Space,
  Typography,
  Progress,
  Tabs,
  Button,
  Tooltip,
} from "antd";
import { Alert as AntAlert } from "antd";
import {
  MonitorOutlined,
  LineChartOutlined,
  AlertOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ApiOutlined,
  ReloadOutlined,
  FireOutlined,
} from "@ant-design/icons";
import {
  generateTimeSeriesData,
  type SystemMetrics,
  alertList,
} from "../data/mockData";
import styles from "./SystemMonitor.module.css";

const { Text, Title } = Typography;

const alertLevelColor: Record<string, string> = {
  "P0-紧急": "#ff4d4f",
  "P1-重要": "#faad14",
  "P2-普通": "#1890ff",
};

export default function SystemMonitor() {
  const [timeSeries, setTimeSeries] = useState<SystemMetrics[]>(() =>
    generateTimeSeriesData(60),
  );
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = generateTimeSeriesData(1);
      setTimeSeries((prev) => {
        const next = [...prev.slice(1), data[0]];
        return next;
      });
      setRefreshCount((c) => c + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const latest = timeSeries[timeSeries.length - 1] || timeSeries[0];
  const recentCount = 15;

  const alertColumns = [
    {
      title: "级别",
      dataIndex: "level",
      key: "level",
      width: 90,
      render: (v: string) => <Tag color={alertLevelColor[v]}>{v}</Tag>,
    },
    { title: "服务", dataIndex: "service", key: "service", width: 140 },
    { title: "告警信息", dataIndex: "message", key: "message", ellipsis: true },
    { title: "时间", dataIndex: "timestamp", key: "timestamp", width: 170 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (v: string) => {
        const m: Record<string, { color: string; text: string }> = {
          active: { color: "red", text: "活跃" },
          acknowledged: { color: "orange", text: "已确认" },
          resolved: { color: "green", text: "已解决" },
        };
        return <Tag color={m[v]?.color}>{m[v]?.text}</Tag>;
      },
    },
  ];

  const renderMiniChart = (
    dataKey: keyof SystemMetrics,
    color: string,
    max: number,
    suffix: string,
  ) => {
    if (!latest) return null;
    const recentData = timeSeries.slice(-recentCount);
    const values = recentData.map((d) => d[dataKey] as number);
    const min = 0;
    const range = max - min;
    return (
      <div>
        <div className={styles.miniChartHeader}>
          <Text className={styles.miniChartValue} style={{ color }}>
            {typeof latest[dataKey] === "number"
              ? (latest[dataKey] as number).toFixed(
                  dataKey === "paymentSuccessRate" || dataKey === "redisHitRate"
                    ? 1
                    : 0,
                )
              : String(latest[dataKey])}
            <Text className={styles.miniChartSuffix}> {suffix}</Text>
          </Text>
          <Text type="secondary" className={styles.miniChartTimeLabel}>
            过去15分钟
          </Text>
        </div>
        <div className={styles.chartBarsContainer}>
          {values.map((v, i) => {
            const h = Math.max(3, ((v as number) / range) * 100);
            return (
              <Tooltip key={i} title={`${(v as number).toFixed(0)}${suffix}`}>
                <div
                  className={styles.chartBar}
                  style={{
                    height: `${h}%`,
                    background: color,
                  }}
                />
              </Tooltip>
            );
          })}
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: "business",
      label: (
        <span>
          <LineChartOutlined /> 业务大盘
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="总QPS">
              {renderMiniChart("totalQps", "#1890ff", 12000, "req/s")}
              <Progress
                percent={
                  latest ? Math.round((latest.totalQps / 12000) * 100) : 0
                }
                size="small"
                strokeColor="#1890ff"
                showInfo={false}
                style={{ marginTop: 4 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="下单速率">
              {renderMiniChart("orderRate", "#52c41a", 80, "单/分钟")}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="支付成功率">
              {renderMiniChart("paymentSuccessRate", "#fa8c16", 100, "%")}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="活跃租户">
              {renderMiniChart("activeTenants", "#722ed1", 2500, "户")}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="ES搜索QPS">
              {renderMiniChart("esSearchQps", "#eb2f96", 1500, "qps")}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="CDN带宽">
              {renderMiniChart("cdnBandwidth", "#13c2c2", 8, "Gbps")}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "tech",
      label: (
        <span>
          <CloudServerOutlined /> 技术大盘
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="P99平均延迟">
              {renderMiniChart("avgP99Latency", "#ff4d4f", 100, "ms")}
              <Progress
                percent={
                  latest ? Math.round((latest.avgP99Latency / 100) * 100) : 0
                }
                size="small"
                strokeColor={
                  latest && latest.avgP99Latency > 80 ? "#ff4d4f" : "#52c41a"
                }
                showInfo={false}
                style={{ marginTop: 4 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="CPU利用率">
              {renderMiniChart("cpuUtilization", "#1890ff", 100, "%")}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="内存利用率">
              {renderMiniChart("memoryUtilization", "#722ed1", 100, "%")}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="Kafka消息吞吐">
              {renderMiniChart("kafkaThroughput", "#faad14", 15000, "msg/s")}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="Redis命中率">
              {renderMiniChart("redisHitRate", "#52c41a", 100, "%")}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "alerts",
      label: (
        <span>
          <AlertOutlined /> 告警中心 (
          {alertList.filter((a) => a.status === "active").length})
        </span>
      ),
      children: (
        <div>
          <AntAlert
            type="error"
            showIcon
            icon={<FireOutlined />}
            message="分级告警规则"
            description={
              <Space vertical size={4}>
                <Text>
                  <Tag color="red">P0-紧急</Tag> API接口错误率&gt;1%且持续2分钟
                  · 核心服务宕机 · 支付渠道异常
                </Text>
                <Text>
                  <Tag color="orange">P1-重要</Tag> P99延迟&gt;500ms且持续5分钟
                  · MySQL主从延迟&gt;10秒 · 消息堆积&gt;10,000
                </Text>
                <Text>
                  <Tag color="blue">P2-普通</Tag> 大Key告警 · 缓存刷新频率预警 ·
                  磁盘使用率提醒
                </Text>
              </Space>
            }
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={alertList}
            columns={alertColumns}
            rowKey="id"
            size="small"
            pagination={false}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>
        <MonitorOutlined /> 系统监控大屏
        <Button
          size="small"
          icon={<ReloadOutlined />}
          className={styles.refreshBtn}
          onClick={() => setTimeSeries(generateTimeSeriesData(60))}
        >
          刷新数据
        </Button>
        <Tag color="processing" className={styles.refreshTag}>
          已刷新 {refreshCount} 次
        </Tag>
      </Title>

      {/* 概览指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className={styles.overviewCard}>
            <Statistic
              title={
                <>
                  <ThunderboltOutlined /> 实时QPS
                </>
              }
              value={latest ? Math.round(latest.totalQps) : "-"}
              styles={{ content: { fontSize: 24 } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className={styles.overviewCard}>
            <Statistic
              title={
                <>
                  <ClockCircleOutlined /> P99延迟
                </>
              }
              value={latest ? `${Math.round(latest.avgP99Latency)}ms` : "-"}
              styles={{
                content: {
                  fontSize: 24,
                  color:
                    latest && latest.avgP99Latency > 80 ? "#ff4d4f" : "#52c41a",
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className={styles.overviewCard}>
            <Statistic
              title={
                <>
                  <DatabaseOutlined /> Kafka吞吐
                </>
              }
              value={latest ? Math.round(latest.kafkaThroughput) : "-"}
              suffix="msg/s"
              styles={{ content: { fontSize: 24 } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className={styles.overviewCard}>
            <Statistic
              title={
                <>
                  <ApiOutlined /> Redis命中
                </>
              }
              value={latest ? latest.redisHitRate.toFixed(1) : "-"}
              suffix="%"
              styles={{
                content: {
                  fontSize: 24,
                  color:
                    latest && latest.redisHitRate > 95 ? "#52c41a" : "#faad14",
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className={styles.overviewCard}>
            <Statistic
              title="支付成功率"
              value={latest ? latest.paymentSuccessRate.toFixed(1) : "-"}
              suffix="%"
              styles={{
                content: {
                  fontSize: 24,
                  color:
                    latest && latest.paymentSuccessRate > 98
                      ? "#52c41a"
                      : "#faad14",
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className={styles.overviewCard}>
            <Statistic
              title="活跃告警"
              value={alertList.filter((a) => a.status === "active").length}
              suffix="条"
              styles={{
                content: {
                  fontSize: 24,
                  color:
                    alertList.filter((a) => a.status === "active").length > 0
                      ? "#ff4d4f"
                      : "#52c41a",
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 监控Tabs */}
      <Card size="small">
        <Tabs defaultActiveKey="business" items={tabItems} />
      </Card>

      {/* 技术栈说明 */}
      <Row gutter={[16, 16]} className={styles.techStackRow}>
        <Col span={24}>
          <Card title="可观测性技术栈 (Observability Stack)" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Card
                  size="small"
                  title="📊 日志监控 (Logging)"
                  className={styles.loggingCard}
                >
                  <Space vertical>
                    <Tag color="green">Filebeat → Kafka → Logstash → ES</Tag>
                    <Text type="secondary">
                      业务操作日志 · 接口访问日志 · 系统异常日志
                    </Text>
                    <Text type="secondary">保留30天 · Kibana可视化检索</Text>
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  title="📈 指标监控 (Metrics)"
                  className={styles.metricsCard}
                >
                  <Space vertical>
                    <Tag color="blue">Prometheus + Grafana</Tag>
                    <Text type="secondary">
                      CPU/内存 · QPS · P99延迟 · 错误率
                    </Text>
                    <Text type="secondary">保留14天 · 预置3大监控面板</Text>
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  title="🔍 链路追踪 (Tracing)"
                  className={styles.tracingCard}
                >
                  <Space vertical>
                    <Tag color="gold">Jaeger + OpenTelemetry</Tag>
                    <Text type="secondary">微服务跨调用链路 · 慢请求追踪</Text>
                    <Text type="secondary">保留7天 · 全链路耗时分析</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
