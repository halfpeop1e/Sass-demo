import { useState } from 'react';
import {
  Row, Col, Card, Table, Tag, Statistic, Progress, Space, Typography, Badge,
  Select, Button, Modal, Descriptions, Steps, Alert, Divider,
} from 'antd';
import {
  TeamOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  SyncOutlined,
  DatabaseOutlined,
  LockOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { tenantList, type Tenant } from '../data/mockData';
import styles from './TenantManagement.module.css';

const { Text, Title } = Typography;

const tierColorMap: Record<string, string> = { Starter: '#52c41a', Pro: '#faad14', Enterprise: '#1890ff' };
const statusTagMap: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '运行中' },
  suspended: { color: 'red', text: '已冻结' },
  pending: { color: 'orange', text: '审核中' },
};

export default function TenantManagement() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [filterTier, setFilterTier] = useState<string>('all');

  const filteredTenants = filterTier === 'all' ? tenantList : tenantList.filter(t => t.tier === filterTier);

  const columns = [
    { title: '租户ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '商户名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '套餐等级', dataIndex: 'tier', key: 'tier', width: 110,
      render: (v: string) => <Tag color={tierColorMap[v]}>{v}</Tag> },
    { title: '隔离级别', dataIndex: 'isolationLevel', key: 'isolationLevel', width: 110,
      render: (v: string) => {
        const color = v === '独立数据库' ? 'blue' : v === '独立Schema' ? 'orange' : 'green';
        return <Tag color={color} icon={<SafetyOutlined />}>{v}</Tag>;
      } },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v: string) => <Badge status={v === 'active' ? 'success' : v === 'suspended' ? 'error' : 'processing'} text={statusTagMap[v]?.text} /> },
    { title: 'API QPS', dataIndex: 'apiQps', key: 'apiQps', width: 90,
      render: (v: number, r: Tenant) => (
        <Space size={4}>
          <span>{v}</span>
          <Progress percent={v / r.quotaLimit * 100} size="small" style={{ width: 60 }} showInfo={false}
            strokeColor={v / r.quotaLimit > 0.8 ? '#ff4d4f' : '#52c41a'} />
        </Space>
      ) },
    { title: 'SPU数', dataIndex: 'spuCount', key: 'spuCount', width: 90,
      render: (v: number) => v.toLocaleString() },
    { title: '订单数', dataIndex: 'orderCount', key: 'orderCount', width: 90,
      render: (v: number) => v.toLocaleString() },
    { title: '存储(GB)', dataIndex: 'storageGB', key: 'storageGB', width: 80 },
    { title: '操作', key: 'action', width: 100,
      render: (_: unknown, record: Tenant) => (
        <Button type="link" size="small" onClick={() => { setSelectedTenant(record); setDetailVisible(true); }}>
          详情
        </Button>
      ) },
  ];

  return (
    <div>
      <Title level={4}><SafetyCertificateOutlined /> 多租户管理 — TIRE 引擎控制台</Title>

      {/* TIRE引擎说明 */}
      <Alert
        type="info"
        showIcon
        icon={<SafetyOutlined />}
        message="TIRE 多租户路由与隔离引擎 (Tenant Identification, Routing & Enforcement)"
        description={
          <Steps
            size="small"
            direction="horizontal"
            current={-1}
            className={styles.stepsStyle}
            items={[
              { title: '① 租户识别', description: '域名解析, Token解析' },
              { title: '② 路由决策', description: '套餐等级, 隔离策略' },
              { title: '③ 上下文注入', description: 'ThreadLocal透传, 日志链路' },
              { title: '④ 隔离守卫', description: 'ORM拦截器, SQL自动追加tenant_id' },
              { title: '⑤ 配额保护', description: '令牌桶限流, 资源舱壁' },
            ]}
          />
        }
        className={styles.pageAlert}
      />

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="总租户" value={tenantList.length} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="Starter (70%)" value={tenantList.filter(t => t.tier === 'Starter').length} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="Pro (20%)" value={tenantList.filter(t => t.tier === 'Pro').length} styles={{ content: { color: '#faad14' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="Enterprise (10%)" value={tenantList.filter(t => t.tier === 'Enterprise').length} styles={{ content: { color: '#1890ff' } }} /></Card>
        </Col>
      </Row>

      {/* 阶梯隔离模型可视化 */}
      <Card title="混合存储阶梯式隔离模型" size="small" className={styles.isolationCard}>
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" className={`${styles.tierCard} ${styles.tierCardStarter}`}>
              <DatabaseOutlined className={styles.tierIcon} style={{ color: '#52c41a' }} />
              <Title level={5} className={styles.tierTitle}>共享表 (70%)</Title>
              <Text type="secondary">Starter 套餐</Text>
              <div className={styles.tierTags}>
                <Tag color="green">单库共享表 + tenant_id过滤</Tag>
                <Tag color="green">Resource Bulkhead舱壁隔离</Tag>
                <Tag color="green">100 QPS令牌桶限流</Tag>
                <Tag color="green">500 SPU上限</Tag>
              </div>
              <Alert type="success" message="成本最低，适合初创商户" className={styles.tierAlert} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className={`${styles.tierCard} ${styles.tierCardPro}`}>
              <ApartmentOutlined className={styles.tierIcon} style={{ color: '#faad14' }} />
              <Title level={5} className={styles.tierTitle}>独立Schema (20%)</Title>
              <Text type="secondary">Pro 套餐</Text>
              <div className={styles.tierTags}>
                <Tag color="orange">独立Schema物理隔离</Tag>
                <Tag color="orange">500 QPS配额</Tag>
                <Tag color="orange">5,000 SPU上限</Tag>
                <Tag color="orange">在线热迁移零中断</Tag>
              </div>
              <Alert type="warning" message="平衡成本与隔离，适合成长型商户" className={styles.tierAlert} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className={`${styles.tierCard} ${styles.tierCardEnterprise}`}>
              <LockOutlined className={styles.tierIcon} style={{ color: '#1890ff' }} />
              <Title level={5} className={styles.tierTitle}>独立数据库 (10%)</Title>
              <Text type="secondary">Enterprise 套餐</Text>
              <div className={styles.tierTags}>
                <Tag color="blue">独立数据库实例</Tag>
                <Tag color="blue">自定义QPS配额</Tag>
                <Tag color="blue">50,000 SPU上限</Tag>
                <Tag color="blue">独享计算池资源</Tag>
              </div>
              <Alert type="info" message="最高隔离等级，适合大型商户" className={styles.tierAlert} />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 租户列表 */}
      <Card
        title={<><TeamOutlined /> 租户列表</>}
        size="small"
        extra={
          <Space>
            <Select value={filterTier} onChange={setFilterTier} className={styles.filterSelect} size="small"
              options={[
                { value: 'all', label: '全部套餐' },
                { value: 'Starter', label: 'Starter' },
                { value: 'Pro', label: 'Pro' },
                { value: 'Enterprise', label: 'Enterprise' },
              ]} />
            <Button size="small" icon={<ReloadOutlined />}>刷新</Button>
          </Space>
        }
      >
        <Table
          dataSource={filteredTenants}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* 租户详情抽屉 */}
      <Modal
        title={selectedTenant ? `${selectedTenant.name} - 租户详情` : ''}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          <Button key="migrate" type="primary" icon={<SyncOutlined />}>套餐升级（热迁移）</Button>,
        ]}
        width={700}
      >
        {selectedTenant && (
          <div>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="租户ID">{selectedTenant.id}</Descriptions.Item>
              <Descriptions.Item label="域名">{selectedTenant.domain}</Descriptions.Item>
              <Descriptions.Item label="套餐等级">
                <Tag color={tierColorMap[selectedTenant.tier]}>{selectedTenant.tier}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="隔离级别">
                <Tag color={selectedTenant.isolationLevel === '独立数据库' ? 'blue' : selectedTenant.isolationLevel === '独立Schema' ? 'orange' : 'green'}>
                  {selectedTenant.isolationLevel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={selectedTenant.status === 'active' ? 'success' : selectedTenant.status === 'suspended' ? 'error' : 'processing'}
                  text={statusTagMap[selectedTenant.status]?.text} />
              </Descriptions.Item>
              <Descriptions.Item label="入驻时间">{selectedTenant.createdAt}</Descriptions.Item>
              <Descriptions.Item label="SPU数量">{selectedTenant.spuCount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="订单总数">{selectedTenant.orderCount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="API QPS">{selectedTenant.apiQps} / {selectedTenant.quotaLimit}</Descriptions.Item>
              <Descriptions.Item label="存储用量">{selectedTenant.storageGB} GB</Descriptions.Item>
            </Descriptions>

            <Divider>TIRE 隔离策略详情</Divider>
            <Steps
              size="small"
              current={4}
              status="finish"
              items={[
                { title: '识别', description: `域名: ${selectedTenant.domain}` },
                { title: '路由', description: `${selectedTenant.isolationLevel}` },
                { title: '注入', description: `TenantContext透传` },
                { title: '守卫', description: `SQL自动附加tenant_id=${selectedTenant.id}` },
                { title: '配额', description: `${selectedTenant.quotaLimit} QPS舱壁保护` },
              ]}
            />

            <Alert
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              message="热迁移提示"
              description="如需升级套餐（Starter→Pro / Pro→Enterprise），平台支持在线平滑热迁移，底层数据逻辑自动切换，业务零中断。"
              className={styles.detailAlert}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
