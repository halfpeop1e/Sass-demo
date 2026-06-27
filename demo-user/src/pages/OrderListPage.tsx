import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Tag, Typography, Space, Card, Badge, Descriptions, Timeline, Button, Spin, Empty, App } from 'antd';
import { OrderedListOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { api } from '../api';

const { Title, Text } = Typography;

interface Order {
  id: string; status: string; totalAmount: number; currency: string;
  createdAt: string; items: { title: string; quantity: number; unitPrice: number }[];
  paymentId?: string; shipmentId?: string;
  shippingAddr?: { name: string; country: string; city: string };
}

const statusColor: Record<string, string> = {
  '待付款': 'orange', '已付款': 'blue', '已发货': 'cyan', '已签收': 'green', '已完成': 'green', '已取消': 'default',
};

const statusSteps: Record<string, number> = {
  '待付款': 0, '已付款': 1, '已发货': 2, '已签收': 3, '已完成': 4,
};

export default function OrderListPage() {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    api.getOrdersByBuyer('BUY-DEMO').then(res => {
      const list = res?.data || [];
      setOrders(list);
      if (list.length > 0) setSelected(list[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;

  return (
    <div>
      <Title level={4}><OrderedListOutlined /> 我的订单</Title>
      {orders.length === 0 ? (
        <Card><Empty description="暂无订单"><Link to="/products"><Button type="primary">去逛逛</Button></Link></Empty></Card>
      ) : (
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 3 }}>
            <Table
              dataSource={orders}
              rowKey="id"
              size="small"
              pagination={false}
              onRow={(r) => ({ onClick: () => setSelected(r), style: { cursor: 'pointer', background: selected?.id === r.id ? '#e6f7ff' : '' } })}
              columns={[
                { title: '订单号', dataIndex: 'id', key: 'id', width: 180 },
                { title: '状态', dataIndex: 'status', key: 'status', width: 90,
                  render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag> },
                { title: '金额', dataIndex: 'totalAmount', key: 'total', width: 100,
                  render: (v: number, r: Order) => <Text strong style={{ color: '#ff4d4f' }}>{v} {r.currency}</Text> },
                { title: '商品数', key: 'items', width: 70,
                  render: (_: unknown, r: Order) => r.items?.length || 0 },
                { title: '时间', dataIndex: 'createdAt', key: 'time', width: 160 },
              ]}
            />
          </div>

          {selected && (
            <Card title={`订单详情: ${selected.id}`} size="small" style={{ flex: 2 }}>
              <Timeline
                items={[
                  { color: 'green', content: <Text strong>下单成功</Text> },
                  { color: statusSteps[selected.status] >= 1 ? 'green' : 'gray',
                    content: <Text strong>{statusSteps[selected.status] >= 1 ? '已付款 ✅' : '待付款'}</Text> },
                  { color: statusSteps[selected.status] >= 2 ? 'green' : 'gray',
                    content: <Text strong>{statusSteps[selected.status] >= 2 ? '已发货 📦' : '待发货'}</Text> },
                  { color: statusSteps[selected.status] >= 3 ? 'green' : 'gray',
                    content: <Text strong>{statusSteps[selected.status] >= 3 ? '已签收 ✅' : '运输中'}</Text> },
                  { color: statusSteps[selected.status] >= 4 ? 'green' : 'gray',
                    content: <Text strong>完成</Text> },
                ]}
              />
              <Descriptions bordered size="small" column={1} style={{ marginTop: 12 }}>
                <Descriptions.Item label="金额">
                  <Text strong style={{ color: '#ff4d4f' }}>{selected.totalAmount} {selected.currency}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Badge status={selected.status === '待付款' ? 'processing' : 'success'} text={selected.status} />
                </Descriptions.Item>
                {selected.items.map((item, i) => (
                  <Descriptions.Item key={i} label={`商品${i+1}`}>
                    {item.title} × {item.quantity} ({(item.unitPrice * item.quantity).toFixed(2)} {selected.currency})
                  </Descriptions.Item>
                ))}
                {selected.shippingAddr && (
                  <Descriptions.Item label="收货地址">
                    {selected.shippingAddr.name}, {selected.shippingAddr.city}, {selected.shippingAddr.country}
                  </Descriptions.Item>
                )}
                {selected.paymentId && <Descriptions.Item label="支付">💳 {selected.paymentId}</Descriptions.Item>}
                {selected.shipmentId && <Descriptions.Item label="物流">🚚 {selected.shipmentId}</Descriptions.Item>}
              </Descriptions>
              {selected.status === '待付款' && (
                <Button type="primary" danger block style={{ marginTop: 12 }}
                  onClick={() => {
                    api.createPayment({ orderId: selected.id, amount: selected.totalAmount, currency: selected.currency, channel: 'Stripe' })
                      .then(() => { message.success('支付成功！'); setSelected({ ...selected, status: '已付款' }); });
                  }}>
                  立即支付
                </Button>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
