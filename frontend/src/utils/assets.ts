export function getPublicAssetUrl(path: string | undefined) {//путь к картинкам 
  if (!path) return '';

  if (/^(https?:|data:|blob:)/.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.replace(/^\/+/, '');

  return `${cleanBase}${cleanPath}`;
}
