import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Space, Typography, Input, Button, Dropdown } from 'antd';
import {
  ShoppingCartOutlined,
  HomeOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  UserOutlined,
  GlobalOutlined,
  SearchOutlined,
  ShopOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function BuyerLayout() {
  const location = useLocation();
  const [cartCount] = useState(3);

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/shops', icon: <ShopOutlined />, label: '店铺广场' },
    { key: '/products', icon: <AppstoreOutlined />, label: '全部商品' },
    { key: '/orders', icon: <OrderedListOutlined />, label: '我的订单' },
  ];

  const getSelectedKey = () => {
    if (location.pathname === '/') return '/';
    if (location.pathname.startsWith('/shops')) return '/shops';
    if (location.pathname.startsWith('/products')) return '/products';
    if (location.pathname.startsWith('/orders')) return '/orders';
    return '/';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', background: '#fff', borderBottom: '1px solid #f0f0f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Space>
              <GlobalOutlined style={{ fontSize: 22, color: '#1890ff' }} />
              <Text strong style={{ fontSize: 18, color: '#1890ff' }}>CrossMall</Text>
            </Space>
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[getSelectedKey()]}
            items={menuItems.map(item => ({
              ...item,
              label: <Link to={item.key}>{item.label}</Link>,
            }))}
            style={{ border: 'none', flex: 1, minWidth: 300 }}
          />
        </div>
        <Space size="large">
          <Input.Search
            placeholder="搜索商品..."
            style={{ width: 240 }}
            onSearch={(v) => { if (v) window.location.href = `/products?q=${encodeURIComponent(v)}`; }}
          />
          <Link to="/cart">
            <Badge count={cartCount} size="small">
              <ShoppingCartOutlined style={{ fontSize: 20, color: '#333' }} />
            </Badge>
          </Link>
          <Dropdown menu={{ items: [{ key: 'orders', label: <Link to="/orders">我的订单</Link> }, { key: 'logout', label: '退出登录' }] }}>
            <UserOutlined style={{ fontSize: 20, color: '#333', cursor: 'pointer' }} />
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ padding: '24px 40px', background: '#f5f5f5', minHeight: 'calc(100vh - 134px)' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: '#fff', padding: '12px' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          CrossMall 跨境电商独立站 · Powered by SaaS Platform · 支持多语言 | 多币种 | 全球物流
        </Text>
      </Footer>
    </Layout>
  );
}
