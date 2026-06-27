import { Row, Col, Card, Table, Tag, Typography, Progress, Space, Alert, Divider, Statistic } from 'antd';
import {
  SafetyOutlined,
  DatabaseOutlined,
  HddOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { systemLimits, dataScaleEstimates } from '../data/mockData';

const { Text, Title } = Typography;

const limitColumns = [
  { title: '限制类别', dataIndex: 'category', key: 'category', width: 160,
    render: (v: string) => <Text strong>{v}</Text> },
  { title: '限制描述', dataIndex: 'description', key: 'description', width: 260 },
  { title: '应对策略', dataIndex: 'strategy', key: 'strategy', ellipsis: true },
];

const scaleColumns = [
  { title: '数据实体', dataIndex: 'entity', key: 'entity', width: 150 },
  { title: 'V1（首年）', dataIndex: 'v1Range', key: 'v1Range', width: 180,
    render: (v: string) => <Tag color="green">{v}</Tag> },
  { title: 'V2（第三年）', dataIndex: 'v2Range', key: 'v2Range', width: 200,
    render: (v: string) => <Tag color="blue">{v}</Tag> },
  { title: '单行大小', dataIndex: 'rowSize', key: 'rowSize', width: 90 },
];

export default function SystemLimits() {
  return (
    <div>
      <Title level={4}><SafetyOutlined /> 系统限制与数据规模评估</Title>

      {/* 存储预估总览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="MySQL V1" value="50~150 GB" valueStyle={{ fontSize: 18 }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="MySQL V2" value="500GB~2TB" valueStyle={{ fontSize: 18, color: '#1890ff' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="Redis V2" value="50~100 GB" valueStyle={{ fontSize: 18 }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="S3 V2" value="3~10 TB" valueStyle={{ fontSize: 18, color: '#722ed1' }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 存储空间预估 */}
        <Col xs={24} lg={12}>
          <Card title={<><HddOutlined /> 存储空间预估（V1 → V2）</>} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>MySQL</Text>
                  <Text type="secondary">50GB → 2TB</Text>
                </Space>
                <Progress percent={100} showInfo={false} strokeColor="#1890ff"
                  success={{ percent: 8, strokeColor: '#1890ff' }} />
              </div>
              <div>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>Redis</Text>
                  <Text type="secondary">10GB → 100GB</Text>
                </Space>
                <Progress percent={100} showInfo={false} strokeColor="#52c41a"
                  success={{ percent: 10, strokeColor: '#52c41a' }} />
              </div>
              <div>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>Elasticsearch</Text>
                  <Text type="secondary">20GB → 1TB</Text>
                </Space>
                <Progress percent={100} showInfo={false} strokeColor="#faad14"
                  success={{ percent: 8, strokeColor: '#faad14' }} />
              </div>
              <div>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>Kafka</Text>
                  <Text type="secondary">30GB → 500GB</Text>
                </Space>
                <Progress percent={100} showInfo={false} strokeColor="#722ed1"
                  success={{ percent: 20, strokeColor: '#722ed1' }} />
              </div>
              <div>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>S3 对象存储</Text>
                  <Text type="secondary">500GB → 10TB</Text>
                </Space>
                <Progress percent={100} showInfo={false} strokeColor="#eb2f96"
                  success={{ percent: 12.5, strokeColor: '#eb2f96' }} />
              </div>
            </Space>
          </Card>
        </Col>

        {/* 并发预估 */}
        <Col xs={24} lg={12}>
          <Card title={<><ThunderboltOutlined /> 并发与吞吐量预估</>} size="small">
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card size="small" style={{ background: '#f6ffed' }}>
                  <Statistic title="日均API (V1 → V2)" value="50万 → 1亿" valueStyle={{ fontSize: 16 }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#e6f7ff' }}>
                  <Statistic title="峰值QPS (大促)" value="2,000 → 20,000" valueStyle={{ fontSize: 16, color: '#ff4d4f' }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#fffbe6' }}>
                  <Statistic title="日均订单" value="300 → 60,000" valueStyle={{ fontSize: 16 }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#f9f0ff' }}>
                  <Statistic title="Kafka吞吐" value="5,000 → 50,000 msg/s" valueStyle={{ fontSize: 16 }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#fff0f6' }}>
                  <Statistic title="ES搜索QPS" value="500 → 5,000" valueStyle={{ fontSize: 16 }} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 数据规模评估 */}
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={<><DatabaseOutlined /> 核心业务实体数据规模评估</>} size="small">
            <Table dataSource={dataScaleEstimates} columns={scaleColumns} rowKey="entity" size="small" pagination={false} />
            <Alert
              type="info"
              message="增长预估：按面向国内中小商家出海美国及东南亚的市场定位，V1为上线首年（500~2,000商户），V2为运营第三年成熟期（5,000~20,000商户）"
              style={{ marginTop: 12, fontSize: 12 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 系统限制 */}
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={<><SafetyOutlined /> 系统限制与应对策略（15项核心限制）</>} size="small">
            <Table dataSource={systemLimits} columns={limitColumns} rowKey="category" size="small" pagination={false} />
          </Card>
        </Col>
      </Row>

      {/* 支撑多语言 */}
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="多语言支持范围" size="small">
            <Space wrap>
              <Tag color="blue">en-US (英语)</Tag>
              <Tag color="red">zh-CN (简体中文)</Tag>
              <Tag color="green">th-TH (泰语)</Tag>
              <Tag color="orange">id-ID (印尼语)</Tag>
              <Tag color="purple">vi-VN (越南语)</Tag>
              <Divider type="vertical" />
              <Tag>未来扩展：ja-JP, ko-KR, es-ES</Tag>
            </Space>
            <Alert
              message="语言包通过CDN全球分发，商品多语言扩展表（product_i18n）独立存储，平均每SPU约3~5个语言版本"
              type="success"
              style={{ marginTop: 8, fontSize: 11 }}
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
