import { useState } from 'react';
import { Table, Button, Tag, Typography, Space, InputNumber, Empty, Card, Divider, message } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

const { Title, Text } = Typography;

interface CartItem {
  id: string; productId: string; title: string; price: number; currency: string; quantity: number; category: string;
}

const mockCart: CartItem[] = [
  { id: '1', productId: 'P001', title: '夏季新款连衣裙', price: 29.99, currency: 'USD', quantity: 2, category: '服装' },
  { id: '2', productId: 'P003', title: '无线蓝牙耳机', price: 49.99, currency: 'USD', quantity: 1, category: '电子' },
  { id: '3', productId: 'P007', title: '保湿精华液', price: 34.99, currency: 'USD', quantity: 1, category: '美妆' },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(mockCart);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkout = () => {
    api.createOrder({
      tenantId: 'T001',
      buyerId: 'BUY-DEMO',
      items: cart.map(item => ({ productId: item.productId, title: item.title, quantity: item.quantity, unitPrice: item.price })),
      totalAmount: total,
      currency: 'USD',
      shippingAddr: { name: 'Demo User', phone: '+1-555-0000', country: 'US', state: 'CA', city: 'LA', line1: '123 Demo St', postCode: '90001' },
    }).then(res => {
      if (res.code === 201 || res.code === 200) {
        message.success('下单成功！订单号: ' + res.data?.id);
        setCart([]);
        navigate('/orders');
      } else {
        message.error('下单失败: ' + (res.message || ''));
      }
    });
  };

  if (cart.length === 0) {
    return (
      <div>
        <Title level={4}><ShoppingCartOutlined /> 购物车</Title>
        <Card><Empty description="购物车为空"><Link to="/products"><Button type="primary">去逛逛</Button></Link></Empty></Card>
      </div>
    );
  }

  return (
    <div>
      <Title level={4}><ShoppingCartOutlined /> 购物车 ({cart.length} 件商品)</Title>
      <Card>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Space size="large">
              <div style={{ width: 60, height: 60, background: '#e6f7ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {item.category === '服装' ? '👗' : item.category === '电子' ? '🎧' : '💄'}
              </div>
              <div>
                <Text strong>{item.title}</Text>
                <br />
                <Text type="secondary">{item.category}</Text>
              </div>
            </Space>
            <Space size="large">
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                  <DollarOutlined /> {item.price}
                </Text>
                <br />
                <InputNumber size="small" min={1} value={item.quantity}
                  onChange={v => { setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: v || 1 } : i)); }} />
              </div>
              <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
              <Button type="text" danger icon={<DeleteOutlined />}
                onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} />
            </Space>
          </div>
        ))}
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <Text style={{ fontSize: 18 }}>
            合计：<Text strong style={{ color: '#ff4d4f', fontSize: 24 }}>${total.toFixed(2)}</Text> USD
          </Text>
          <Space>
            <Link to="/products"><Button size="large">继续购物</Button></Link>
            <Button type="primary" size="large" danger onClick={checkout}>
              提交订单
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}
