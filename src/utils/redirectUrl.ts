const PRODUCTION_ORIGIN = 'https://genogy-app.com';

export const getRedirectOrigin = (): string => {
  const host = window.location.hostname;
  const isCustomDomain = !host.endsWith('.lovable.app') && !host.endsWith('.lovableproject.com');
  return isCustomDomain ? PRODUCTION_ORIGIN : window.location.origin;
};
