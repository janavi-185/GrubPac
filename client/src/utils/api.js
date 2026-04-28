const BASE = import.meta.env.VITE_API_BASE_URL;

const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Only set Content-Type for JSON (not for FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  get:    (path)         => request(path, { method: 'GET' }),
  post:   (path, body)   => request(path, { method: 'POST',  body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),
};
