import { useState } from 'react';
import {
  Row, Col, Card, Table, Tag, Space, Typography, Progress, Badge,
  Select, Descriptions, Alert, Steps, Tabs,
} from 'antd';
import {
  DollarOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { paymentChannels, logisticsCarriers } from '../data/mockData';
import styles from './PaymentLogistics.module.css';

const { Text, Title } = Typography;

export default function PaymentLogistics() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedLogisticsRegion, setSelectedLogisticsRegion] = useState<string>('all');

  const filteredPayments = selectedRegion === 'all'
    ? paymentChannels
    : paymentChannels.filter(p => p.region.includes(selectedRegion));

  const filteredLogistics = selectedLogisticsRegion === 'all'
    ? logisticsCarriers
    : logisticsCarriers.filter(l => l.region.includes(selectedLogisticsRegion));

  const paymentColumns = [
    { title: '渠道名称', dataIndex: 'name', key: 'name', width: 140 },
    { title: '服务区域', dataIndex: 'region', key: 'region', width: 120,
      render: (v: string) => <Tag color="blue"><GlobalOutlined /> {v}</Tag> },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (v: string) => {
        const color = v === '信用卡' ? 'blue' : v === '电子钱包' ? 'orange' : v === '货到付款' ? 'green' : 'purple';
        return <Tag color={color}>{v}</Tag>;
      } },
    { title: '成功率', dataIndex: 'successRate', key: 'successRate', width: 110,
      render: (v: number) => (
        <Space>
          <Progress percent={v} size="small" className={styles.progressWrapper}
            strokeColor={v > 98 ? '#52c41a' : v > 95 ? '#faad14' : '#ff4d4f'} />
          <Text style={{ color: v > 98 ? '#52c41a' : '#faad14' }}>{v}%</Text>
        </Space>
      ) },
    { title: '平均延迟', dataIndex: 'avgLatency', key: 'avgLatency', width: 100,
      render: (v: number) => v === -1 ? <Tag color="default">N/A (COD)</Tag> : <Text>{v}ms</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v: string) => {
        const m: Record<string, { status: 'success' | 'warning' | 'error'; text: string }> = {
          online: { status: 'success', text: '在线' },
          degraded: { status: 'warning', text: '降级' },
          offline: { status: 'error', text: '离线' },
        };
        return <Badge status={m[v]?.status} text={m[v]?.text} />;
      } },
    { title: 'QPS', dataIndex: 'qps', key: 'qps', width: 70 },
  ];

  const logisticsColumns = [
    { title: '物流商', dataIndex: 'name', key: 'name', width: 130 },
    { title: '服务区域', dataIndex: 'region', key: 'region', width: 110,
      render: (v: string) => <Tag color="purple"><GlobalOutlined /> {v}</Tag> },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (v: string) => {
        const color = v === '国际快递' ? 'red' : v === '专线物流' ? 'orange' : v === '海外仓' ? 'green' : 'blue';
        return <Tag color={color}>{v}</Tag>;
      } },
    { title: '时效', dataIndex: 'avgDeliveryDays', key: 'avgDeliveryDays', width: 120 },
    { title: '成本', dataIndex: 'costLevel', key: 'costLevel', width: 80,
      render: (v: string) => {
        const color = v === '高' ? 'red' : v === '中' ? 'orange' : 'green';
        return <Tag color={color}>{v}</Tag>;
      } },
    { title: '轨迹追踪', dataIndex: 'trackingSupport', key: 'trackingSupport', width: 90,
      render: (v: boolean) => v ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v: string) => {
        const m: Record<string, { status: 'success' | 'warning' | 'error'; text: string }> = {
          online: { status: 'success', text: '在线' },
          degraded: { status: 'warning', text: '降级' },
          offline: { status: 'error', text: '离线' },
        };
        return <Badge status={m[v]?.status} text={m[v]?.text} />;
      } },
  ];

  return (
    <div>
      <Title level={4}><DollarOutlined /> 统一支付路由与物流适配体系</Title>

      <Alert
        type="info"
        showIcon
        message="统一支付与物流适配体系 —— 平台差异化核心能力"
        description="支付路由引擎集成Stripe、PayPal、Xendit、Omise、Adyen等主流国际支付渠道，按买家国家+币种+金额+通道健康度自动选择最优方式。物流适配层封装DHL、FedEx、USPS、燕文、云途、极兔等渠道，实现询价、下单、面单、轨迹查询标准化。"
        className={styles.pageAlert}
      />

      <Tabs
        defaultActiveKey="payment"
        items={[
          {
            key: 'payment',
            label: <span><WalletOutlined /> 支付路由引擎</span>,
            children: (
              <div>
                {/* 支付架构 */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={14}>
                    <Card title="统一支付路由架构" size="small">
                      <div className={styles.stepsContainer}>
                        <Steps
                          direction="vertical"
                          size="small"
                          current={-1}
                          items={[
                            {
                              title: <Text strong>① 支付意图创建</Text>,
                              description: 'Order Service → Payment Service，创建支付意图，传入金额、币种、买家国家',
                            },
                            {
                              title: <Text strong>② 路由引擎决策</Text>,
                              description: '引擎根据买家国家+币种+金额+通道健康度+风控等级，选择最优支付渠道。美国→Stripe，印尼→Xendit/Doku，泰国→Omise/Rabbit LINE Pay',
                            },
                            {
                              title: <Text strong>③ 渠道路由分发</Text>,
                              description: '调用渠道API发起扣款，生成汇率快照（T+0实时锁定）写入订单副表',
                            },
                            {
                              title: <Text strong>④ 异步回调处理</Text>,
                              description: '支付渠道异步回调→验签+幂等校验（Redis布隆过滤器+MySQL唯一索引）→发布payment.success事件',
                            },
                            {
                              title: <Text strong>⑤ 熔断降级保护</Text>,
                              description: '第三方接口超时5秒，连续失败5次触发熔断→自动切换备选渠道→半开状态每30秒探测恢复',
                            },
                          ]}
                        />
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={10}>
                    <Card title="多币种体系" size="small">
                      <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="展示币种">买家端按目标市场展示本地货币价格（USD/THB/IDR/VND）</Descriptions.Item>
                        <Descriptions.Item label="交易币种">支付渠道扣款币种，按实时汇率转换</Descriptions.Item>
                        <Descriptions.Item label="结算币种">商户端以人民币(CNY)或美元(USD)结算提现</Descriptions.Item>
                      </Descriptions>
                      <Alert
                        type="warning"
                        message="汇率快照：下单时锁定汇率，后续退款、对账严格以快照为准，不受后续波动影响"
                        className={styles.alertMt12}
                        style={{ fontSize: 11 }}
                      />
                      <Alert
                        type="success"
                        message="PCI-DSS合规：平台不存储完整卡号，仅使用Token（PCI-DSS SAQ-A级别）"
                        className={styles.alertMt4}
                        style={{ fontSize: 11 }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 支付渠道列表 */}
                <Row className={styles.sectionRow}>
                  <Col span={24}>
                    <Card
                      title={<><WalletOutlined /> 支付渠道列表</>}
                      size="small"
                      extra={
                        <Select value={selectedRegion} onChange={setSelectedRegion} className={styles.channelSelect} size="small"
                          options={[
                            { value: 'all', label: '全部区域' },
                            { value: '美国', label: '美国' },
                            { value: '东南亚', label: '东南亚' },
                            { value: '欧洲', label: '欧洲' },
                            { value: '印尼', label: '印尼' },
                            { value: '泰国', label: '泰国' },
                          ]} />
                      }
                    >
                      <Table dataSource={filteredPayments} columns={paymentColumns} rowKey="id" size="small" pagination={false} />
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'logistics',
            label: <span><CarOutlined /> 物流适配层</span>,
            children: (
              <div>
                {/* 物流架构 */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={14}>
                    <Card title="统一物流适配架构（策略模式）" size="small">
                      <div className={styles.stepsContainer}>
                        <Steps
                          direction="vertical"
                          size="small"
                          current={-1}
                          items={[
                            {
                              title: <Text strong>① 发货单创建</Text>,
                              description: 'Fulfillment Service消费order.paid事件，自动创建发货单，传入目的地、包裹重量/尺寸',
                            },
                            {
                              title: <Text strong>② 物流渠道路由</Text>,
                              description: '物流适配层根据目的地+包裹属性+时效要求+成本，调用各物流商实时询价，比价后分配最优渠道',
                            },
                            {
                              title: <Text strong>③ 面单/下单</Text>,
                              description: '调用分配的物流商API下单获取运单号+面单，标准接口参数（发件人/收件人/包裹/报关信息）',
                            },
                            {
                              title: <Text strong>④ 轨迹同步</Text>,
                              description: 'Webhook + 定时拉取双模式轨迹同步，事件驱动型模型异步接收3PL轨迹事件，发布shipment.status_changed事件',
                            },
                            {
                              title: <Text strong>⑤ 熔断与备选切换</Text>,
                              description: '核心交易主链路与第三方物流商接口完全解耦，异常时熔断并自动切换备选物流商',
                            },
                          ]}
                        />
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={10}>
                    <Card title="多渠道履约调度" size="small">
                      <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="询价接口">标准化询价（origin/destination/weight/dims）</Descriptions.Item>
                        <Descriptions.Item label="下单接口">标准化下单（address/parcel/customs）</Descriptions.Item>
                        <Descriptions.Item label="面单接口">标准化面单获取（trackingNo/labelUrl）</Descriptions.Item>
                        <Descriptions.Item label="轨迹接口">标准化轨迹查询（trackingNo/status/timestamp）</Descriptions.Item>
                        <Descriptions.Item label="取消接口">标准化发货取消（shipmentId/reason）</Descriptions.Item>
                      </Descriptions>
                      <Alert
                        type="info"
                        message="解耦设计：订单核心状态推进与第三方物流商接口完全解耦，3PL异常不阻塞主交易链路"
                        className={styles.alertMt12}
                        style={{ fontSize: 11 }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 物流商列表 */}
                <Row className={styles.sectionRow}>
                  <Col span={24}>
                    <Card
                      title={<><CarOutlined /> 物流渠道列表</>}
                      size="small"
                      extra={
                        <Select value={selectedLogisticsRegion} onChange={setSelectedLogisticsRegion} className={styles.channelSelect} size="small"
                          options={[
                            { value: 'all', label: '全部区域' },
                            { value: '全球', label: '全球' },
                            { value: '美国', label: '美国' },
                            { value: '东南亚', label: '东南亚' },
                            { value: '欧洲', label: '欧洲' },
                          ]} />
                      }
                    >
                      <Table dataSource={filteredLogistics} columns={logisticsColumns} rowKey="id" size="small" pagination={false} />
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
