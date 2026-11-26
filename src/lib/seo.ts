export function setPageMeta(title: string, description?: string) {
  const fullTitle = `${title} · AJLOGIST`;
  const summary = (description || `${title}. AJLOGIST — аренда автомобилей в Астане.`).slice(0, 300);
  document.title = fullTitle;
  setMeta('name', 'description', summary);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', summary);
  setMeta('property', 'og:type', 'website');
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', summary);

  try {
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
    const siteUrl = new URL(configuredSiteUrl || import.meta.env.BASE_URL, window.location.origin);
    const basePath = new URL(import.meta.env.BASE_URL, window.location.origin).pathname.replace(/\/?$/, '/');
    const canonical = new URL(siteUrl);

    if (window.location.hash.startsWith('#/')) {
      canonical.hash = window.location.hash.slice(1);
    } else {
      const currentPath = window.location.pathname.replace(/^\/+/, '');
      const relativePath = currentPath.startsWith(basePath.replace(/^\/+/, ''))
        ? currentPath.slice(basePath.replace(/^\/+/, '').length)
        : currentPath;
      canonical.pathname = `${siteUrl.pathname.replace(/\/?$/, '/')}${relativePath}`;
    }

    const canonicalHref = canonical.toString();
    const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalHref;
    if (!canonicalLink.isConnected) document.head.append(canonicalLink);
    setMeta('property', 'og:url', canonicalHref);

    const socialImage = new URL(`${import.meta.env.BASE_URL}assets/ajlogist-social.svg`, window.location.origin).toString();
    setMeta('property', 'og:image', socialImage);
    setMeta('property', 'og:image:type', 'image/svg+xml');
    setMeta('name', 'twitter:image', socialImage);
  } catch {
    // Page copy and metadata remain available if the optional canonical URL is malformed.
  }
}

function setMeta(attribute: 'name' | 'property', key: string, value: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.append(meta);
  }
  meta.content = value;
}
