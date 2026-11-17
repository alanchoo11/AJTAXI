export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export function publicImageUrl(path?: string | null) {
  const image = path || '/assets/vehicle-placeholder.svg';
  return image.startsWith('/assets/') ? assetUrl(image) : image;
}
