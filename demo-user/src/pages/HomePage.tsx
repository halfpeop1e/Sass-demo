import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Space, Tag, Spin, Empty, Statistic } from 'antd';
import {
  FireOutlined,
  ShopOutlined,
  RocketOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { api } from '../api';

const { Title, Text } = Typography;

interface Product {
  id: string; title: string; price: number; currency: string;
  images: string[]; category: string; sku: string; stock: number;
  shopId: string; tenantId: string;
  description?: string; titleI18n?: Record<string, string>;
}

const categoryColors: Record<string, string> = { '服装': 'magenta', '电子': 'blue', '家居': 'orange', '美妆': 'pink' };

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllProducts().then(res => {
      setProducts(res?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
        borderRadius: 12, padding: '40px 48px', marginBottom: 24, color: '#fff',
      }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={8}>
              <Title level={2} style={{ color: '#fff', margin: 0 }}>
                <GlobalOutlined /> 跨境好物，全球直达
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                CrossMall — 品质中国制造，直送美国及东南亚
              </Text>
              <Space size="large" style={{ marginTop: 8 }}>
                <Statistic value="10,000+" title="商品" />
                <Statistic value="50+" title="国家/地区" />
                <Statistic value="99.9%" title="可用性 SLA" />
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Tag icon={<FireOutlined />} color="red" style={{ fontSize: 14, padding: '4px 12px' }}>热销推荐</Tag>
      </Space>

      {loading ? <Spin size="large" style={{ display: 'block', margin: '80px auto' }} /> : (
        <Row gutter={[16, 16]}>
          {products.map(p => (
            <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
              <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 200, background: `#e6f7ff`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                      {p.category === '服装' ? '👗' : p.category === '电子' ? '🎧' : p.category === '家居' ? '🛋️' : '💄'}
                    </div>
                  }
                >
                  <Card.Meta
                    title={<Text ellipsis>{p.title}</Text>}
                    description={
                      <Space direction="vertical" size={4}>
                        <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                          <DollarOutlined /> {p.price} {p.currency}
                        </Text>
                        <Space>
                          <Tag color={categoryColors[p.category]}>{p.category}</Tag>
                          {p.shopId && (
                            <Link to={`/shops/${p.shopId}`} style={{ fontSize: 11 }}>
                              <Tag color="blue"><ShopOutlined /> 店铺</Tag>
                            </Link>
                          )}
                          {p.stock < 50 && <Tag color="orange">仅剩 {p.stock} 件</Tag>}
                        </Space>
                      </Space>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
          {products.length === 0 && <Col span={24}><Empty description="暂无商品" /></Col>}
        </Row>
      )}
    </div>
  );
}
