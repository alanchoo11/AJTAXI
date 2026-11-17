import type { Handler } from '@netlify/functions';
import { allowSubmission, clean, database, methodNotAllowed, readBody, reply, safeError, validLocale, validPhone } from '../shared';

export const handler:Handler=async(event)=>{
  if(event.httpMethod!=='POST') return methodNotAllowed(['POST']);
  if((event.body||'').length>15_000) return reply(413,{error:'request_too_large'});
  const body=readBody(event);
  if(clean(body.website,200)) return reply(200,{ok:true});
  const full_name=clean(body.fullName,120),phone=clean(body.phone,24),additional_message=clean(body.additionalMessage,1000);
  if(full_name.length<2||!validPhone(phone)||!validLocale(body.preferredLanguage)||typeof body.ownsVehicle!=='boolean'||body.consent!==true) return reply(400,{error:'invalid_application'});
  const year=body.vehicleYear===undefined||body.vehicleYear===null||body.vehicleYear===''?null:Number(body.vehicleYear);
  if(year!==null&&(!Number.isInteger(year)||year<1980||year>2035)) return reply(400,{error:'invalid_application'});
  try {
    const db=database();
    if(!await allowSubmission(db,event)) return reply(429,{error:'rate_limited'});
    const {error}=await db.from('driver_applications').insert({full_name,phone,preferred_language:body.preferredLanguage,owns_vehicle:body.ownsVehicle,vehicle_brand:clean(body.vehicleBrand,80)||null,vehicle_model:clean(body.vehicleModel,80)||null,vehicle_year:year,additional_message:additional_message||null,privacy_consent:true,status:'new'});
    if(error) throw new Error('database_insert_failed');
    return reply(201,{ok:true});
  } catch(error) { return safeError(error); }
};
