import type { RentalApplicationInput, Vehicle } from '../types';

const isStaticPages = import.meta.env.BASE_URL !== '/';

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers:{ 'Content-Type':'application/json', ...(init?.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'request_failed');
  return body as T;
}

export async function submitRentalApplication(input: RentalApplicationInput) {
  if (isStaticPages) throw new Error('not_configured');
  return jsonRequest<{ ok: boolean }>('/api/rental-application', { method:'POST', body:JSON.stringify(input) });
}
export async function getVehicles(): Promise<Vehicle[]> {
  if (isStaticPages) return [];
  try { const result = await jsonRequest<{ vehicles:Vehicle[] }>('/api/vehicles'); return result.vehicles; }
  catch { return []; }
}
export type PublicSettings = { default_language?:string };
let settingsRequest:Promise<PublicSettings>|null=null;
export function getPublicSettings() {
  if(!settingsRequest) settingsRequest=isStaticPages?Promise.resolve({}):jsonRequest<{settings:PublicSettings}>('/api/content?type=settings').then(r=>r.settings).catch(()=>({}));
  return settingsRequest;
}
export async function adminRequest<T>(token: string, action: string, data: Record<string, unknown> = {}): Promise<T> {
  if (isStaticPages) throw new Error('not_configured');
  return jsonRequest<T>('/api/admin', { method:'POST', headers:{ Authorization:`Bearer ${token}` }, body:JSON.stringify({ action, ...data }) });
}

export function supabaseBrowserConfig() {
  return { url:import.meta.env.VITE_SUPABASE_URL as string | undefined, key:import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined };
}
