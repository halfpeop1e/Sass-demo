import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Table, Tag, Statistic, Space, Typography, Badge,
  Alert, Slider, Switch, Button, Descriptions, Divider, Timeline,
  Modal, Spin, message,
} from 'antd';
import {
  ExpandOutlined,
  SafetyCertificateOutlined,
  CloudServerOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  WarningOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { scalingHistory, type ScalingEvent } from '../data/mockData';
import styles from './ScalingDisaster.module.css';

const { Text, Title } = Typography;

interface DRStatus {
  primaryRegion: string;
  disasterRegion: string;
  mode: string;
  primaryHealthy: number;
  disasterHealthy: number;
  totalServices: number;
  rtoTarget: string;
  rpoTarget: string;
  autoFailover: boolean;
}

interface ServiceStatus {
  name: string;
  primaryPort: string;
  disasterPort: string;
  primaryHealthy: boolean;
  disasterHealthy: boolean;
  activeRegion: string;
}

export default function ScalingDisaster() {
  const [simulateScaling, setSimulateScaling] = useState(false);
  const [cpuThreshold, setCpuThreshold] = useState(70);
  const [memoryThreshold, setMemoryThreshold] = useState(80);
  const [scheduledScaling, setScheduledScaling] = useState(true);
  const [drStatus, setDrStatus] = useState<DRStatus | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [disasterMode, setDisasterMode] = useState<'normal' | 'failover' | 'recovering'>('normal');
  const [fireLoading, setFireLoading] = useState(false);
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [fireResult, setFireResult] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);

  const apiBase = 'http://localhost:8080/api';

  const refreshDRStatus = () => {
    fetch(`${apiBase}/disaster/status`)
      .then(r => r.json())
      .then(d => {
        if (d?.data) {
          setDrStatus(d.data);
          setDisasterMode(d.data.mode === 'disaster' ? 'failover' : 'normal');
        }
      });
    fetch(`${apiBase}/services`)
      .then(r => r.json())
      .then(d => {
        if (d?.data) setServices(d.data);
      });
  };

  useEffect(() => {
    refreshDRStatus();
    const t = setInterval(() => {
      if (polling) refreshDRStatus();
    }, 4000);
    return () => clearInterval(t);
  }, [polling]);

  const triggerFire = () => {
    Modal.confirm({
      title: '⚠️ 确认模拟机房着火？',
      content: `这将实际停止主区域（${drStatus?.primaryRegion || '华东'}）的所有 8 个微服务进程！Gateway 将自动切换至灾备区域（${drStatus?.disasterRegion || '东京'}）。`,
      okText: '🔥 确认着火',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        setFireLoading(true);
        fetch(`${apiBase}/disaster/fire`, { method: 'POST' })
          .then(r => r.json())
          .then(d => {
            setFireLoading(false);
            setFireResult(d?.data?.message || '故障切换完成');
            message.success(d?.data?.message || '故障切换完成');
            setDisasterMode('failover');
            setPolling(true);
            setTimeout(refreshDRStatus, 2000);
          })
          .catch(() => setFireLoading(false));
      },
    });
  };

  const triggerRecover = () => {
    setRecoverLoading(true);
    setDisasterMode('recovering');
    fetch(`${apiBase}/disaster/recover`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        setRecoverLoading(false);
        message.success(d?.data?.message || '恢复完成');
        setFireResult(null);
        setDisasterMode('normal');
        setTimeout(refreshDRStatus, 3000);
      })
      .catch(() => setRecoverLoading(false));
  };

  const scalingColumns = [
    { title: '服务', dataIndex: 'service', key: 'service', width: 140 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 90,
      render: (v: string) => {
        const color = v === '扩容' ? 'green' : v === '缩容' ? 'blue' : 'orange';
        return <Tag color={color}>{v}</Tag>;
      } },
    { title: '触发条件', dataIndex: 'trigger', key: 'trigger', width: 240, ellipsis: true },
    { title: '副本变化', key: 'replicas', width: 120,
      render: (_: unknown, r: ScalingEvent) => (
        <Space>
          <Text>{r.replicasBefore}</Text>
          <Text type="secondary">→</Text>
          <Text strong style={{ color: '#52c41a' }}>{r.replicasAfter}</Text>
        </Space>
      ) },
    { title: '时间', dataIndex: 'timestamp', key: 'timestamp', width: 170 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (v: string) => <Badge status={v === 'success' ? 'success' : 'error'} text={v === 'success' ? '成功' : '失败'} /> },
  ];

  return (
    <div>
      <Title level={4}><ExpandOutlined /> 弹性伸缩与灾备管理</Title>

      {/* 弹性伸缩配置 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={<><CloudServerOutlined /> K8s HPA 弹性伸缩配置 (Horizontal Pod Autoscaler)</>}
            size="small"
            extra={<Switch checked={simulateScaling} onChange={setSimulateScaling} checkedChildren="自动伸缩开启" unCheckedChildren="手动模式" />}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="扩容触发条件" className={styles.scalingCardGreen}>
                  <div className={styles.sliderWrap}>
                    <Text>CPU使用率阈值</Text>
                    <Slider value={cpuThreshold} onChange={setCpuThreshold} min={50} max={90}
                      marks={{ 50: '50%', 70: '70%', 90: '90%' }}
                      tooltip={{ formatter: (v) => `${v}%` }} />
                  </div>
                  <div className={styles.sliderWrap}>
                    <Text>内存使用率阈值</Text>
                    <Slider value={memoryThreshold} onChange={setMemoryThreshold} min={50} max={95}
                      marks={{ 50: '50%', 80: '80%', 95: '95%' }}
                      tooltip={{ formatter: (v) => `${v}%` }} />
                  </div>
                  <Alert type="success" title="冷却时间：扩容3分钟 / 缩容10分钟" className={styles.alertFont} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="定时预扩容" className={styles.scalingCardBlue}>
                  <div className={styles.sliderWrap}>
                    <Text>大促预扩容</Text>
                    <Switch checked={scheduledScaling} onChange={setScheduledScaling}
                      checkedChildren="已启用" unCheckedChildren="已禁用" className={styles.switchMargin} />
                  </div>
                  {scheduledScaling && (
                    <Alert
                      type="info"
                      title="大促活动前夜 20:00 自动触发，将核心服务扩容至日常2倍"
                      description={
                        <Space orientation="vertical" size={4}>
                          <Text>Order Service: 4 → 8 Pods</Text>
                          <Text>Product Service: 3 → 6 Pods</Text>
                          <Text>API Gateway: 4 → 8 Pods</Text>
                          <Text>Payment Service: 3 → 6 Pods</Text>
                        </Space>
                      }
                      className={styles.alertFont}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            <Divider>弹性伸缩指标说明</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="水平Pod扩容">CPU&gt;70% 或 内存&gt;80%</Descriptions.Item>
                  <Descriptions.Item label="水平Pod缩容">CPU&lt;30% 且持续10分钟</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="冷却时间扩容">3分钟</Descriptions.Item>
                  <Descriptions.Item label="冷却时间缩容">10分钟</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="数据库弹性扩容">活跃连接数&gt;80%自动新增读节点</Descriptions.Item>
                  <Descriptions.Item label="扩容冷却">5分钟</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 伸缩历史 */}
        <Col xs={24} lg={10}>
          <Card title={<><SyncOutlined /> 伸缩事件历史</>} size="small">
            <Table dataSource={scalingHistory} columns={scalingColumns} rowKey="id" size="small" pagination={false} />
          </Card>
        </Col>
      </Row>

      {/* 灾备与容灾 - 真实双Region架构 */}
      <Row gutter={[16, 16]} className={styles.disasterRow}>
        <Col xs={24} lg={14}>
          <Card
            title={<><SafetyCertificateOutlined /> 灾备与容灾架构（RTO≤3秒 Gateway层 · RPO≤手动恢复后）</>}
            size="small"
            extra={
              <Space>
                <Button onClick={refreshDRStatus} size="small" icon={<SyncOutlined />}>刷新状态</Button>
              </Space>
            }
          >
            {/* 灾备操作按钮 */}
            <div className={styles.disasterModeBar}>
              <Space align="center">
                <Tag color={disasterMode === 'normal' ? 'green' : 'default'} icon={<CheckCircleOutlined />}>
                  {disasterMode === 'normal' ? '✅ 主区域正常运行' : '主区域'}
                </Tag>
                <Button
                  type="primary" danger
                  icon={<FireOutlined />}
                  onClick={triggerFire}
                  loading={fireLoading}
                  disabled={disasterMode === 'failover'}
                >
                  🔥 模拟机房着火（真关服务）
                </Button>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={triggerRecover}
                  loading={recoverLoading}
                  disabled={disasterMode !== 'failover'}
                >
                  🔧 恢复主区域服务
                </Button>
              </Space>
              {disasterMode === 'failover' && (
                <Tag color="error" icon={<WarningOutlined />} style={{ marginTop: 8, padding: '4px 12px', fontSize: 14 }}>
                  🔥 主区域不可用! 网关已自动切换至灾备区域
                </Tag>
              )}
              {disasterMode === 'recovering' && (
                <Tag color="processing" icon={<SyncOutlined spin />} style={{ marginTop: 8, padding: '4px 12px', fontSize: 14 }}>
                  恢复中... 正在重启主区域服务
                </Tag>
              )}
            </div>

            {/* 容灾架构图 */}
            <div className={styles.containerBg}>
              {fireResult && disasterMode === 'failover' && (
                <Alert type="success" title={fireResult} showIcon style={{ marginBottom: 16 }} />
              )}
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small"
                    style={{
                      background: disasterMode === 'failover' ? '#fff1f0' : '#f6ffed',
                      border: `2px solid ${disasterMode === 'failover' ? '#ff4d4f' : '#52c41a'}`,
                    }}
                    title={<><GlobalOutlined /> 主Region：{drStatus?.primaryRegion || '华东'} (8081-8088)</>}
                  >
                    {disasterMode === 'failover' && (
                      <Alert type="error" title="🔥 心跳超时！主机房不可用 — 所有进程已终止" showIcon style={{ marginBottom: 8 }} />
                    )}
                    {services.length > 0 ? (
                      <Space orientation="vertical" size={2}>
                        {services.map(s => (
                          <Tag key={s.name} color={s.primaryHealthy ? 'green' : 'red'}>
                            {s.name} :{s.primaryPort} {s.primaryHealthy ? '✅' : '❌ 离线'}
                          </Tag>
                        ))}
                      </Space>
                    ) : (
                      <Spin size="small" />
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small"
                    style={{
                      background: disasterMode === 'failover' ? '#f6ffed' : '#e6f7ff',
                      border: `2px solid ${disasterMode === 'failover' ? '#52c41a' : '#1890ff'}`,
                    }}
                    title={<><GlobalOutlined /> 灾备Region：{drStatus?.disasterRegion || '东京'} (9081-9088)</>}
                  >
                    {disasterMode === 'failover' && (
                      <Alert type="success" title="✅ 灾备Region已接管流量！所有请求自动路由至灾备区域" showIcon style={{ marginBottom: 8 }} />
                    )}
                    {services.length > 0 ? (
                      <Space orientation="vertical" size={2}>
                        {services.map(s => (
                          <Tag key={s.name} color={s.disasterHealthy ? 'green' : 'orange'}>
                            {s.name} :{s.disasterPort} {s.disasterHealthy ? '✅' : '⚠️ 待启动'}
                          </Tag>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">运行 `bash demo-backend/disaster-region/start.sh` 启动灾备区域</Text>
                    )}
                  </Card>
                </Col>
              </Row>

              <div className={styles.syncBar}>
                <Space>
                  <Tag color="processing">
                    <SwapOutlined /> Gateway 自动故障检测 (3s 健康检查周期)
                  </Tag>
                  <Tag color="processing">
                    <SwapOutlined /> 主→备自动路由切换 (≤3秒)
                  </Tag>
                </Space>
              </div>

              <Alert
                type="info"
                title="真实灾备架构：主区域服务(8081-8088) + 灾备区域服务(9081-9088) + Gateway 自动故障切换"
                description="探测：每3秒健康检查主区域 → 判定：全部不可用时自动切换→ 切换：Gateway 路由目标从808X改为908X → 恢复：恢复主区域进程后 Gateway 自动切回"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title={<><ClockCircleOutlined /> 组件级灾备策略</>} size="small">
            <Table
              dataSource={[
                { component: '微服务集群', backup: '灾备区域完整副本(9081-9088)', restore: 'Gateway 自动路由切换 &lt;3秒' },
                { component: 'MySQL', backup: '每日全量+Binlog实时增量', restore: '自动提升备库为主库' },
                { component: 'Redis', backup: '跨区域异步复制+AOF持久化', restore: '哨兵机制自动主从切换' },
                { component: '业务日志', backup: '实时采集同步至异地OSS', restore: '恢复后基于异地日志重建索引' },
                { component: 'K8s集群', backup: 'Cluster Autoscaler', restore: '自动扩容至主Region同等规格' },
              ]}
              columns={[
                { title: '组件', dataIndex: 'component', key: 'component', width: 100 },
                { title: '备份策略', dataIndex: 'backup', key: 'backup', width: 180 },
                { title: '恢复方式', dataIndex: 'restore', key: 'restore', width: 160 },
              ]}
              rowKey="component"
              size="small"
              pagination={false}
            />

            <Divider>机房故障响应流程（机房着火场景）</Divider>
            <Timeline
              items={[
                { color: 'red', content: <><Text strong>① 探测：</Text>Gateway每3秒健康检查主区域8081-8088，检测到全部不可用</> },
                { color: 'orange', content: <><Text strong>② 判定：</Text>判定主机房不可用，primaryUp = false</> },
                { color: 'blue', content: <><Text strong>③ 切换：</Text>Gateway自动将路由目标切换至灾备区域9081-9088（≤3秒）</> },
                { color: 'purple', content: <><Text strong>④ 接管：</Text>灾备区域微服务正常处理请求，买家/商户无感知</> },
                { color: 'green', content: <><Text strong>⑤ 恢复：</Text>执行恢复脚本重启主区域进程，Gateway检测到健康后自动切回</> },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* RTO/RPO 指标 */}
      <Row gutter={[16, 16]} className={styles.rtpoRow}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="RTO 路由切换时间"
              value="≤ 3 秒"
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
            <Alert type="success" title="Gateway 3秒健康检查周期 + 毫秒级路由表切换" style={{ marginTop: 8, fontSize: 11 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="RPO 恢复点目标"
              value="≤ 5 分钟"
              prefix={<DatabaseOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
            <Alert type="info" title="基于Binlog实时增量备份 + 跨Region异步同步" style={{ marginTop: 8, fontSize: 11 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="灾备区域状态"
              value={drStatus?.disasterHealthy ? `${drStatus.disasterHealthy}/${drStatus.totalServices} 健康` : '未知'}
              prefix={drStatus?.disasterHealthy === drStatus?.totalServices ? <CheckCircleOutlined /> : <SyncOutlined />}
              styles={{ content: { color: drStatus?.disasterHealthy === drStatus?.totalServices ? '#52c41a' : '#faad14' } }}
            />
            <Alert
              type={drStatus?.disasterHealthy === drStatus?.totalServices ? 'success' : 'warning'}
              title={drStatus?.disasterHealthy === drStatus?.totalServices ? '灾备区域就绪，可随时接管' : '部分灾备服务未启动'}
              style={{ marginTop: 8, fontSize: 11 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
