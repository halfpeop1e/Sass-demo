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
        width={232}
        className={styles.sider}
      >
        <div className={styles.logoContainer}>
          {!collapsed ? (
            <div className={styles.logo}>
              <div className={styles.logoIconBox}>
                <GlobalOutlined className={styles.logoIconSvg} />
              </div>
              <div className={styles.logoText}>
                <Text strong className={styles.logoTitle}>跨境 SaaS</Text>
                <Text className={styles.logoSubtitle}>Global Commerce Platform</Text>
              </div>
            </div>
          ) : (
            <div className={styles.logoIconBox}>
              <GlobalOutlined className={styles.logoIconSvg} />
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className={styles.menu}
        />
        <div className={styles.siderFooter}>
          {!collapsed && (
            <div className={styles.siderFooterContent}>
              <div className={styles.siderFooterDot} />
              <Text className={styles.siderFooterText}>V2 · 全球化智能平台</Text>
            </div>
          )}
        </div>
      </Sider>

      <Layout className={styles.mainLayout} style={{ marginLeft: collapsed ? 80 : 232 }}>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <ThunderboltOutlined className={styles.headerIcon} />
            <Text strong className={styles.headerTitle}>
              运营管理后台
            </Text>
            <Tag className={styles.headerTag}>V2 阶段 · 全球化+智能化</Tag>
          </div>
          <div className={styles.headerRight}>
            <Badge status="processing" className={styles.headerBadge} text={<span className={styles.headerBadgeText}>系统运行中</span>} />
            <Tag className={styles.headerSlaTag}>SLA 99.99%</Tag>
            <Avatar className={styles.headerAvatar} icon={<TeamOutlined />} />
          </div>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
