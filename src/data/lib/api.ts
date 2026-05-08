const API_URL = import.meta.env.VITE_API_URL;

async function fetchApi(path: string, options: RequestInit = {}) {
  // Get current session token
  const { data: { session } } = await supabase.auth.getSession();
  
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Public APIs (no auth) ───

export async function getMenu(slug: string) {
  return fetchApi(`/restaurants/${slug}/menu`);
}

export async function createOrder(payload: {
  restaurant_id: string;
  table_id: string;
  customer_name?: string;
  customer_phone?: string;
  items: { menu_item_id: string; quantity: number; special_instructions?: string }[];
  payment_method?: 'cash' | 'card' | 'online';
  notes?: string;
}) {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Dashboard APIs (requires auth) ───

export async function getMyRestaurants() {
  return fetchApi('/dashboard/restaurants');
}

export async function createRestaurant(payload: {
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  currency?: string;
}) {
  return fetchApi('/dashboard/restaurants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOrders(restaurantId: string, filters?: {
  status?: string;
  date_from?: string;
  date_to?: string;
}) {
  const params = new URLSearchParams({ restaurant_id: restaurantId, ...filters });
  return fetchApi(`/dashboard/orders?${params}`);
}

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  return fetchApi(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
}