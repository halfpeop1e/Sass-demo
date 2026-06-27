import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Badge, Space, Tag, Avatar } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  MonitorOutlined,
  ExpandOutlined,
  SafetyOutlined,
  TransactionOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import styles from './MainLayout.module.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '平台总览',
  },
  {
    key: '/tenants',
    icon: <TeamOutlined />,
    label: '多租户管理',
  },
  {
    key: '/microservices',
    icon: <ApartmentOutlined />,
    label: '微服务拓扑',
  },
  {
    key: '/monitor',
    icon: <MonitorOutlined />,
    label: '系统监控',
  },
  {
    key: '/scaling',
    icon: <ExpandOutlined />,
    label: '弹性伸缩与灾备',
  },
  {
    key: '/payment-logistics',
    icon: <TransactionOutlined />,
    label: '支付与物流',
  },
  {
    key: '/limits',
    icon: <SafetyOutlined />,
    label: '系统限制与规模',
  },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    const matched = menuItems.find(item => item.key !== '/' && path.startsWith(item.key));
    return matched ? matched.key : '/';
  };

  return (
    <Layout className={styles.layoutFull}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
        className={styles.sider}
      >
        <div className={styles.logoContainer}>
          {!collapsed && (
            <Space vertical size={0} className={styles.logoSpace}>
              <Text strong className={styles.logoTitle}>
                <GlobalOutlined /> 跨境SaaS平台
              </Text>
              <Text className={styles.logoSubtitle}>
                大型平台设计 Demo
              </Text>
            </Space>
          )}
          {collapsed && <GlobalOutlined className={styles.logoIcon} />}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className={styles.menuMargin}
        />
      </Sider>

      <Layout className={styles.mainLayout} style={{ marginLeft: collapsed ? 80 : 220 }}>
        <Header className={styles.header}>
          <Space>
            <ThunderboltOutlined className={styles.headerIcon} />
            <Text strong className={styles.headerTitle}>
              跨境电商独立站 SaaS 服务平台 · 运营管理后台
            </Text>
          </Space>
          <Space size="middle">
            <Tag color="green" icon={<ClusterOutlined />}>
              V2 阶段 | 全球化 + 智能化
            </Tag>
            <Badge status="processing" text={<Text className={styles.headerStatusText}>系统运行中</Text>} />
            <Badge status="success" text={<Text className={styles.headerSlaText}>SLA 99.99%</Text>} />
            <Avatar className={styles.headerAvatar} icon={<TeamOutlined />} />
          </Space>
        </Header>

        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
