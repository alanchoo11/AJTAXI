import type { Handler } from '@netlify/functions';
import { allowSubmission, clean, database, methodNotAllowed, readBody, reply, safeError, validId, validPhone } from '../shared';

export const handler:Handler=async(event)=>{
  if(event.httpMethod!=='POST') return methodNotAllowed(['POST']);
  if((event.body||'').length>15_000) return reply(413,{error:'request_too_large'});
  const body=readBody(event);
  if(clean(body.website,200)) return reply(200,{ok:true});
  const full_name=clean(body.fullName,120),phone=clean(body.phone,24),vehicle_id=clean(body.vehicleId,80),additional_message=clean(body.additionalMessage,1000),rental_period=body.rentalPeriod,preferred_start_date=clean(body.preferredStartDate,10);
  if(full_name.length<2||!validPhone(phone)||body.consent!==true||!['day','week','month'].includes(String(rental_period))) return reply(400,{error:'invalid_application'});
  if(preferred_start_date) { const parsed=new Date(`${preferred_start_date}T00:00:00.000Z`);if(!/^\d{4}-\d{2}-\d{2}$/.test(preferred_start_date)||Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==preferred_start_date)return reply(400,{error:'invalid_application'}); }
  try {
    const db=database();
    if(!await allowSubmission(db,event)) return reply(429,{error:'rate_limited'});
    if(!validId(vehicle_id)) return reply(400,{error:'invalid_vehicle'});
    const {data:vehicle,error:vehicleError}=await db.from('vehicles').select('id,brand,model,is_published').eq('id',vehicle_id).maybeSingle();
    if(vehicleError||!vehicle||!vehicle.is_published) return reply(400,{error:'vehicle_unavailable'});
    const {error}=await db.from('rental_applications').insert({full_name,phone,vehicle_id:vehicle.id,vehicle_reference:`${vehicle.brand} ${vehicle.model||''}`.trim(),rental_period,preferred_start_date:preferred_start_date||null,additional_message:additional_message||null,privacy_consent:true,status:'new'});
    if(error) throw new Error('database_insert_failed');
    return reply(201,{ok:true});
  } catch(error) { return safeError(error); }
};
