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

export const api = {
  getProducts: (q?: string, category?: string, shopId?: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (shopId) params.set('shopId', shopId);
    return request(`/products/search?${params}`);
  },
  getAllProducts: () => request('/products'),
  getProduct: (id: string) => request(`/products/${id}`),
  getProductsByShop: (shopId: string) => request(`/products/search?shopId=${shopId}`),
  getShops: (tenantId?: string) => {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    return request(`/shops${params}`);
  },
  getShop: (id: string) => request(`/shops/${id}`),
  getOrdersByBuyer: (buyerId: string) => request(`/orders/buyer/${buyerId}`),
  createOrder: (data: unknown) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  createPayment: (data: unknown) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  getShipment: (id: string) => request(`/shipments/${id}`),
  getShipmentTracking: (id: string) => request(`/shipments/${id}/tracking`),
  getNotifications: (buyerId: string) => request(`/notifications/buyer/${buyerId}`),
  sendNotification: (data: unknown) => request('/notifications', { method: 'POST', body: JSON.stringify(data) }),
};
