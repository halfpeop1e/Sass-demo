import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Tag, Space, Table, Timeline, Alert, Select } from 'antd';
import {
  ArrowUpOutlined, ShoppingCartOutlined, DollarOutlined, AppstoreOutlined, ShopOutlined,
} from '@ant-design/icons';
import { merchantApi } from '../api/merchantApi';

const { Title, Text } = Typography;

interface Order { id: string; status: string; totalAmount: number; currency: string; createdAt: string; items: { productId: string; title: string; quantity: number }[] }
interface Product { id: string; title: string; shopId: string; stock: number; price: number; currency: string; status: string }
interface Shop { id: string; name: string; domain: string; status: string; theme: string }

const TENANT_ID = 'T001';

export default function MerchantDashboard() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    merchantApi.getShops(TENANT_ID).then(r => {
      const list: Shop[] = r?.data || [];
      setShops(list);
      if (list.length > 0) setSelectedShopId(list[0].id);
    });
    merchantApi.getOrders(TENANT_ID).then(r => setOrders(r?.data || []));
  }, []);

  useEffect(() => {
    if (!selectedShopId) return;
    merchantApi.getProductsByShop(selectedShopId).then(r => setProducts(r?.data || []));
  }, [selectedShopId]);

  const selectedShop = shops.find(s => s.id === selectedShopId);
  const filteredOrders = orders;
  const totalRevenue = filteredOrders.filter(o => o.status !== '待付款').reduce((s, o) => s + o.totalAmount, 0);
  const activeProducts = products.filter(p => p.status === 'active').length;
  const recentOrders = filteredOrders.slice(0, 5);

  return (
    <div>
      <Space style={{ marginBottom: 8 }}>
        <Title level={4} style={{ margin: 0 }}>经营仪表盘</Title>
        <Tag color="blue">{TENANT_ID}</Tag>
      </Space>

      <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
        <Space size="large" align="center">
          <Space>
            <ShopOutlined />
            <Text strong>当前店铺：</Text>
            <Select
              value={selectedShopId}
              onChange={v => setSelectedShopId(v)}
              style={{ minWidth: 220 }}
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
              <Tag color="blue">{selectedShop.theme}</Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>{selectedShop.domain}</Text>
            </Space>
          )}
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="总收入" value={totalRevenue.toFixed(2)} prefix={<DollarOutlined />} suffix="USD"
              styles={{ content: { color: '#52c41a', fontWeight: 'bold' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="总订单" value={filteredOrders.length} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="在售商品" value={activeProducts} prefix={<AppstoreOutlined />}
              styles={{ content: { color: activeProducts > 0 ? '#52c41a' : '#8c8c8c', fontWeight: 'bold' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="店铺"
              value={shops.length} suffix={`个 / ${shops.filter(s => s.status === 'published').length} 已发布`}
              prefix={<ShopOutlined />}
              styles={{ content: { fontWeight: 'bold', fontSize: 18 } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={`最近订单 — ${selectedShop?.name || ''}`} size="small">
            <Table dataSource={recentOrders} rowKey="id" size="small" pagination={false}
              columns={[
                { title: '订单号', dataIndex: 'id', width: 160 },
                { title: '状态', dataIndex: 'status', width: 70, render: (v: string) => <Tag color={v === '已完成' ? 'green' : v === '待付款' ? 'orange' : 'blue'}>{v}</Tag> },
                { title: '金额', dataIndex: 'totalAmount', width: 90, render: (v: number, r: Order) => <Text strong>{v} {r.currency}</Text> },
                { title: '商品', key: 'items', render: (_: unknown, r: Order) => r.items?.map(i => i.title).join(', ') },
                { title: '时间', dataIndex: 'createdAt', width: 160 },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="店铺概览" size="small">
            {shops.map(s => (
              <div key={s.id} style={{
                marginBottom: 12,
                padding: '8px 12px',
                background: s.id === selectedShopId ? '#e6f7ff' : 'transparent',
                borderRadius: 6,
                border: s.id === selectedShopId ? '1px solid #91d5ff' : '1px solid transparent',
                cursor: 'pointer',
              }} onClick={() => setSelectedShopId(s.id)}>
                <Space orientation="vertical" size={2}>
                  <Space>
                    <Text strong style={{ color: s.id === selectedShopId ? '#1890ff' : undefined }}>{s.name}</Text>
                    {s.id === selectedShopId && <Tag color="blue" style={{ fontSize: 10 }}>当前</Tag>}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>{s.domain}</Text>
                  <Space size={4}>
                    <Tag color="blue" style={{ fontSize: 10 }}>{s.theme}</Tag>
                    <Tag color={s.status === 'published' ? 'green' : 'orange'} style={{ fontSize: 10 }}>{s.status}</Tag>
                  </Space>
                </Space>
              </div>
            ))}
            <Alert type="info" title="💡 点击各店铺可切换查看数据" style={{ fontSize: 12, marginTop: 8 }} />
          </Card>

          <Card title="经营进度" size="small" style={{ marginTop: 16 }}>
            <Timeline
              items={[
                { content: <><Text strong>开户入驻</Text><br /><Text type="secondary">已完成：2025-01-15，Enterprise 套餐</Text></> },
                { content: <><Text strong>已创建 {shops.length} 个店铺</Text><br /><Text type="secondary">{shops.filter(s => s.status === 'published').length} 个已发布，{shops.filter(s => s.status !== 'published').length} 个草稿</Text></> },
                { content: <><Text strong>商品上架</Text><br /><Text type="secondary">当前店铺有 {activeProducts} 个在售商品</Text></> },
                { content: <><Text strong>开始接单</Text><br /><Text type="secondary">累计 {orders.length} 笔订单</Text></> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
