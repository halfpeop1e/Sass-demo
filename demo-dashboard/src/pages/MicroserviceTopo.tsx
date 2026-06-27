import { useState } from 'react';
import {
  Row, Col, Card, Table, Tag, Progress, Space, Typography, Badge,
  Tooltip, Divider, Descriptions,
} from 'antd';
import {
  ApartmentOutlined,
  NodeIndexOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  SwapOutlined,
  SendOutlined,
  HddOutlined,
} from '@ant-design/icons';
import { microserviceList, type Microservice } from '../data/mockData';
import styles from './MicroserviceTopo.module.css';

const { Text, Title } = Typography;

const categoryColorMap: Record<string, string> = {
  '接入层': '#1890ff',
  '核心业务': '#52c41a',
  '平台能力': '#faad14',
  '基础设施': '#722ed1',
};

const statusIconMap: Record<string, React.ReactNode> = {
  healthy: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  degraded: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
  down: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
};

const statusLabelMap: Record<string, string> = {
  healthy: '健康',
  degraded: '降级',
  down: '宕机',
};

export default function MicroserviceTopo() {
  const [selectedService, setSelectedService] = useState<Microservice | null>(null);

  const columns = [
    { title: '服务名称', dataIndex: 'name', key: 'name', width: 160,
      render: (v: string, r: Microservice) => (
        <Space>
          {statusIconMap[r.status]}
          <Text strong style={{ cursor: 'pointer' }} onClick={() => setSelectedService(r)}>{v}</Text>
        </Space>
      ) },
    { title: '分类', dataIndex: 'category', key: 'category', width: 90,
      render: (v: string) => <Tag color={categoryColorMap[v]}>{v}</Tag> },
    { title: '副本数', dataIndex: 'replicas', key: 'replicas', width: 70 },
    { title: 'CPU', dataIndex: 'cpuUsage', key: 'cpuUsage', width: 100,
      render: (v: number) => <Progress percent={v} size="small" strokeColor={v > 70 ? '#ff4d4f' : '#52c41a'} /> },
    { title: '内存', dataIndex: 'memoryUsage', key: 'memoryUsage', width: 100,
      render: (v: number) => <Progress percent={v} size="small" strokeColor={v > 80 ? '#ff4d4f' : '#1890ff'} /> },
    { title: 'P99延迟', dataIndex: 'p99Latency', key: 'p99Latency', width: 90,
      render: (v: number) => (
        <Text style={{ color: v > 200 ? '#ff4d4f' : v > 100 ? '#faad14' : '#52c41a' }}>
          {v}ms
        </Text>
      ) },
    { title: 'QPS', dataIndex: 'qps', key: 'qps', width: 80,
      render: (v: number) => v.toLocaleString() },
    { title: '错误率', dataIndex: 'errorRate', key: 'errorRate', width: 80,
      render: (v: number) => (
        <Text style={{ color: v > 0.1 ? '#ff4d4f' : v > 0.05 ? '#faad14' : '#52c41a' }}>
          {v.toFixed(2)}%
        </Text>
      ) },
    { title: '依赖', dataIndex: 'dependencies', key: 'dependencies', width: 200,
      render: (deps: string[]) => deps.length > 0 ? deps.map(d => <Tag key={d} style={{ marginBottom: 2 }}>{d}</Tag>) : <Text type="secondary">—</Text> },
  ];

  const byCategory: Record<string, Microservice[]> = {};
  microserviceList.forEach(s => {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  });

  return (
    <div>
      <Title level={4}><ApartmentOutlined /> 微服务拓扑与架构视图</Title>

      {/* 服务网络拓扑可视化 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="微服务调用关系拓扑（gRPC同步 + Kafka异步）" size="small">
            <div className={styles.topoContainer}>
              {/* 接入层 */}
              <div className={styles.gatewayNode}>
                <div className={styles.gatewayBox}>
                  <ApiOutlined className={styles.gatewayIcon} />
                  <Text strong className={styles.gatewayTitle}>API Gateway (Kong/APISIX)</Text>
                  <br />
                  <Text type="secondary" className={styles.gatewaySub}>6 Pods | JWT鉴权 | 租户识别 | 限流熔断</Text>
                </div>
              </div>

              <div className={styles.routeDivider}>
                <SwapOutlined /> 路由分发 <SwapOutlined />
              </div>

              {/* 核心业务层 */}
              <div className={styles.serviceGrid}>
                {byCategory['核心业务']?.map(s => (
                  <Tooltip key={s.name} title={`P99: ${s.p99Latency}ms | ${s.replicas}副本 | ${s.qps}QPS`}>
                    <div style={{
                      border: `2px solid ${s.status === 'healthy' ? '#52c41a' : '#faad14'}`,
                      borderRadius: 8,
                      padding: '8px 14px',
                      background: s.status === 'healthy' ? '#f6ffed' : '#fffbe6',
                      cursor: 'pointer',
                      textAlign: 'center',
                      minWidth: 120,
                    }}
                      onClick={() => setSelectedService(s)}
                    >
                      {statusIconMap[s.status]}
                      <Text style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{s.name}</Text>
                    </div>
                  </Tooltip>
                ))}
              </div>

              <div className={styles.kafkaEventBus}>
                <div className={styles.kafkaBox}>
                  <Text strong className={styles.kafkaLabel}>
                    <SendOutlined /> Kafka 事件总线（异步通信 + Outbox发件箱 + 死信队列）
                  </Text>
                  <br />
                  <Text type="secondary" className={styles.kafkaTopics}>
                    payment.success | order.paid | shipment.created | tenant.created | inventory.reserved
                  </Text>
                </div>
              </div>

              {/* 平台能力层 */}
              <div className={styles.serviceGrid}>
                {byCategory['平台能力']?.map(s => (
                  <Tooltip key={s.name} title={`P99: ${s.p99Latency}ms | ${s.replicas}副本`}>
                    <div style={{
                      border: '2px solid #faad14',
                      borderRadius: 8,
                      padding: '6px 12px',
                      background: '#fffbe6',
                      cursor: 'pointer',
                      textAlign: 'center',
                      minWidth: 100,
                    }}
                      onClick={() => setSelectedService(s)}
                    >
                      {statusIconMap[s.status]}
                      <Text style={{ fontSize: 11, display: 'block', marginTop: 4 }}>{s.name}</Text>
                    </div>
                  </Tooltip>
                ))}
              </div>

              {/* 基础设施层 */}
              <div className={styles.serviceGrid}>
                {byCategory['基础设施']?.map(s => (
                  <Tooltip key={s.name} title={`P99: ${s.p99Latency}ms | ${s.replicas}节点`}>
                    <div style={{
                      border: '2px solid #722ed1',
                      borderRadius: 8,
                      padding: '6px 12px',
                      background: '#f9f0ff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                      onClick={() => setSelectedService(s)}
                    >
                      <DatabaseOutlined style={{ color: '#722ed1' }} />
                      <Text style={{ fontSize: 11, display: 'block', marginTop: 4 }}>{s.name}</Text>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        {/* 选中服务详情 */}
        <Col xs={24} lg={10}>
          <Card title="服务详情" size="small">
            {selectedService ? (
              <div>
                <Space style={{ marginBottom: 12 }}>
                  {statusIconMap[selectedService.status]}
                  <Title level={5} style={{ margin: 0 }}>{selectedService.name}</Title>
                  <Tag color={categoryColorMap[selectedService.category]}>{selectedService.category}</Tag>
                </Space>

                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="状态">
                    <Badge status={selectedService.status === 'healthy' ? 'success' : selectedService.status === 'degraded' ? 'warning' : 'error'}
                      text={statusLabelMap[selectedService.status]} />
                  </Descriptions.Item>
                  <Descriptions.Item label="副本数">{selectedService.replicas} Pods</Descriptions.Item>
                  <Descriptions.Item label="CPU使用率">
                    <Progress percent={selectedService.cpuUsage} size="small"
                      strokeColor={selectedService.cpuUsage > 70 ? '#ff4d4f' : '#52c41a'} />
                  </Descriptions.Item>
                  <Descriptions.Item label="内存使用率">
                    <Progress percent={selectedService.memoryUsage} size="small"
                      strokeColor={selectedService.memoryUsage > 80 ? '#ff4d4f' : '#1890ff'} />
                  </Descriptions.Item>
                  <Descriptions.Item label="P99延迟">{selectedService.p99Latency} ms</Descriptions.Item>
                  <Descriptions.Item label="QPS">{selectedService.qps.toLocaleString()}</Descriptions.Item>
                  <Descriptions.Item label="错误率">{selectedService.errorRate.toFixed(2)}%</Descriptions.Item>
                  <Descriptions.Item label="依赖服务">
                    {selectedService.dependencies.length > 0
                      ? selectedService.dependencies.map(d => <Tag key={d}>{d}</Tag>)
                      : <Text type="secondary">无（基础组件）</Text>}
                  </Descriptions.Item>
                </Descriptions>

                <Divider>通信方式</Divider>
                {selectedService.category === '核心业务' && (
                  <div>
                    <Tag icon={<ApiOutlined />} color="blue">gRPC (Protobuf) 同步调用</Tag>
                    <Tag icon={<SendOutlined />} color="orange">Kafka 异步事件发布/消费</Tag>
                  </div>
                )}
                {selectedService.category === '平台能力' && (
                  <Tag icon={<ThunderboltOutlined />} color="gold">SDK/拦截器嵌入</Tag>
                )}
                {selectedService.category === '基础设施' && (
                  <Tag icon={<HddOutlined />} color="purple">标准化PV/PVC + Service/DNS</Tag>
                )}
              </div>
            ) : (
              <div className={styles.placeholderCenter}>
                <ApartmentOutlined className={styles.placeholderIcon} />
                <p>点击左侧服务节点查看详情</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 服务列表 */}
      <Row className={styles.sectionRowTop}>
        <Col span={24}>
          <Card title={<><NodeIndexOutlined /> 全部微服务清单（15个微服务）</>} size="small">
            <Table
              dataSource={microserviceList}
              columns={columns}
              rowKey="name"
              size="small"
              pagination={false}
              scroll={{ x: 1100 }}
              onRow={(record) => ({
                onClick: () => setSelectedService(record),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
