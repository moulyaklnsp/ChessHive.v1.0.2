export function getSocketServerUrl() {
  if (typeof window === 'undefined') return '';

  const explicit = (process.env.REACT_APP_SOCKET_URL || '').toString().trim();
  if (explicit) return explicit;

  const { protocol, hostname, port } = window.location;

  // CRA dev server default is :3000 and this project proxies API to :3001.
  // Socket.IO client script can be proxied, but the connection URL must still point to the backend.
  if (port === '3000') return `${protocol}//${hostname}:3001`;

  // If running on the same origin (prod / backend-served build), just use current origin.
  const origin = window.location.origin;
  return origin || `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

export function createSocket(ioOptions = {}) {
  if (typeof window === 'undefined') return null;
  if (!window.io) return null;

  const url = getSocketServerUrl();
  try {
    return window.io(url, { withCredentials: true, ...ioOptions });
  } catch (_) {
    return null;
  }
}

export function getOrCreateSharedSocket(globalKey = '__chesshiveLiveSocket', ioOptions = {}) {
  if (typeof window === 'undefined') return null;
  if (window[globalKey]) return window[globalKey];

  const sock = createSocket(ioOptions);
  if (!sock) return null;

  window[globalKey] = sock;
  return sock;
}
