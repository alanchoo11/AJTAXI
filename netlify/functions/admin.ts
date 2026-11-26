import { randomUUID } from 'node:crypto';
import type { Handler } from '@netlify/functions';
import type { SupabaseClient } from '@supabase/supabase-js';
import { checkAdmin, clean, methodNotAllowed, readBody, reply, safeError, validId, validStatus } from '../shared';

const statuses=['new','under_review','contacted','approved','rejected'];

export const handler:Handler=async(event)=>{
  if(event.httpMethod!=='POST') return methodNotAllowed(['POST']);
  if((event.body||'').length>7_500_000) return reply(413,{error:'request_too_large'});
  try {
    const auth=await checkAdmin(event);
    if(!auth.ok) return reply(auth.status,{error:auth.status===401?'unauthorized':'forbidden'});
    const body=readBody(event),action=clean(body.action,40),db=auth.db;

    if(action==='dashboard') {
      const [drivers,newDrivers,pendingDrivers,rentals,vehicles,available]=await Promise.all([
        db.from('driver_applications').select('id',{count:'exact',head:true}),
        db.from('driver_applications').select('id',{count:'exact',head:true}).eq('status','new'),
        db.from('driver_applications').select('id',{count:'exact',head:true}).eq('status','under_review'),
        db.from('rental_applications').select('id',{count:'exact',head:true}),
        db.from('vehicles').select('id',{count:'exact',head:true}),
        db.from('vehicles').select('id',{count:'exact',head:true}).eq('availability_status','available').eq('is_published',true),
      ]);
      if([drivers,newDrivers,pendingDrivers,rentals,vehicles,available].some(x=>x.error)) throw new Error('dashboard_query_failed');
      return reply(200,{stats:{driverTotal:drivers.count||0,driverNew:newDrivers.count||0,driverPending:pendingDrivers.count||0,rentalTotal:rentals.count||0,vehicleTotal:vehicles.count||0,vehicleAvailable:available.count||0}});
    }

    if(action==='applications') {
      const rows=await loadApplications(db,body);
      return reply(200,{applications:rows});
    }

    if(action==='update_application') {
      const id=body.id,type=body.type,status=body.status,admin_notes=clean(body.admin_notes,2000);
      if(!validId(id)||!['driver','rental'].includes(String(type))||!validStatus(status)) return reply(400,{error:'invalid_application'});
      const table=type==='driver'?'driver_applications':'rental_applications';
      const {error}=await db.from(table).update({status,admin_notes,updated_at:new Date().toISOString()}).eq('id',id);
      if(error) throw new Error('application_update_failed');
      return reply(200,{ok:true});
    }

    if(action==='vehicles') {
      const {data,error}=await db.from('vehicles').select('*').order('brand').limit(500);
      if(error) throw new Error('vehicle_query_failed');
      return reply(200,{vehicles:data||[]});
    }

    if(action==='save_vehicle') {
      const vehicle=asRecord(body.vehicle),id=vehicle.id;
      const brand=clean(vehicle.brand,80),model=clean(vehicle.model,100);
      if(brand.length<2) return reply(400,{error:'invalid_vehicle'});
      const year=vehicle.year===null||vehicle.year===''||vehicle.year===undefined?null:Number(vehicle.year);
      const daily=vehicle.daily_price===null||vehicle.daily_price===''||vehicle.daily_price===undefined?null:Number(vehicle.daily_price);
      const weekly=vehicle.weekly_price===null||vehicle.weekly_price===''||vehicle.weekly_price===undefined?null:Number(vehicle.weekly_price);
      const monthly=vehicle.monthly_price===null||vehicle.monthly_price===''||vehicle.monthly_price===undefined?null:Number(vehicle.monthly_price);
      const deposit=vehicle.deposit===null||vehicle.deposit===''||vehicle.deposit===undefined?null:Number(vehicle.deposit);
      if(year!==null&&(!Number.isInteger(year)||year<1980||year>2035)||[daily,weekly,monthly,deposit].some(v=>v!==null&&(!Number.isFinite(v)||v<0))) return reply(400,{error:'invalid_vehicle'});
      if(!['available','on_request','unavailable'].includes(String(vehicle.availability_status))) return reply(400,{error:'invalid_vehicle'});
      const payload={brand,model,year,transmission:clean(vehicle.transmission,40)||null,fuel_type:clean(vehicle.fuel_type,40)||null,description:localizedRecord(vehicle.description),rental_conditions:localizedRecord(vehicle.rental_conditions),daily_price:daily,weekly_price:weekly,monthly_price:monthly,deposit,availability_status:vehicle.availability_status,is_demo:vehicle.is_demo===true,image_urls:imageList(vehicle.image_urls),is_published:vehicle.is_published!==false,updated_at:new Date().toISOString()};
      let result;
      if(validId(id)) result=await db.from('vehicles').update(payload).eq('id',id).select('id').maybeSingle();
      else result=await db.from('vehicles').insert(payload).select('id').single();
      if(result.error) throw new Error('vehicle_save_failed');
      return reply(200,{ok:true,id:result.data?.id});
    }

    if(action==='delete_vehicle') {
      if(!validId(body.id)) return reply(400,{error:'invalid_vehicle'});
      const {error}=await db.from('vehicles').delete().eq('id',body.id);
      if(error) throw new Error('vehicle_delete_failed');
      return reply(200,{ok:true});
    }

    if(action==='upload_vehicle_image') {
      const dataUrl=clean(body.dataUrl,7_000_000),match=dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if(!match) return reply(400,{error:'invalid_image'});
      const buffer=Buffer.from(match[2],'base64');
      if(buffer.byteLength>5_000_000) return reply(413,{error:'image_too_large'});
      const ext=match[1]==='image/jpeg'?'jpg':match[1].split('/')[1],path=`${randomUUID()}.${ext}`;
      const {data,error}=await db.storage.from('vehicle-images').upload(path,buffer,{contentType:match[1],upsert:false,cacheControl:'31536000'});
      if(error) throw new Error('image_upload_failed');
      const {data:{publicUrl}}=db.storage.from('vehicle-images').getPublicUrl(data.path);
      return reply(200,{url:publicUrl});
    }

    if(action==='faqs') {
      const {data,error}=await db.from('faqs').select('*').order('sort_order').limit(200);
      if(error) throw new Error('faq_query_failed');
      return reply(200,{faqs:data||[]});
    }

    if(action==='content') {
      const {data,error}=await db.from('site_content').select('key,value').order('key');
      if(error) throw new Error('content_query_failed');
      return reply(200,{content:Object.fromEntries((data||[]).map(x=>[x.key,x.value]))});
    }

    if(action==='save_content') {
      const allowed=new Set(['home_hero_title','home_hero_text','home_directions_text','home_driver_text','home_rental_text','home_calculator_text','drivers_intro','drivers_requirements','rental_intro','about_intro','about_practical','contacts_intro','contact_cta_text']);
      const rawItems=Array.isArray(body.items)?body.items:[{key:body.key,value:body.value}];
      if(rawItems.length>allowed.size) return reply(400,{error:'invalid_content'});
      const entries=rawItems.map(raw=>{const item=asRecord(raw),value=asRecord(item.value);return {key:clean(item.key,80),value:{ru:clean(value.ru,1000),kk:clean(value.kk,1000),en:clean(value.en,1000)},updated_at:new Date().toISOString()}});
      if(entries.some(entry=>!allowed.has(entry.key)||!entry.value.ru||!entry.value.kk||!entry.value.en)) return reply(400,{error:'invalid_content'});
      const {error}=await db.from('site_content').upsert(entries,{onConflict:'key'});
      if(error) throw new Error('content_save_failed');
      return reply(200,{ok:true});
    }

    if(action==='save_faqs') {
      if(!Array.isArray(body.faqs)||body.faqs.length>200) return reply(400,{error:'invalid_content'});
      const entries=body.faqs.map((raw,index)=>{
        const item=asRecord(raw);
        return {id:validId(item.id)?item.id:randomUUID(),category:clean(item.category,40)||'general',question_ru:clean(item.question_ru,300),question_kk:clean(item.question_kk,300),question_en:clean(item.question_en,300),answer_ru:clean(item.answer_ru,2000),answer_kk:clean(item.answer_kk,2000),answer_en:clean(item.answer_en,2000),sort_order:index,is_published:item.is_published!==false};
      });
      if(entries.some(item=>!item.question_ru||!item.question_en||!item.question_kk||!item.answer_ru||!item.answer_en||!item.answer_kk)) return reply(400,{error:'invalid_content'});
      const {error}=await db.from('faqs').upsert(entries,{onConflict:'id'});
      if(error) throw new Error('faq_save_failed');
      return reply(200,{ok:true});
    }

    if(action==='delete_faq') {
      if(!validId(body.id)) return reply(400,{error:'invalid_content'});
      const {error}=await db.from('faqs').delete().eq('id',body.id);
      if(error) throw new Error('faq_delete_failed');
      return reply(200,{ok:true});
    }

    if(action==='settings') {
      const {data,error}=await db.from('site_settings').select('key,value');
      if(error) throw new Error('settings_query_failed');
      return reply(200,{settings:Object.fromEntries((data||[]).map(x=>[x.key,scalar(x.value)]))});
    }

    if(action==='save_settings') {
      const settings=asRecord(body.settings);
      const allowed=['default_language'];
      const values=[];
      for(const key of allowed) if(key in settings) {
        const value=clean(settings[key],300);
        if(key==='whatsapp_number'&&value&&!/^\+?[0-9 ()-]{8,24}$/.test(value)) return reply(400,{error:'invalid_setting'});
        if(key==='default_language'&&!['ru','kk','en'].includes(value)) return reply(400,{error:'invalid_setting'});
        values.push({key,value,updated_at:new Date().toISOString()});
      }
      if(values.length) { const {error}=await db.from('site_settings').upsert(values,{onConflict:'key'});if(error)throw new Error('settings_save_failed'); }
      return reply(200,{ok:true});
    }

    return reply(400,{error:'unknown_action'});
  } catch(error) { return safeError(error); }
};

