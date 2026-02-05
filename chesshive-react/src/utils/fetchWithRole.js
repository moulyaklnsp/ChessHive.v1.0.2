function mergeOptions(options) {
  const opts = options || {};
  const headers = opts.headers || {};
  return {
    credentials: 'include',
    ...opts,
    headers
  };
}

export function fetchAsAdmin(path, options) {
  return fetch(path, mergeOptions(options));
}

export function fetchAsOrganizer(path, options) {
  return fetch(path, mergeOptions(options));
}

export function fetchAsCoordinator(path, options) {
  return fetch(path, mergeOptions(options));
}

export function fetchAsPlayer(path, options) {
  return fetch(path, mergeOptions(options));
}

