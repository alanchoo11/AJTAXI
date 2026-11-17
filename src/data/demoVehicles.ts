import type { Locale, Vehicle } from '../types';

const demoLabel: Record<Locale, string> = { ru:'Модель будет подтверждена', kk:'Моделі кейін расталады', en:'Model to be confirmed' };
const conditions: Record<Locale, string> = { ru:'Демонстрационная запись. Уточните у AJ модель, стоимость, залог и наличие.', kk:'Демонстрациялық жазба. Модельді, бағаны, кепілдік жарнаны және қолжетімділікті AJ-ден нақтылаңыз.', en:'Demonstration record. Confirm model, price, deposit and availability with AJ.' };

export const demoVehicles: Vehicle[] = ['BYD', 'Chery', 'Haval', 'Geely', 'Changan'].map((brand, index) => ({
  id:`demo-${index + 1}`, brand, model:'', year:null, transmission:null, fuel_type:null,
  description:{ ru:demoLabel.ru, kk:demoLabel.kk, en:demoLabel.en },
  image_urls:['/assets/vehicle-placeholder.svg'], daily_price:null, weekly_price:null, monthly_price:null, deposit:null,
  rental_conditions:{ ru:conditions.ru, kk:conditions.kk, en:conditions.en }, availability_status:'on_request', is_demo:true,
}));
