import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Space, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Alert, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UploadOutlined, ShopOutlined } from '@ant-design/icons';
import { merchantApi } from '../api/merchantApi';

const { Title, Text } = Typography;
const TENANT_ID = 'T001';

interface Shop { id: string; name: string; domain: string; theme: string; status: string }

const shopNameMap: Record<string, string> = {
  'SHOP-001': '潮流服饰旗舰店',
  'SHOP-002': '数码配件专营店',
  'SHOP-003': '家居好物精选',
  'SHOP-004': '美妆护肤品牌店',
};

export default function ProductManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [products, setProducts] = useState([] as unknown[]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    merchantApi.getShops(TENANT_ID).then(r => {
      const list: Shop[] = r?.data || [];
      setShops(list);
      if (list.length > 0 && !selectedShopId) {
        setSelectedShopId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedShopId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    merchantApi.getProductsByShop(selectedShopId).then(r => {
      setProducts(r?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedShopId]);

  const refresh = () => {
    if (!selectedShopId) return;
    setLoading(true);
    merchantApi.getProductsByShop(selectedShopId).then(r => {
      setProducts(r?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const selectedShop = shops.find(s => s.id === selectedShopId);

  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    setEditOpen(true);
  };

  const handleEdit = (record: Record<string, unknown>) => {
    setEditing(record);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    merchantApi.deleteProduct(id).then(r => {
      if (r.code === 200) { message.success('商品已删除'); refresh(); }
    });
  };

  const handleSave = () => {
    form.validateFields().then((values: Record<string, unknown>) => {
      const data = { ...values, tenantId: TENANT_ID, shopId: selectedShopId };
      if (editing) {
        merchantApi.updateProduct(editing.id as string, data).then(r => {
          if (r.code === 200) { message.success('商品已更新'); setEditOpen(false); refresh(); }
          else message.error('更新失败: ' + (r.message || ''));
        });
      } else {
        merchantApi.createProduct(data).then(r => {
          if (r.code === 201 || r.code === 200) { message.success('商品已创建'); setEditOpen(false); refresh(); }
          else message.error('创建失败: ' + (r.message || ''));
        });
      }
    });
  };

  const columns = [
    { title: '商品ID', dataIndex: 'id', width: 70 },
    { title: '商品名称', dataIndex: 'title', width: 160, ellipsis: true as const },
    { title: 'SKU', dataIndex: 'sku', width: 80 },
    { title: '所属店铺', dataIndex: 'shopId', width: 110,
      render: (v: string) => {
        const name = shopNameMap[v] || v;
        return <Tag color="purple" icon={<ShopOutlined />}>{name}</Tag>;
      } },
    { title: '分类', dataIndex: 'category', width: 70, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '价格', dataIndex: 'price', width: 80, render: (v: number) => <Text strong style={{ color: '#ff4d4f' }}>${v}</Text> },
    { title: '库存', dataIndex: 'stock', width: 60, render: (v: number) => <Text style={{ color: v < 50 ? '#ff4d4f' : '#52c41a' }}>{v}</Text> },
    { title: '状态', dataIndex: 'status', width: 60, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag> },
    { title: '操作', width: 140,
      render: (_: unknown, r: Record<string, unknown>) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id as string)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )},
  ];

  return (
    <div>
      <Title level={4}>商品管理</Title>

      <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
        <Space size="large" align="center">
          <Space>
            <ShopOutlined />
            <Text strong>当前店铺：</Text>
            <Select
              value={selectedShopId}
              onChange={v => setSelectedShopId(v)}
              style={{ minWidth: 220 }}
              options={shops.map(s => ({
                value: s.id,
                label: `${s.name} (${s.id})`,
              }))}
            />
          </Space>
          {selectedShop && (
            <Space size={4}>
              <Tag color={selectedShop.status === 'published' ? 'green' : 'orange'}>
                {selectedShop.status === 'published' ? '已发布' : '草稿'}
              </Tag>
              <Tag color="blue">{selectedShop.theme}</Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>{selectedShop.domain}</Text>
            </Space>
          )}
        </Space>
      </Card>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} disabled={!selectedShopId}>
          新增商品
        </Button>
        <Button icon={<UploadOutlined />} disabled={!selectedShopId}>
          批量导入 (≤1000行, ≤10MB)
        </Button>
        <Button icon={<ReloadOutlined />} onClick={refresh}>刷新</Button>
      </Space>

      <Alert type="info" title="SPU/SKU 两级商品模型 · 支持多规格(颜色/尺寸/材质) · 多语言标题/描述独立存储 · 多币种标价 · 通过 Elasticsearch 实时索引买家可搜索" style={{ marginBottom: 16, fontSize: 12 }} />

      <Table dataSource={products as Record<string, unknown>[]} columns={columns} rowKey="id" size="small" loading={loading}
        pagination={{ pageSize: 10 }} scroll={{ x: 900 }}
        locale={{ emptyText: selectedShopId ? '该店铺暂无商品，点击「新增商品」上架第一件商品' : '请先选择一个店铺' }}
      />

      <Modal
        title={editing ? '编辑商品' : `新增商品 — ${selectedShop?.name || selectedShopId}`}
        open={editOpen}
        onOk={handleSave} onCancel={() => setEditOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="例如：夏季新款连衣裙" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={[
              { value: '服装', label: '👗 服装' },
              { value: '电子', label: '🎧 电子' },
              { value: '家居', label: '🛋️ 家居' },
              { value: '美妆', label: '💄 美妆' },
            ]} />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true, message: '请输入SKU' }]}>
            <Input placeholder="例如：DRS-001" />
          </Form.Item>
          <Form.Item name="price" label="价格 (USD)" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="例如：29.99" />
          </Form.Item>
          <Form.Item name="currency" label="货币" initialValue="USD">
            <Select options={[
              { value: 'USD', label: '🇺🇸 USD' },
              { value: 'CNY', label: '🇨🇳 CNY' },
              { value: 'THB', label: '🇹🇭 THB' },
            ]} />
          </Form.Item>
          <Form.Item name="stock" label="库存" rules={[{ required: true, message: '请输入库存' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="例如：500" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="商品描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
