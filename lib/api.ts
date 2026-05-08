import { useAuthStore } from './store/authStore';
import type { Artikel, Setoran, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_APP_URL;

interface ApiErrorPayload {
  error?: string;
}

type ApiOptions = RequestInit & {
  headers?: HeadersInit;
};

export async function apiCall<TResponse>(endpoint: string, options: ApiOptions = {}): Promise<TResponse> {
  const { token } = useAuthStore.getState();

  const headers = new Headers(options.headers ?? {});
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const cacheBuster = `_t=${timestamp}&_r=${random}&_v=${Date.now()}`;
  const separator = endpoint.includes('?') ? '&' : '?';
  const urlWithCacheBuster = `${API_URL}/api${endpoint}${separator}${cacheBuster}`;

  const response = await fetch(urlWithCacheBuster, {
    ...options,
    headers,
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  const rawText = await response.text();
  const data = rawText ? (JSON.parse(rawText) as unknown) : null;

  if (!response.ok) {
    const message = (data as ApiErrorPayload | null)?.error || 'Something went wrong';
    throw new Error(message);
  }

  return data as TResponse;
}

type AuthLoginResponse = {
  token: string;
  user: User;
};

type RegisterPayload = {
  nama_lengkap: string;
  email: string;
  password: string;
  no_hp?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  detail_alamat?: string;
};

type SetoranCreatePayload = {
  jenis_sampah: string;
  metode: 'pick-up' | 'antar-langsung';
};

type SetoranValidatePayload = {
  berat_sampah: number;
  harga_per_kg: number;
};

type SetoranListResponse = Setoran[];

type PencairanListResponse = Array<{
  id: string;
  user_id: string;
  nominal: number;
  status: 'pending' | 'approved' | 'rejected';
  pengelola_id?: string;
  tanggal_request: string;
  tanggal_pencairan?: string;
  catatan?: string;
}>;

type ArtikelListResponse = {
  data: Artikel[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

type MemberListResponse = User[];

export const authService = {
  login: (email: string, password: string) =>
    apiCall<AuthLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterPayload) =>
    apiCall<{ message: string; userId: string; profile_completed: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const setoranService = {
  create: (data: SetoranCreatePayload) =>
    apiCall<{ message: string; data: Setoran }>('/setoran/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () => apiCall<SetoranListResponse>('/setoran/list'),

  validate: (id: string, data: SetoranValidatePayload) =>
    apiCall<{ message: string; total_harga: number; user_id: string }>(`/setoran/validate/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const pencairanService = {
  request: (nominal: number) =>
    apiCall<{ message: string; data: { nominal: number } }>('/pencairan/request', {
      method: 'POST',
      body: JSON.stringify({ nominal }),
    }),

  list: (status?: string) =>
    apiCall<PencairanListResponse>(`/pencairan/list${status ? `?status=${status}` : ''}`),

  approve: (id: string, status: 'approved' | 'rejected', catatan?: string) =>
    apiCall<{ message: string }>(`/pencairan/approve/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status, catatan }),
    }),
};

export const artikelService = {
  list: (limit = 10, offset = 0) =>
    apiCall<ArtikelListResponse>(`/artikel/list?limit=${limit}&offset=${offset}`),

  create: (data: { judul: string; konten: string; gambar?: string }) =>
    apiCall<{ message: string; data: Artikel }>('/artikel/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Pick<Artikel, 'judul' | 'konten' | 'gambar'>>) =>
    apiCall<{ message: string; data: Artikel }>(`/artikel/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/artikel/delete/${id}`, {
      method: 'DELETE',
    }),
};

export const memberService = {
  list: (role?: string, search?: string) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    return apiCall<MemberListResponse>(`/member/list?${params.toString()}`);
  },

  detail: (id: string) => apiCall(`/member/${id}`),

  changePassword: (id: string, password: string) =>
    apiCall<{ message: string }>(`/member/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }),
};

export const laporanService = {
  export: (type: 'setoran' | 'pencairan', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ type });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return `${process.env.NEXT_PUBLIC_APP_URL}/api/laporan/export?${params.toString()}`;
  },
};

export const dashboardService = {
  stats: () => apiCall<Record<string, number | string>>('/dashboard/stats'),
};
