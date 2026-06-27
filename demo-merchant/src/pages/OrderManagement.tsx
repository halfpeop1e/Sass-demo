import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Space, Button, Card, Descriptions, Modal, Select, message, Timeline, Badge } from 'antd';
import { OrderedListOutlined, ReloadOutlined, SendOutlined, TruckOutlined, ShopOutlined } from '@ant-design/icons';
import { merchantApi } from '../api/merchantApi';

const { Title, Text } = Typography;
const TENANT_ID = 'T001';

interface Shop { id: string; name: string; domain: string; theme: string; status: string }
interface Order { id: string; buyerId: string; status: string; totalAmount: number; currency: string; createdAt: string; items: { productId: string; title: string; quantity: number; unitPrice: number }[]; shippingAddr: { name: string; country: string; city: string }; paymentId?: string; shipmentId?: string }

const statusOptions = ['待付款', '已付款', '已发货', '已签收', '已完成', '退款中', '已退款', '已取消'];
const statusColor: Record<string, string> = {
  '待付款': 'orange', '已付款': 'blue', '已发货': 'cyan', '已签收': 'green', '已完成': 'green', '退款中': 'orange', '已退款': 'default', '已取消': 'default',
};
const shopNameMap: Record<string, string> = {
  'SHOP-001': '潮流服饰旗舰店', 'SHOP-002': '数码配件专营店', 'SHOP-003': '家居好物精选', 'SHOP-004': '美妆护肤品牌店',
};

