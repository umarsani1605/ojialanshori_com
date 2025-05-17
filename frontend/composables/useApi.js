export function useApi(endpoint, options = {}) {
  const config = useRuntimeConfig();

  // Default options untuk useFetch
  const defaults = {
    baseURL: config.public.apiBaseUrl,
    key: endpoint,
    // Memastikan cookies dikirim ke backend
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Menggabungkan opsi default dengan opsi kustom
  const fetchOptions = {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...(options.headers || {}),
    },
  };

  return useFetch(endpoint, fetchOptions);
}
