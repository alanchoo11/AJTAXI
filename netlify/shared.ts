import { createHmac } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { HandlerEvent, HandlerResponse } from '@netlify/functions';

export const headers = {
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
};

export function reply(statusCode:number, body:unknown):HandlerResponse {
  return { statusCode, headers, body:JSON.stringify(body) };
}

export function methodNotAllowed(allowed:string[]) { return reply(405,{error:'method_not_allowed',allowed}); }

export function readBody(event:HandlerEvent):Record<string,unknown> {
  if(!event.body||event.body.length>7_500_000) return {};
  try { const body=JSON.parse(event.body);return body&&typeof body==='object'&&!Array.isArray(body)?body:{}; } catch { return {}; }
}

export function database():SupabaseClient {
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('not_configured');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export function clean(value:unknown,max=500):string {
  if(typeof value!=='string') return '';
  return value.trim().replace(/\u0000/g,'').slice(0,max);
}

export const validPhone=(value:string)=>/^\+?[0-9 ()-]{7,24}$/.test(value);
export const validLocale=(value:unknown)=>value==='ru'||value==='kk'||value==='en';
export const validStatus=(value:unknown)=>['new','under_review','contacted','approved','rejected'].includes(String(value));
export const validId=(value:unknown)=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function checkAdmin(event:HandlerEvent) {
  const authorization=event.headers.authorization||event.headers.Authorization||'';
  const token=authorization.startsWith('Bearer ')?authorization.slice(7):'';
  if(!token) return {ok:false as const,status:401};
  const db=database();
  const {data,error}=await db.auth.getUser(token);
  if(error||!data.user) return {ok:false as const,status:401};
  const {data:profile,error:profileError}=await db.from('profiles').select('role,is_active').eq('id',data.user.id).maybeSingle();
  if(profileError||!profile||profile.is_active!==true||!['admin','super_admin'].includes(profile.role)) return {ok:false as const,status:403};
  return {ok:true as const,db,userId:data.user.id};
}

export async function allowSubmission(db:SupabaseClient,event:HandlerEvent) {
  const forwarded=event.headers['x-nf-client-connection-ip']||'unknown';
  const ip=forwarded.trim().slice(0,100)||'unknown';
  const secret=process.env.RATE_LIMIT_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY||'aj-rate-limit-config-required';
  const hash=createHmac('sha256',secret).update(ip).digest('hex');
  const {data,error}=await db.rpc('consume_submission_rate_limit',{p_ip_hash:hash,p_limit:6,p_window_minutes:15});
  if(error) throw new Error('rate_limit_unavailable');
  return data===true;
}

export function safeError(error:unknown) {
  if(error instanceof Error&&error.message==='not_configured') return reply(503,{error:'not_configured'});
  return reply(500,{error:'request_failed'});
}
