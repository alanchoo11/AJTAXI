export function whatsappUrl(message: string, configuredNumber?: string) {
  const number = (configuredNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  if (!number || number.length < 8) return '/contacts#whatsapp';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
