import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, Badge, Typography, Input, Dropdown, Avatar } from "antd";
import {
  ShoppingCartOutlined,
  HomeOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  UserOutlined,
  GlobalOutlined,
  ShopOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function BuyerLayout() {
  const location = useLocation();
  const [cartCount] = useState(3);

  const menuItems = [
    { key: "/", icon: <HomeOutlined />, label: "首页" },
    { key: "/shops", icon: <ShopOutlined />, label: "店铺广场" },
    { key: "/products", icon: <AppstoreOutlined />, label: "全部商品" },
    { key: "/orders", icon: <OrderedListOutlined />, label: "我的订单" },
  ];

  const getSelectedKey = () => {
    if (location.pathname === "/") return "/";
    if (location.pathname.startsWith("/shops")) return "/shops";
    if (location.pathname.startsWith("/products")) return "/products";
    if (location.pathname.startsWith("/orders")) return "/orders";
    return "/";
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: 60,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GlobalOutlined style={{ fontSize: 20, color: "#fff" }} />
            </div>
            <Text
              strong
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              CrossMall
            </Text>
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[getSelectedKey()]}
            items={menuItems.map((item) => ({
              ...item,
              label: (
                <Link
                  to={item.key}
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  {item.label}
                </Link>
              ),
            }))}
            style={{
              border: "none",
              flex: 1,
              minWidth: 300,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Input.Search
            placeholder="搜索商品..."
            style={{ width: 240 }}
            onSearch={(v) => {
              if (v)
                window.location.href = `/products?q=${encodeURIComponent(v)}`;
            }}
          />
          <Link to="/cart" style={{ position: "relative" }}>
            <Badge count={cartCount} size="small" offset={[-2, 2]}>
              <ShoppingCartOutlined
                style={{ fontSize: 20, color: "#475569", cursor: "pointer" }}
              />
            </Badge>
          </Link>
          <Dropdown
            menu={{
              items: [
                {
                  key: "orders",
                  label: (
                    <Link
                      to="/orders"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      我的订单
                    </Link>
                  ),
                },
                { key: "divider", type: "divider" },
                {
                  key: "logout",
                  label: (
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "#ef4444",
                      }}
                    >
                      退出登录
                    </span>
                  ),
                },
              ],
            }}
          >
            <Avatar
              style={{
                background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                cursor: "pointer",
              }}
              icon={<UserOutlined />}
            />
          </Dropdown>
        </div>
      </Header>

      <Content
        style={{ padding: "24px 40px", minHeight: "calc(100vh - 120px)" }}
      >
        <Outlet />
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "#fff",
          padding: "16px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <Text
          style={{
            color: "#94a3b8",
            fontSize: 12,
            fontFamily: "var(--font-body)",
          }}
        >
          CrossMall 跨境电商独立站 · Powered by SaaS Platform · 支持多语言 |
          多币种 | 全球物流
        </Text>
      </Footer>
    </Layout>
  );
}
