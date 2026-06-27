import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Row, Col, Card, Typography, Space, Tag, Spin, Empty, Select, Button } from 'antd';
import { AppstoreOutlined, DollarOutlined, ShopOutlined } from '@ant-design/icons';
import { api } from '../api';

const { Title, Text } = Typography;

interface Product {
  id: string; title: string; price: number; currency: string;
  images: string[]; category: string; stock: number; sku: string;
  shopId: string;
}

const categoryColors: Record<string, string> = { '服装': 'magenta', '电子': 'blue', '家居': 'orange', '美妆': 'pink' };

export default function ProductListPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    setLoading(true);
    const q = searchParams.get('q') || '';
    api.getProducts(q, category).then(res => {
      setProducts(res?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [searchParams, category]);

  return (
    <div>
      <Title level={4}><AppstoreOutlined /> 全部商品</Title>
      <Space style={{ marginBottom: 16 }}>
        <Space>
          <Text>分类筛选：</Text>
          <Select
            value={category}
            onChange={setCategory}
            style={{ width: 150 }}
            options={[
              { value: '', label: '全部' },
              { value: '服装', label: '👗 服装' },
              { value: '电子', label: '🎧 电子' },
              { value: '家居', label: '🛋️ 家居' },
              { value: '美妆', label: '💄 美妆' },
            ]}
          />
        </Space>
        {category && <Button size="small" onClick={() => setCategory('')}>清除筛选</Button>}
      </Space>

      {loading ? <Spin size="large" style={{ display: 'block', margin: '80px auto' }} /> : (
        <Row gutter={[16, 16]}>
          {products.map(p => (
            <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
              <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                <Card hoverable
                  cover={
                    <div style={{ height: 200, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                      {p.category === '服装' ? '👗' : p.category === '电子' ? '🎧' : p.category === '家居' ? '🛋️' : '💄'}
                    </div>
                  }
                >
                  <Card.Meta
                    title={<Text ellipsis>{p.title}</Text>}
                    description={
                      <Space direction="vertical" size={4}>
                        <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}><DollarOutlined /> {p.price} {p.currency}</Text>
                        <Space>
                          <Tag color={categoryColors[p.category]}>{p.category}</Tag>
                          {p.shopId && (
                            <Link to={`/shops/${p.shopId}`} style={{ fontSize: 11 }}>
                              <Tag color="blue"><ShopOutlined /> 店铺</Tag>
                            </Link>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
          {products.length === 0 && <Col span={24}><Empty description="未找到匹配商品" /></Col>}
        </Row>
      )}
    </div>
  );
}
