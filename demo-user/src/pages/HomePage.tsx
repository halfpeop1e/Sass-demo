import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Tag,
  Spin,
  Empty,
  Statistic,
} from "antd";
import {
  FireOutlined,
  ShopOutlined,
  DollarOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { api } from "../api";

const { Title, Text } = Typography;

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  sku: string;
  stock: number;
  shopId: string;
  tenantId: string;
  description?: string;
  titleI18n?: Record<string, string>;
}

const categoryColors: Record<string, string> = {
  服装: "magenta",
  电子: "blue",
  家居: "orange",
  美妆: "pink",
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAllProducts()
      .then((res) => {
        setProducts(res?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div
        className="page-enter stagger-1"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0284c7 100%)",
          borderRadius: 16,
          padding: "48px 56px",
          marginBottom: 24,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(2, 132, 199, 0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
        <Row align="middle" justify="space-between">
          <Col style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  <GlobalOutlined />
                </div>
                <Title
                  level={2}
                  style={{
                    color: "#fff",
                    margin: 0,
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    fontSize: 28,
                  }}
                >
                  跨境好物，全球直达
                </Title>
              </div>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 16,
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.6,
                  marginLeft: 54,
                }}
              >
                CrossMall — 品质中国制造，直送美国及东南亚
              </Text>
              <Space size="large" style={{ marginTop: 8, marginLeft: 54 }}>
                <Statistic
                  value="10,000+"
                  title="商品"
                  styles={{
                    content: {
                      color: "#fff",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                    },
                  }}
                />
                <Statistic
                  value="50+"
                  title="国家/地区"
                  styles={{
                    content: {
                      color: "#fff",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                    },
                  }}
                />
                <Statistic
                  value="99.9%"
                  title="可用性 SLA"
                  styles={{
                    content: {
                      color: "#fff",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                    },
                  }}
                />
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      <div className="page-enter stagger-2" style={{ marginBottom: 16 }}>
        <Space>
          <Tag
            icon={<FireOutlined />}
            color="red"
            style={{
              fontSize: 14,
              padding: "6px 14px",
              borderRadius: 8,
              fontWeight: 600,
              fontFamily: "var(--font-heading)",
            }}
          >
            热销推荐
          </Tag>
        </Space>
      </div>

      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "80px auto" }} />
      ) : (
        <Row gutter={[16, 16]}>
          {products.map((p, index) => (
            <Col
              key={p.id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              className={`page-enter stagger-${(index % 6) + 1}`}
            >
              <Link to={`/products/${p.id}`} style={{ textDecoration: "none" }}>
                <Card
                  hoverable
                  className="card-hover"
                  style={{ borderRadius: 12, overflow: "hidden" }}
                  styles={{ body: { padding: "16px" } }}
                  cover={
                    <div
                      style={{
                        height: 200,
                        background:
                          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 56,
                        position: "relative",
                      }}
                    >
                      {p.category === "服装"
                        ? "👗"
                        : p.category === "电子"
                          ? "🎧"
                          : p.category === "家居"
                            ? "🛋️"
                            : "💄"}
                      {p.stock < 50 && (
                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            background: "rgba(220, 38, 38, 0.9)",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          仅剩 {p.stock} 件
                        </div>
                      )}
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <Text
                        ellipsis
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                          fontSize: 15,
                          color: "var(--color-text)",
                        }}
                      >
                        {p.title}
                      </Text>
                    }
                    description={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 4,
                          }}
                        >
                          <DollarOutlined
                            style={{ color: "#dc2626", fontSize: 16 }}
                          />
                          <Text
                            strong
                            style={{
                              fontSize: 20,
                              color: "#dc2626",
                              fontFamily: "var(--font-heading)",
                              fontWeight: 700,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {p.price}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#dc2626",
                              fontFamily: "var(--font-body)",
                              fontWeight: 500,
                            }}
                          >
                            {p.currency}
                          </Text>
                        </div>
                        <Space size={4} wrap>
                          <Tag
                            color={categoryColors[p.category]}
                            style={{
                              borderRadius: 6,
                              fontFamily: "var(--font-body)",
                              fontWeight: 500,
                              fontSize: 12,
                            }}
                          >
                            {p.category}
                          </Tag>
                          {p.shopId && (
                            <Link
                              to={`/shops/${p.shopId}`}
                              style={{ fontSize: 11 }}
                            >
                              <Tag
                                color="blue"
                                style={{
                                  borderRadius: 6,
                                  fontFamily: "var(--font-body)",
                                  fontWeight: 500,
                                  fontSize: 12,
                                }}
                              >
                                <ShopOutlined /> 店铺
                              </Tag>
                            </Link>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
          {products.length === 0 && (
            <Col span={24}>
              <Empty description="暂无商品" />
            </Col>
          )}
        </Row>
      )}
    </div>
  );
}