export default function OrderManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    merchantApi.getShops(TENANT_ID).then(r => {
      const list: Shop[] = r?.data || [];
      setShops(list);
      if (list.length > 0) setSelectedShopId(list[0].id);
    });
  }, []);

  const refresh = () => {
    setLoading(true);
    merchantApi.getOrders(TENANT_ID).then(r => {
      const all: Order[] = r?.data || [];
      setAllOrders(all);
      setLoading(false);
    });
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!selectedShopId) {
      setOrders(allOrders);
    } else {
      setOrders(allOrders);
    }
    setSelected(prev => {
      if (!prev) return orders[0] || null;
      return orders.find(o => o.id === prev.id) || orders[0] || null;
    });
  }, [selectedShopId, allOrders]);

  const handleStatusChange = () => {
    if (!selected || !newStatus) return;
    merchantApi.updateOrderStatus(selected.id, newStatus).then(r => {
      if (r.code === 200) { message.success('订单状态已更新'); setStatusOpen(false); refresh(); }
      else message.error('更新失败');
    });
  };

  const handleShip = (order: Order) => {
    merchantApi.createShipment({
      orderId: order.id, tenantId: TENANT_ID,
      carrier: 'DHL Express',
    }).then(r => {
      if (r.code === 201) {
        message.success('发货单已创建，运单号: ' + r.data?.trackingNo);
        merchantApi.updateOrderStatus(order.id, '已发货').then(() => refresh());
      }
    });
  };

  const selectedShop = shops.find(s => s.id === selectedShopId);

  const columns = [
    { title: '订单号', dataIndex: 'id', width: 160 },
    { title: '买家', dataIndex: 'buyerId', width: 80 },
    { title: '状态', dataIndex: 'status', width: 70, render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag> },
    { title: '金额', dataIndex: 'totalAmount', width: 90, render: (v: number, r: Order) => <Text strong style={{ color: '#ff4d4f' }}>{v} {r.currency}</Text> },
    { title: '商品', key: 'items', width: 140, ellipsis: true as const,
      render: (_: unknown, r: Order) => r.items?.map(i => i.title).join(', ') },
    { title: '时间', dataIndex: 'createdAt', width: 160 },
    { title: '操作', width: 180,
      render: (_: unknown, r: Order) => (
        <Space size={4}>
          {r.status === '已付款' && <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => handleShip(r)}>发货</Button>}
          <Button size="small" onClick={() => { setSelected(r); setNewStatus(''); setStatusOpen(true); }}>改状态</Button>
        </Space>
      )},
  ];

  return (
    <div>
      <Title level={4}><OrderedListOutlined /> 订单管理</Title>

      <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
        <Space size="large" align="center">
          <Space>
            <ShopOutlined />
            <Text strong>当前店铺：</Text>
            <Select
              value={selectedShopId}
              onChange={v => setSelectedShopId(v)}
              style={{ minWidth: 200 }}
              options={shops.map(s => ({
                value: s.id,
                label: `${s.name} (${s.id})`,
              }))}
            />
          </Space>
          {selectedShop && (
            <Space size={4}>
              <Tag color={selectedShop.status === 'published' ? 'green' : 'orange'}>
                {selectedShop.status === 'published' ? '已发布' : '草稿'}
              </Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>共 {orders.length} 笔订单</Text>
            </Space>
          )}
        </Space>
      </Card>

      <Button icon={<ReloadOutlined />} onClick={refresh} style={{ marginBottom: 16 }}>刷新</Button>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 3 }}>
          <Table dataSource={orders} columns={columns} rowKey="id" size="small" loading={loading}
            pagination={{ pageSize: 8 }} scroll={{ x: 950 }}
            onRow={(r) => ({ onClick: () => setSelected(r), style: { cursor: 'pointer', background: selected?.id === r.id ? '#e6f7ff' : '' } })} />
        </div>

        {selected && (
          <Card title="订单详情" size="small" style={{ flex: 2 }}>
            <Timeline
              items={[
                { content: '下单成功' },
                { content: selected.status !== '待付款' ? '已付款 ✅' : '待付款 ⏳' },
                { content: ['已发货','已签收','已完成'].includes(selected.status) ? '已发货 📦' : '待发货' },
                { content: ['已签收','已完成'].includes(selected.status) ? '已签收 ✅' : '运输中' },
              ]}
            />
            <Descriptions bordered size="small" column={1} style={{ marginTop: 12 }}>
              <Descriptions.Item label="订单ID">{selected.id}</Descriptions.Item>
              <Descriptions.Item label="买家">{selected.buyerId}</Descriptions.Item>
              <Descriptions.Item label="金额"><Text strong style={{ color: '#ff4d4f' }}>{selected.totalAmount} {selected.currency}</Text></Descriptions.Item>
              <Descriptions.Item label="状态"><Badge status={selected.status === '待付款' ? 'processing' : 'success'} text={selected.status} /></Descriptions.Item>
              {selected.items?.map((item, i) => (
                <Descriptions.Item key={i} label={`商品${i+1}`}>{item.title} × {item.quantity}</Descriptions.Item>
              ))}
              <Descriptions.Item label="收货地址">{selected.shippingAddr?.name}, {selected.shippingAddr?.city}, {selected.shippingAddr?.country}</Descriptions.Item>
              {selected.paymentId && <Descriptions.Item label="支付ID">{selected.paymentId}</Descriptions.Item>}
              {selected.shipmentId && <Descriptions.Item label="物流ID">{selected.shipmentId}</Descriptions.Item>}
            </Descriptions>

            <Space style={{ marginTop: 12 }}>
              <Button onClick={() => setStatusOpen(true)}>修改状态</Button>
              {selected.status === '已付款' && <Button type="primary" icon={<TruckOutlined />} onClick={() => handleShip(selected)}>发货</Button>}
            </Space>
          </Card>
        )}
      </div>

      <Modal title="修改订单状态" open={statusOpen} onOk={handleStatusChange} onCancel={() => setStatusOpen(false)}>
        <Select value={newStatus} onChange={setNewStatus} style={{ width: '100%' }}
          placeholder="选择新状态"
          options={statusOptions.filter(s => s !== selected?.status).map(s => ({ value: s, label: s }))} />
      </Modal>
    </div>
  );
}
