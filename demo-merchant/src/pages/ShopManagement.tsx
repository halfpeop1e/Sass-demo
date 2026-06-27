import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Space, Tag, Button, Input, Descriptions, Form, Modal, Select, message, Alert } from 'antd';
import {
  ShopOutlined, ReloadOutlined, RocketOutlined, EditOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { merchantApi } from '../api/merchantApi';

const { Title, Text } = Typography;
const TENANT_ID = 'T001';

interface Shop { id: string; name: string; domain: string; theme: string; status: string; createdAt: string }

export default function ShopManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editShop, setEditShop] = useState<Shop | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();

  const refresh = () => {
    setLoading(true);
    merchantApi.getShops(TENANT_ID).then(r => {
      setShops(r?.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { refresh(); }, []);

  const handlePublish = (shopId: string) => {
    merchantApi.publishShop(shopId).then(r => {
      if (r.code === 200) { message.success('店铺已发布，CDN 全球刷新中...'); refresh(); }
      else message.error('发布失败');
    });
  };

  const handleEdit = (shop: Shop) => {
    setEditShop(shop);
    editForm.setFieldsValue(shop);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    editForm.validateFields().then((values: Record<string, string>) => {
      if (editShop) {
        merchantApi.updateShop(editShop.id, values).then(r => {
          if (r.code === 200) { message.success('店铺配置已更新'); setEditOpen(false); refresh(); }
        });
      }
    });
  };

  const handleCreate = () => {
    createForm.validateFields().then((values: Record<string, string>) => {
      merchantApi.createShop({ ...values, tenantId: TENANT_ID }).then(r => {
        if (r.code === 201) { message.success('店铺创建成功'); setCreateOpen(false); createForm.resetFields(); refresh(); }
      });
    });
  };

  return (
    <div>
      <Title level={4}><ShopOutlined /> 店铺管理</Title>
      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        支持可视化拖拽装修、自定义品牌色/字体/布局。发布后通过 CDN 全球加速分发。
      </Text>

      <Row gutter={[16, 16]}>
        {shops.map(shop => (
          <Col key={shop.id} xs={24} md={12}>
            <Card
              title={<Space><ShopOutlined /> {shop.name}</Space>}
              size="small"
              extra={
                <Space>
                  <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(shop)}>装修</Button>
                  {shop.status !== 'published' && <Button size="small" type="primary" icon={<RocketOutlined />} onClick={() => handlePublish(shop.id)}>发布</Button>}
                  {shop.status === 'published' && <Tag color="green" icon={<CheckCircleOutlined />}>已发布</Tag>}
                </Space>
              }
            >
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="店铺ID">{shop.id}</Descriptions.Item>
                <Descriptions.Item label="域名">
                  <Text code>{shop.domain}</Text> <Tag color="blue">SSL 自动续期</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="主题">{shop.theme}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={shop.status === 'published' ? 'green' : 'orange'}>{shop.status === 'published' ? '已发布 (CDN生效中)' : '草稿'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">{shop.createdAt}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        ))}
        <Col xs={24} md={12}>
          <Card
            hoverable
            size="small"
            style={{ border: '2px dashed #d9d9d9', textAlign: 'center', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            styles={{ body: { width: '100%' } }}
            onClick={() => { createForm.resetFields(); setCreateOpen(true); }}
          >
            <Space orientation="vertical">
              <ShopOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
              <Text type="secondary">+ 创建新店铺</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="店铺装修流程" size="small" style={{ marginTop: 16 }}>
        <Text>
          ① 进入店铺装修页面 → ② 选择模板主题 → ③ 拖拽组件并配置属性 →
          ④ 实时预览效果 → ⑤ 保存草稿 → ⑥ 点击发布 →
          ⑦ 模板渲染引擎生成静态页面 → ⑧ 上传至 OSS/S3 → ⑨ CDN 刷新缓存 → ⑩ 买家端即时可见
        </Text>
        <Alert type="warning" title="发布后如需回滚，可在版本管理中选择历史版本，支持一键回滚" style={{ marginTop: 8, fontSize: 12 }} />
      </Card>

      <Modal title="编辑店铺配置" open={editOpen} onOk={handleEditSave} onCancel={() => setEditOpen(false)}>
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="店铺名称"><Input /></Form.Item>
          <Form.Item name="domain" label="域名"><Input /></Form.Item>
          <Form.Item name="theme" label="主题">
            <Select options={[
              { value: 'modern', label: '现代风格' },
              { value: 'tech', label: '科技风格' },
              { value: 'minimal', label: '极简风格' },
              { value: 'luxury', label: '奢华风格' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="创建新店铺" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)}>
        <Form form={createForm} layout="vertical">
          <Form.Item name="name" label="店铺名称" rules={[{ required: true, message: '请输入店铺名称' }]}><Input placeholder="例如：我的跨境店铺" /></Form.Item>
          <Form.Item name="domain" label="域名" rules={[{ required: true, message: '请输入域名' }]}>
            <Input placeholder="例如：myshop.saas.com" />
          </Form.Item>
          <Form.Item name="theme" label="主题" initialValue="modern">
            <Select options={[
              { value: 'modern', label: '现代风格' },
              { value: 'tech', label: '科技风格' },
              { value: 'minimal', label: '极简风格' },
              { value: 'luxury', label: '奢华风格' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      <Button icon={<ReloadOutlined />} onClick={refresh} style={{ marginTop: 8 }}>刷新</Button>
    </div>
  );
}
