import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Space, Tag, Button, InputNumber, Divider,
  Breadcrumb, Spin, Alert, Descriptions, Select, message,
} from 'antd';
import { ShoppingCartOutlined, DollarOutlined, ShopOutlined } from '@ant-design/icons';
import { api } from '../api';

const { Title, Text } = Typography;

interface Product {
  id: string; title: string; price: number; currency: string;
  images: string[]; category: string; stock: number; sku: string;
  description?: string; titleI18n?: Record<string, string>; tenantId: string; shopId: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    api.getProduct(id).then(res => {
      setProduct(res?.data || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  if (!product) return <Alert type="error" message="商品不存在" showIcon />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumb items={[
        { title: <Link to="/">首页</Link> },
        { title: <Link to="/products">全部商品</Link> },
        { title: product.title },
      ]} style={{ marginBottom: 16 }} />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <div style={{
            height: 400, background: 'linear-gradient(135deg, #e6f7ff, #f9f0ff)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120,
          }}>
            {product.category === '服装' ? '👗' : product.category === '电子' ? '🎧' : product.category === '家居' ? '🛋️' : '💄'}
          </div>
        </Col>
        <Col xs={24} md={14}>
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <Tag color="blue">{product.category}</Tag>
                <Text type="secondary">SKU: {product.sku}</Text>
              </Space>
              {product.shopId && (
                <Link to={`/shops/${product.shopId}`}>
                  <Button size="small" icon={<ShopOutlined />} type="link">进入店铺</Button>
                </Link>
              )}
              <Title level={3} style={{ margin: 0 }}>{product.title}</Title>
              {product.titleI18n && Object.keys(product.titleI18n).length > 0 && (
                <Space wrap>
                  {Object.entries(product.titleI18n).map(([lang, t]) => (
                    <Tag key={lang}>{lang}: {t}</Tag>
                  ))}
                </Space>
              )}
              <Text type="secondary">{product.description}</Text>

              <div style={{ background: '#fff7e6', padding: 16, borderRadius: 8 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#ff4d4f' }}>
                  <DollarOutlined /> {product.price}
                </Text>
                <Text type="secondary"> {product.currency}</Text>
                <Text type="secondary" style={{ marginLeft: 16 }}>库存：{product.stock} 件</Text>
              </div>

              <Divider />

              <Space size="large">
                <Space>
                  <Text>数量：</Text>
                  <InputNumber min={1} max={product.stock} value={qty} onChange={v => v && setQty(v)} />
                </Space>
                <Text type="secondary">小计：<Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>{(product.price * qty).toFixed(2)} {product.currency}</Text></Text>
              </Space>

              <Space size="large" style={{ marginTop: 12 }}>
                <Button type="primary" size="large" icon={<ShoppingCartOutlined />}
                  onClick={() => message.success('已加入购物车')}>
                  加入购物车
                </Button>
                <Button type="default" size="large" danger
                  onClick={() => {
                    api.createOrder({
                      tenantId: product.tenantId,
                      buyerId: 'BUY-DEMO',
                      items: [{ productId: product.id, title: product.title, quantity: qty, unitPrice: product.price }],
                      totalAmount: product.price * qty,
                      currency: product.currency,
                      shippingAddr: { name: 'Demo User', phone: '+86-13800000000', country: 'US', state: 'CA', city: 'LA', line1: '123 Demo St', postCode: '90001' },
                    }).then(res => {
                      if (res.code === 201 || res.code === 200) {
                        message.success('下单成功！订单号: ' + res.data?.id);
                      }
                    });
                  }}>
                  立即购买
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
