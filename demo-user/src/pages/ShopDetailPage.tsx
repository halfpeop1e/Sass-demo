import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Space, Tag, Spin, Empty, Breadcrumb, Descriptions, Divider } from 'antd';
import { ShopOutlined, GlobalOutlined, CheckCircleOutlined, AppstoreOutlined, DollarOutlined } from '@ant-design/icons';
import { api } from '../api';

const { Title, Text } = Typography;

interface Shop { id: string; tenantId: string; name: string; domain: string; theme: string; status: string; createdAt: string; logo?: string }

interface Product { id: string; shopId: string; title: string; price: number; currency: string; images: string[]; category: string; stock: number; sku: string; description?: string; titleI18n?: Record<string, string> }

const themeColors: Record<string, string> = { modern: '#1890ff', tech: '#13c2c2', minimal: '#8c8c8c', luxury: '#722ed1' };
const categoryColors: Record<string, string> = { '服装': 'magenta', '电子': 'blue', '家居': 'orange', '美妆': 'pink' };

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getShop(id),
      api.getProductsByShop(id),
    ]).then(([shopRes, prodRes]) => {
      setShop(shopRes?.data || null);
      setProducts(prodRes?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  if (!shop) return <Empty description="店铺不存在" />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumb items={[
        { title: <Link to="/">首页</Link> },
        { title: <Link to="/shops">店铺广场</Link> },
        { title: shop.name },
      ]} style={{ marginBottom: 16 }} />

      {/* 店铺信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <div style={{
                width: 80, height: 80, borderRadius: 12,
                background: `linear-gradient(135deg, ${themeColors[shop.theme] || '#1890ff'}11, ${themeColors[shop.theme] || '#1890ff'}33)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
              }}>
                <ShopOutlined style={{ color: themeColors[shop.theme] || '#1890ff' }} />
              </div>
              <Space direction="vertical" size={2}>
                <Title level={4} style={{ margin: 0 }}>{shop.name}</Title>
                <Space>
                  <Tag color="green" icon={<CheckCircleOutlined />}>已认证</Tag>
                  <Tag color="blue">SSL 安全</Tag>
                  <Tag color={themeColors[shop.theme] || 'blue'}>{shop.theme} 风格</Tag>
                </Space>
              </Space>
            </Space>
          </Col>
          <Col>
            <Text type="secondary"><GlobalOutlined /> {shop.domain}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>入驻于 {shop.createdAt}</Text>
          </Col>
        </Row>
      </Card>

      <Divider><AppstoreOutlined /> 店铺商品 ({products.length})</Divider>

      {products.length === 0 ? (
        <Empty description="该店铺暂无商品" />
      ) : (
        <Row gutter={[16, 16]}>
          {products.map(p => (
            <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
              <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 180, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                      {p.category === '服装' ? '👗' : p.category === '电子' ? '🎧' : p.category === '家居' ? '🛋️' : '💄'}
                    </div>
                  }
                >
                  <Card.Meta
                    title={<Text ellipsis>{p.title}</Text>}
                    description={
                      <Space direction="vertical" size={4}>
                        <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
                          <DollarOutlined /> {p.price} {p.currency}
                        </Text>
                        <Space>
                          <Tag color={categoryColors[p.category]}>{p.category}</Tag>
                          {p.stock < 50 && <Tag color="orange">仅剩 {p.stock} 件</Tag>}
                        </Space>
                      </Space>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
