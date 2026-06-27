import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Space, Tag, Badge, Select, Avatar } from 'antd';
import {
  ShopOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  DashboardOutlined,
  GlobalOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

export default function MerchantLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '经营仪表盘' },
    { key: '/shop', icon: <ShopOutlined />, label: '店铺管理' },
    { key: '/products', icon: <AppstoreOutlined />, label: '商品管理' },
    { key: '/orders', icon: <OrderedListOutlined />, label: '订单管理' },
  ];

  const getSelectedKey = () => {
    if (location.pathname === '/') return '/';
    const matched = menuItems.find(item => item.key !== '/' && location.pathname.startsWith(item.key));
    return matched ? matched.key : '/';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible collapsed={collapsed} onCollapse={setCollapsed}
        theme="dark" width={220}
        style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {!collapsed ? (
            <Space orientation="vertical" size={0} style={{ textAlign: 'center' }}>
              <Text strong style={{ color: '#fff', fontSize: 15 }}><ShopOutlined /> 商户中心</Text>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>潮流服饰旗舰店</Text>
            </Space>
          ) : <ShopOutlined style={{ color: '#fff', fontSize: 24 }} />}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[getSelectedKey()]} items={menuItems}
          onClick={({ key }) => { navigate(key); }} style={{ marginTop: 8 }} />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 99 }}>
          <Space>
            <GlobalOutlined style={{ color: '#1890ff', fontSize: 16 }} />
            <Text strong style={{ fontSize: 15 }}>跨境电商 SaaS 商户后台</Text>
            <Tag color="blue">Tier: Enterprise | 独立数据库</Tag>
          </Space>
          <Space>
            <Badge status="processing" text="店铺运行中" />
            <Select defaultValue="zh-CN" size="small" style={{ width: 100 }}
              options={[{ value: 'zh-CN', label: '🇨🇳 中文' }, { value: 'en-US', label: '🇺🇸 English' }]} />
            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
          </Space>
        </Header>
        <Content style={{ margin: 16, minHeight: 280 }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center', background: '#f5f5f5', padding: '12px', fontSize: 12 }}>
          <Text type="secondary">CrossMall SaaS Platform · 商户后台 v2.0 · 支持多语言 | 多币种 | 全球履约</Text>
        </Footer>
      </Layout>
    </Layout>
  );
}
