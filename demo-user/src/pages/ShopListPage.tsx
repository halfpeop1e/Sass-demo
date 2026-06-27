import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Space, Tag, Spin, Empty } from 'antd';
import { ShopOutlined, GlobalOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { api } from '../api';

const { Title, Text } = Typography;

interface Shop { id: string; tenantId: string; name: string; domain: string; theme: string; status: string; createdAt: string; logo?: string }

const themeColors: Record<string, string> = { modern: '#1890ff', tech: '#13c2c2', minimal: '#8c8c8c', luxury: '#722ed1' };

export default function ShopListPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getShops().then(res => {
      const all = res?.data || [];
      setShops(all.filter((s: Shop) => s.status === 'published'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
        borderRadius: 12, padding: '32px 40px', marginBottom: 24, color: '#fff',
      }}>
        <Space direction="vertical" size={4}>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            <ShopOutlined /> 店铺广场
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
            浏览所有已发布的优质店铺，发现跨境好物
          </Text>
        </Space>
      </div>

      {shops.length === 0 ? (
        <Empty description="暂无已发布店铺" />
      ) : (
        <Row gutter={[16, 16]}>
          {shops.map(shop => (
            <Col key={shop.id} xs={24} sm={12} md={8} lg={8}>
              <Link to={`/shops/${shop.id}`} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  cover={
                    <div style={{
                      height: 140, background: `linear-gradient(135deg, ${themeColors[shop.theme] || '#1890ff'}11, ${themeColors[shop.theme] || '#1890ff'}33)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56,
                    }}>
                      <ShopOutlined style={{ color: themeColors[shop.theme] || '#1890ff' }} />
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <Space>
                        {shop.name}
                        <Tag color="green" icon={<CheckCircleOutlined />}>已认证</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Text type="secondary"><GlobalOutlined /> {shop.domain}</Text>
                        <Space>
                          <Tag color={themeColors[shop.theme] || 'blue'}>{shop.theme} 风格</Tag>
                          <Tag color="blue">SSL 安全</Tag>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 11 }}>入驻于 {shop.createdAt}</Text>
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
