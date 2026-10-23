let csrfTokenCache: string | null = null;

export async function fetchCsrfToken(forceRefresh = false): Promise<string> {
  if (csrfTokenCache && !forceRefresh) return csrfTokenCache;
  try {
    const res = await fetch('/api/auth/csrf', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      csrfTokenCache = data.csrf_token;
      return data.csrf_token;
    }
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
  }
  return '';
}

export function clearCsrfCache(): void {
  csrfTokenCache = null;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // If payload is JSON and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Inject CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = await fetchCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  let response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Update CSRF token cache if server returned a fresh token
  if (data && typeof data === 'object' && data.csrf_token) {
    csrfTokenCache = data.csrf_token;
  }

  // If failed with CSRF error, refresh token and retry once
  if (response.status === 403 && (data?.error?.includes('CSRF') || data?.message?.includes('CSRF'))) {
    csrfTokenCache = null;
    const newToken = await fetchCsrfToken(true);
    if (newToken) {
      headers['X-CSRF-Token'] = newToken;
      response = await fetch(endpoint, {
        ...options,
        headers,
        credentials: 'include',
      });
      const retryType = response.headers.get('content-type') || '';
      if (retryType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      if (data && typeof data === 'object' && data.csrf_token) {
        csrfTokenCache = data.csrf_token;
      }
    }
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// API methods
export const api = {
  // Auth
  csrf: () => apiRequest<{ csrf_token: string }>('/api/auth/csrf'),
  me: () => apiRequest('/api/auth/me'),
  register: (payload: { email: string; password: string; name: string }) =>
    apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  adminLogin: (payload: { email: string; password: string }) =>
    apiRequest('/api/auth/admin/login', { method: 'POST', body: JSON.stringify(payload) }),
  adminLogout: () => apiRequest('/api/auth/admin/logout', { method: 'POST' }),

  // Destinations
  getDestinations: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return apiRequest(`/api/destinations?${query.toString()}`);
  },
  getDestination: (slugOrId: string) => apiRequest(`/api/destinations/${slugOrId}`),
  getCategories: () => apiRequest('/api/destinations/categories'),

  // Stays
  getStays: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return apiRequest(`/api/stays?${query.toString()}`);
  },
  getStay: (id: string) => apiRequest(`/api/stays/${id}`),
  getStaysWeather: (params: { destination?: string; date?: string; lat?: number; lng?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return apiRequest(`/api/stays/weather?${query.toString()}`);
  },
  getStaysConfig: () => apiRequest('/api/stays/config'),

  // Guides
  getGuides: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return apiRequest(`/api/guides?${query.toString()}`);
  },
  getGuide: (id: number | string) => apiRequest(`/api/guides/${id}`),
  uploadGuideMedia: (formData: FormData) =>
    apiRequest<{ success: boolean; url: string; public_id?: string }>('/api/guides/upload', {
      method: 'POST',
      body: formData,
    }),
  registerGuide: (payload: Record<string, any>) =>
    apiRequest('/api/guides/register', { method: 'POST', body: JSON.stringify(payload) }),

  // Reviews
  getReviews: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return apiRequest(`/api/reviews?${query.toString()}`);
  },
  createReview: (payload: Record<string, any>) =>
    apiRequest('/api/reviews', { method: 'POST', body: JSON.stringify(payload) }),

  // Flights
  searchFlights: (params: { origin?: string; destination?: string; date?: string; travelers?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
    return apiRequest(`/api/flights/search?${query.toString()}`);
  },

  // AI Concierge
  planTrip: (payload: Record<string, any>) =>
    apiRequest('/api/ai/plan', { method: 'POST', body: JSON.stringify(payload) }),
  regenerateDay: (payload: { day: any; destination: string; travel_style?: string; notes?: string }) =>
    apiRequest('/api/ai/regenerate-day', { method: 'POST', body: JSON.stringify(payload) }),
  replaceActivity: (payload: { slot: string; current_activity: any; destination: string; notes?: string }) =>
    apiRequest('/api/ai/replace-activity', { method: 'POST', body: JSON.stringify(payload) }),
  chat: (payload: { message: string; history?: Array<{ role: string; content: string }> }) =>
    apiRequest<{ success: boolean; reply: string }>('/api/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
  chatAssistant: (message: string, history?: Array<{ role: string; content: string }>) =>
    apiRequest<{ success: boolean; reply: string }>('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),

  // Expense Tracker
  getExpenses: (params: { trip_id?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.trip_id) query.append('trip_id', params.trip_id);
    return apiRequest(`/api/expenses?${query.toString()}`);
  },
  addExpense: (payload: { title: string; amount: number; category?: string; trip_id?: string; notes?: string; spent_at?: string; pay_with_wallet?: boolean }) =>
    apiRequest('/api/expenses', { method: 'POST', body: JSON.stringify(payload) }),
  payExpenseWithWallet: (id: number) =>
    apiRequest(`/api/expenses/${id}/pay`, { method: 'POST' }),
  deleteExpense: (id: number) =>
    apiRequest(`/api/expenses/${id}`, { method: 'DELETE' }),

  // Saved Trips
  getTrips: () => apiRequest('/api/trips'),
  saveTrip: (payload: { title?: string; itinerary: any; preferences: any }) =>
    apiRequest('/api/trips', { method: 'POST', body: JSON.stringify(payload) }),
  getTrip: (id: string) => apiRequest(`/api/trips/${id}`),
  updateTrip: (id: string, payload: Record<string, any>) =>
    apiRequest(`/api/trips/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTrip: (id: string) => apiRequest(`/api/trips/${id}`, { method: 'DELETE' }),
  duplicateTrip: (id: string) => apiRequest(`/api/trips/${id}/duplicate`, { method: 'POST' }),

  // Trip Wallet
  getWallet: () => apiRequest('/api/wallet'),
  createWalletOrder: (amount: number) =>
    apiRequest('/api/wallet/create-order', { method: 'POST', body: JSON.stringify({ amount }) }),
  verifyPayment: (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; amount: number }) =>
    apiRequest('/api/wallet/verify-payment', { method: 'POST', body: JSON.stringify(payload) }),

  // Bookings
  getBookings: () => apiRequest('/api/bookings'),
  createBooking: (payload: Record<string, any>) =>
    apiRequest('/api/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  payBookingViaWallet: (bookingId: number) =>
    apiRequest(`/api/bookings/${bookingId}/pay-wallet`, { method: 'POST' }),
  completeBooking: (bookingId: number) =>
    apiRequest(`/api/bookings/${bookingId}/complete`, { method: 'POST' }),

  // Admin
  getAdminStats: () => apiRequest('/api/admin/stats'),
  adminListDestinations: () => apiRequest('/api/admin/destinations'),
  adminCreateDestination: (payload: Record<string, any>) =>
    apiRequest('/api/admin/destinations', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateDestination: (id: number, payload: Record<string, any>) =>
    apiRequest(`/api/admin/destinations/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteDestination: (id: number) =>
    apiRequest(`/api/admin/destinations/${id}`, { method: 'DELETE' }),
  adminGetAuditLogs: () => apiRequest('/api/admin/audit-logs'),
  adminUploadMedia: (formData: FormData) =>
    apiRequest('/api/admin/media/upload', { method: 'POST', body: formData }),
  adminGetGuides: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return apiRequest(`/api/admin/guides?${query.toString()}`);
  },
  adminApproveGuide: (id: number) =>
    apiRequest(`/api/admin/guides/${id}/approve`, { method: 'POST' }),
  adminRejectGuide: (id: number) =>
    apiRequest(`/api/admin/guides/${id}/reject`, { method: 'POST' }),
};

