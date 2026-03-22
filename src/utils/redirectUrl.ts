const PRODUCTION_ORIGIN = 'https://genogy-app.com';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export const getRedirectOrigin = (): string => {
  if (typeof window === 'undefined') {
    return PRODUCTION_ORIGIN;
  }

  return LOCAL_HOSTS.has(window.location.hostname)
    ? window.location.origin
    : PRODUCTION_ORIGIN;
};
