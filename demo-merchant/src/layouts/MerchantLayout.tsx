import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Typography,
  Tag,
  Badge,
  Select,
  Avatar,
  Button,
} from "antd";
import {
  ShopOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  DashboardOutlined,
  GlobalOutlined,
  UserOutlined,
  BellOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

export default function MerchantLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: "经营仪表盘" },
    { key: "/shop", icon: <ShopOutlined />, label: "店铺管理" },
    { key: "/products", icon: <AppstoreOutlined />, label: "商品管理" },
    { key: "/orders", icon: <OrderedListOutlined />, label: "订单管理" },
  ];

  const getSelectedKey = () => {
    if (location.pathname === "/") return "/";
    const matched = menuItems.find(
      (item) => item.key !== "/" && location.pathname.startsWith(item.key),
    );
    return matched ? matched.key : "/";
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={232}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          background: "linear-gradient(180deg, #0f1729 0%, #111827 100%)",
          borderRight: "1px solid rgba(99, 102, 241, 0.08)",
        }}
      >
        <div
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(99, 102, 241, 0.08)",
            padding: "0 20px",
          }}
        >
          {!collapsed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShopOutlined style={{ color: "#fff", fontSize: 18 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Text
                  strong
                  style={{
                    color: "#f9fafb",
                    fontFamily: "var(--font-heading)",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  商户中心
                </Text>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Merchant Console
                </Text>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShopOutlined style={{ color: "#fff", fontSize: 18 }} />
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 12, padding: "0 8px", borderInlineEnd: "none" }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            padding: "0 20px",
          }}
        >
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 8px rgba(52,211,153,0.4)",
                }}
              />
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 11,
                  letterSpacing: "0.03em",
                }}
              >
                Enterprise · 独立数据库
              </Text>
            </div>
          )}
        </div>
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 232,
          transition: "margin-left var(--transition-base)",
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            height: 56,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(99, 102, 241, 0.06)",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <GlobalOutlined style={{ color: "#6366f1", fontSize: 18 }} />
            <Text
              strong
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: "#111827",
              }}
            >
              跨境电商 SaaS · 商户后台
            </Text>
            <Tag
              style={{
                background: "rgba(99,102,241,0.08)",
                borderColor: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                fontSize: 11,
                fontWeight: 500,
                borderRadius: 6,
                padding: "0 8px",
              }}
            >
              <CheckCircleOutlined /> Enterprise
            </Tag>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Badge
              status="processing"
              text={
                <span style={{ color: "#6b7280", fontSize: 12 }}>运行中</span>
              }
            />
            <Select
              defaultValue="zh-CN"
              size="small"
              style={{ width: 100, borderRadius: 8 }}
              options={[
                { value: "zh-CN", label: "🇨🇳 中文" },
                { value: "en-US", label: "🇺🇸 English" },
              ]}
            />
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: "#6b7280" }}
            />
            <Avatar
              style={{
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
              }}
              icon={<UserOutlined />}
            />
          </div>
        </Header>
        <Content style={{ padding: 20, minHeight: "calc(100vh - 56px)" }}>
          <Outlet />
        </Content>
        <Footer
          style={{
            textAlign: "center",
            background: "#f9fafb",
            padding: "14px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <Text
            style={{
              color: "#9ca3af",
              fontSize: 12,
              fontFamily: "var(--font-body)",
            }}
          >
            CrossMall SaaS Platform · 商户后台 v2.0 · 支持多语言 | 多币种 |
            全球履约
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
}