async function loadApplications(db:SupabaseClient,body:Record<string,unknown>) {
  const status=clean(body.status,30),search=clean(body.search,100).replace(/[\\%_]/g,'');
  const from=clean(body.dateFrom,10),to=clean(body.dateTo,10);
  const load=async(table:'driver_applications'|'rental_applications',type:'driver'|'rental')=>{
    let query=db.from(table).select('*').order('created_at',{ascending:false}).limit(250);
    if(status&&statuses.includes(status)) query=query.eq('status',status);
    if(from&&/^\d{4}-\d{2}-\d{2}$/.test(from)) query=query.gte('created_at',`${from}T00:00:00.000Z`);
    if(to&&/^\d{4}-\d{2}-\d{2}$/.test(to)) query=query.lte('created_at',`${to}T23:59:59.999Z`);
    if(search) query=query.ilike('full_name',`%${search}%`);
    const {data,error}=await query;
    if(error) throw new Error('application_query_failed');
    return (data||[]).map(row=>({...row,type}));
  };
  const [drivers,rentals]=await Promise.all([load('driver_applications','driver'),load('rental_applications','rental')]);
  return [...drivers,...rentals].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,400);
}

function asRecord(value:unknown):Record<string,unknown>{return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};}
function scalar(value:unknown){if(typeof value==='string'||typeof value==='number'||typeof value==='boolean')return value;return value??'';}
function localizedRecord(value:unknown){const input=asRecord(value);return {ru:clean(input.ru,2000),kk:clean(input.kk,2000),en:clean(input.en,2000)};}
function imageList(value:unknown){if(!Array.isArray(value))return ['/assets/vehicle-placeholder.svg'];return value.slice(0,8).filter((x):x is string=>typeof x==='string'&&x.length<1000&&(/^https:\/\//.test(x)||x==='/assets/vehicle-placeholder.svg'));}
