import type { Handler } from '@netlify/functions';
import { database, methodNotAllowed, reply, safeError } from '../shared';

export const handler:Handler=async(event)=>{
  if(event.httpMethod!=='GET') return methodNotAllowed(['GET']);
  const type=event.queryStringParameters?.type;
  try {
    const db=database();
    if(type==='faq') {
      const {data,error}=await db.from('faqs').select('id,category,question_kk,question_ru,question_en,answer_kk,answer_ru,answer_en').eq('is_published',true).order('sort_order');
      if(error) throw new Error('database_query_failed');
      const faqs=(data||[]).map(item=>({id:item.id,category:item.category,question:{kk:item.question_kk,ru:item.question_ru,en:item.question_en},answer:{kk:item.answer_kk,ru:item.answer_ru,en:item.answer_en}}));
      return reply(200,{faqs});
    }
    if(type==='settings') {
      const {data,error}=await db.from('site_settings').select('key,value');
      if(error) throw new Error('database_query_failed');
      const allowed=new Set(['default_language']);
      const settings=Object.fromEntries((data||[]).filter(x=>allowed.has(x.key)).map(x=>[x.key,x.value]));
      return reply(200,{settings});
    }
    if(type==='copy') {
      const {data,error}=await db.from('site_content').select('key,value');
      if(error) throw new Error('content_query_failed');
      return reply(200,{content:Object.fromEntries((data||[]).map(x=>[x.key,x.value]))});
    }
    return reply(400,{error:'invalid_content_type'});
  } catch(error) { return safeError(error); }
};
