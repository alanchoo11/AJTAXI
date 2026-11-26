import type { Handler } from '@netlify/functions';
import { database, methodNotAllowed, reply, safeError } from '../shared';

export const handler:Handler=async(event)=>{
  if(event.httpMethod!=='GET') return methodNotAllowed(['GET']);
  try {
    const db=database();
    const {data,error}=await db.from('vehicles').select('id,brand,model,year,transmission,fuel_type,description,image_urls,daily_price,weekly_price,monthly_price,deposit,rental_conditions,availability_status,is_demo').eq('is_published',true).eq('is_demo',false).order('brand');
    if(error) throw new Error('database_query_failed');
    return reply(200,{vehicles:data||[]});
  } catch(error) { return safeError(error); }
};
