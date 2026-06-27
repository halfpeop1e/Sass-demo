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

export const adminApi = {
  getTenants: () => request('/tenants'),
  getTenant: (id: string) => request(`/tenants/${id}`),
  createTenant: (data: unknown) => request('/tenants', { method: 'POST', body: JSON.stringify(data) }),
  upgradeTenant: (id: string, tier: string) => request(`/tenants/${id}/tier`, { method: 'PUT', body: JSON.stringify({ tier }) }),
  getShops: (tenantId?: string) => request(`/shops${tenantId ? '?tenantId=' + tenantId : ''}`),
  getProducts: () => request('/products'),
  getOrders: (tenantId?: string) => request(`/orders${tenantId ? '?tenantId=' + tenantId : ''}`),
  getPayments: () => request('/payments'),
  getShipments: () => request('/shipments'),
  getNotifications: () => request('/notifications'),
  getServices: () => request('/services'),
  getDisasterStatus: () => request('/disaster/status'),
  triggerFailover: () => request('/disaster/failover', { method: 'POST' }),
  triggerRecovery: () => request('/disaster/recover', { method: 'POST' }),
  // TIRE Engine
  resolveTenant: (domain: string) => request('/tire/resolve', { method: 'POST', body: JSON.stringify({ domain }) }),
  validateAccess: (tenantId: string, resource: string, action: string) =>
    request('/tire/validate', { method: 'POST', body: JSON.stringify({ tenantId, resource, action }) }),
  checkQuota: (tenantId: string, resource: string, current: number) =>
    request('/tire/quota/check', { method: 'POST', body: JSON.stringify({ tenantId, resource, current }) }),
};
