const API_BASE = 'http://localhost:8080/api';

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  const resp = await fetch(url, { ...options, headers });
  return resp.json();
}

export const merchantApi = {
  // Tenant
  getTenants: () => request('/tenants'),
  getTenant: (id: string) => request(`/tenants/${id}`),
  createTenant: (data: unknown) => request('/tenants', { method: 'POST', body: JSON.stringify(data) }),

  // Shops
  getShops: (tenantId: string) => request(`/shops?tenantId=${tenantId}`),
  createShop: (data: unknown) => request('/shops', { method: 'POST', body: JSON.stringify(data) }),
  updateShop: (id: string, data: unknown) => request(`/shops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  publishShop: (id: string) => request(`/shops/${id}/publish`, { method: 'POST' }),

  // Products
  getProducts: (tenantId?: string) => request(`/products${tenantId ? '/tenant/' + tenantId : ''}`),
  getProductsByShop: (shopId: string) => request(`/products/search?shopId=${shopId}`),
  createProduct: (data: unknown) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: unknown) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (tenantId: string) => request(`/orders/tenant/${tenantId}`),
  updateOrderStatus: (id: string, status: string) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Shipments
  getShipments: (tenantId: string) => request(`/shipments/tenant/${tenantId}`),
  createShipment: (data: unknown) => request('/shipments', { method: 'POST', body: JSON.stringify(data) }),
  getCarriers: () => request('/shipments/carriers'),

  // TIRE
  checkQuota: (tenantId: string, resource: string, current: number) =>
    request('/tire/quota/check', { method: 'POST', body: JSON.stringify({ tenantId, resource, current }) }),
};
