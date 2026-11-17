import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { FAQItem, Locale, RentalPeriod, Vehicle } from '../types';
import { demoVehicles } from '../data/demoVehicles';
import { faqItems } from '../data/faq';
import { calculateMonthlyIncome, type CalculatorInputs } from '../lib/calculator';
import { getPublicSettings, getVehicles, submitDriverApplication, submitRentalApplication } from '../lib/api';
import { useLocale } from '../i18n';
import { PageHeading, SectionHeading } from '../components/SiteLayout';
import { WhatsAppLink } from '../components/WhatsAppLink';
import { setPageMeta } from '../lib/seo';
import { assetUrl, publicImageUrl } from '../lib/assets';

function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(demoVehicles);
  useEffect(() => { let active = true; getVehicles().then(items => { if (active && items.length) setVehicles(items); }); return () => { active = false; }; }, []);
  return vehicles;
}

function localized(value: Partial<Record<Locale,string>> | undefined, locale: Locale) { return value?.[locale] || value?.ru || value?.en || ''; }
function money(value: number | null | undefined, locale: Locale) {
  if (value == null) return null;
  return new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-KZ' : 'en-KZ', { style:'currency', currency:'KZT', maximumFractionDigits:0 }).format(value);
}

export function HomePage() {
  const { t, locale, copy } = useLocale();
  const vehicles = useVehicles();
  useEffect(()=>setPageMeta(t('home'),copy('home_hero_text',t('heroText'))),[locale,t,copy]);
  return <>
    <section className="hero-section wrap">
      <div className="hero-copy reveal"><span className="eyebrow"><span className="status-dot"/>{t('heroKicker')}</span><h1>{copy('home_hero_title',t('heroTitle'))}</h1><p className="hero-lede">{copy('home_hero_text',t('heroText'))}</p><div className="hero-actions"><Link className="button button-light" to="/drivers">{t('becomeDriver')}<ArrowUpRight size={17}/></Link><Link className="button button-outline" to="/vehicles">{t('exploreCars')}<ArrowRight size={17}/></Link></div><div className="hero-location"><span className="mini-line"/>{t('city')}</div></div>
      <div className="hero-visual reveal delay-1"><img src={assetUrl('/assets/vehicle-placeholder.svg')} alt="" /><div className="hero-visual-shade"/><div className="visual-caption"><span className="eyebrow">AJ / 01</span><span>{t('demoNote')}</span></div><div className="visual-index">01 <span>/</span> 02</div></div>
      <button className="hero-scroll" type="button" onClick={()=>document.getElementById('directions')?.scrollIntoView({behavior:'smooth'})}><span>{t('twoWays')}</span><ArrowDown size={15}/></button>
    </section>

    <section className="section wrap" id="directions"><SectionHeading label="01 / AJ TAXI PARK" title={t('twoWays')} text={copy('home_directions_text',t('twoWaysText'))}/>
      <div className="service-list">
        <article className="service-row"><span className="service-number">01</span><div><span className="eyebrow">{t('drivers')}</span><h3>{t('fleet')}</h3><p>{copy('home_driver_text',t('fleetText'))}</p><Link className="text-link" to="/drivers">{t('fleetCta')}<ArrowUpRight size={16}/></Link></div><div className="service-side-mark">AJ<span> / 01</span></div></article>
        <article className="service-row service-row-reverse"><span className="service-number">02</span><div><span className="eyebrow">{t('vehicles')}</span><h3>{t('rental')}</h3><p>{copy('home_rental_text',t('rentalText'))}</p><Link className="text-link" to="/vehicles">{t('rentalCta')}<ArrowUpRight size={16}/></Link></div><div className="service-side-mark service-car-mark"><span className="mark-wheel"/><span className="mark-body"/><span className="mark-wheel mark-wheel-two"/></div></article>
      </div>
    </section>

    <section className="section section-border"><div className="wrap"><div className="section-title-line"><SectionHeading label="02 / CATALOG" title={t('selectedCars')} text={t('demoNote')}/><Link className="text-link desktop-only" to="/vehicles">{t('seeAll')}<ArrowRight size={17}/></Link></div><VehicleGrid vehicles={vehicles.slice(0,3)}/><Link className="button button-outline mobile-only catalog-mobile-link" to="/vehicles">{t('seeAll')}<ArrowRight size={16}/></Link></div></section>

    <CalculatorSection />

    <section className="section wrap"><div className="how-grid"><div><SectionHeading label="03 / PROCESS" title={t('howWorks')}/><p className="muted-copy">{t('practicalText')}</p><Link className="text-link" to="/about">{t('about')}<ArrowUpRight size={16}/></Link></div><div className="steps-list">{(['step1','step2','step3'] as const).map((key,i)=><div className="step-row" key={key}><span className="step-count">0{i+1}</span><div><h3>{t(key)}</h3><p>{t(`${key}Text` as 'step1Text'|'step2Text'|'step3Text')}</p></div></div>)}</div></div></section>

    <FaqPreview />
    <ContactCta />
  </>;
}

function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  return <div className="vehicle-grid">{vehicles.map((vehicle, index)=><VehicleCard key={vehicle.id} vehicle={vehicle} index={index}/>)}</div>;
}

function VehicleCard({ vehicle, index = 0 }: { vehicle: Vehicle; index?: number }) {
  const { t, locale } = useLocale();
  const model = vehicle.model || t('demo');
  return <article className="vehicle-card reveal" style={{ animationDelay:`${index * 80}ms` }}>
    <Link className="vehicle-image" to={`/vehicles/${vehicle.id}`}><img src={publicImageUrl(vehicle.image_urls?.[0])} alt={`${vehicle.brand} ${model}`} loading="lazy" onError={e=>{e.currentTarget.src=assetUrl('/assets/vehicle-placeholder.svg');}}/><span className="vehicle-badge">{vehicle.is_demo ? t('demo') : vehicle.availability_status==='on_request'?t('onRequest'):t(vehicle.availability_status)}</span></Link>
    <div className="vehicle-card-content"><div className="vehicle-name"><h3>{vehicle.brand}</h3><span>{model}</span></div><div className="vehicle-card-bottom"><span>{money(vehicle.daily_price, locale) || t('contactPrice')}</span><Link aria-label={`${t('details')}: ${vehicle.brand}`} to={`/vehicles/${vehicle.id}`}><ArrowUpRight size={19}/></Link></div></div>
  </article>;
}

function CalculatorSection() {
  const { t, locale, copy } = useLocale();
  const [rents, setRents] = useState(false);
  const [inputs, setInputs] = useState<CalculatorInputs>({ dailyGross:35000, workingDays:22, commissionPercent:0, dailyFuel:4500, dailyOther:1000, monthlyRental:0 });
  useEffect(()=>{getPublicSettings().then(settings=>setInputs(prev=>({...prev,
    dailyGross:boundedSetting(settings.calculator_daily_gross,prev.dailyGross,0,1000000),
    workingDays:boundedSetting(settings.calculator_working_days,prev.workingDays,0,31),
    commissionPercent:boundedSetting(settings.calculator_commission,prev.commissionPercent,0,100),
    dailyFuel:boundedSetting(settings.calculator_daily_fuel,prev.dailyFuel,0,1000000),
    dailyOther:boundedSetting(settings.calculator_daily_other,prev.dailyOther,0,1000000),
    monthlyRental:boundedSetting(settings.calculator_monthly_rental,prev.monthlyRental,0,5000000),
  })))},[]);
  const result = useMemo(()=>calculateMonthlyIncome(inputs,rents),[inputs,rents]);
  const formatter = new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-KZ' : 'en-KZ', { maximumFractionDigits:0 });
  const field = (key: keyof CalculatorInputs, label: string, max: number) => <label className="field calculator-field" key={key}><span>{label}</span><div className="number-field"><input aria-label={label} type="number" min="0" max={max} step={key==='commissionPercent'?1:500} value={inputs[key]} onChange={e=>setInputs(prev=>({...prev,[key]:Math.min(max,Math.max(0,Number(e.target.value)||0))}))}/><span>{key==='commissionPercent'?'%':'₸'}</span></div></label>;
  return <section className="section calculator-section"><div className="wrap calculator-layout"><div className="calculator-intro"><span className="eyebrow">04 / {t('calculator')}</span><h2>{t('calculator')}</h2><p>{copy('home_calculator_text',t('calculatorText'))}</p><div className="toggle-row" role="group" aria-label={t('assumptions')}><button className={!rents?'active':''} onClick={()=>setRents(false)}>{t('ownCar')}</button><button className={rents?'active':''} onClick={()=>setRents(true)}>{t('ajRental')}</button></div></div>
    <div className="calculator-panel"><div className="calculator-inputs">{field('dailyGross',t('dailyGross'),1000000)}<label className="field calculator-field"><span>{t('workingDays')}</span><input type="number" min="0" max="31" value={inputs.workingDays} onChange={e=>setInputs(p=>({...p,workingDays:Math.min(31,Math.max(0,Number(e.target.value)||0))}))}/></label>{field('commissionPercent',t('commission'),100)}{field('dailyFuel',t('fuel'),1000000)}{field('dailyOther',t('other'),1000000)}{rents&&field('monthlyRental',t('rentalCost'),5000000)}</div>
    <div className="calculator-results"><div className="result-main"><span>{t('netIncome')}</span><strong>{formatter.format(result.net)} <small>₸</small></strong></div><ResultLine label={t('grossMonth')} value={result.gross} formatter={formatter}/><ResultLine label={t('fleetFee')} value={-result.commission} formatter={formatter}/><ResultLine label={t('fuelMonth')} value={-result.fuel} formatter={formatter}/><ResultLine label={t('otherMonth')} value={-result.other} formatter={formatter}/>{rents&&<ResultLine label={t('rentMonth')} value={-result.rental} formatter={formatter}/>}<p className="calculator-disclaimer">{t('estimateDisclaimer')}</p></div></div></div></section>;
}

function ResultLine({ label, value, formatter }: {label:string; value:number; formatter:Intl.NumberFormat}) { return <div className="result-line"><span>{label}</span><strong>{formatter.format(value)} ₸</strong></div>; }
function boundedSetting(raw:string|undefined,fallback:number,min:number,max:number){const value=Number(raw);return Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;}

function FaqPreview() {
  const { t, locale } = useLocale();
  const [faq, setFaq] = useState(faqItems);
  useEffect(()=>{fetch('/api/content?type=faq').then(r=>r.ok?r.json():null).then(d=>{if(Array.isArray(d?.faqs))setFaq(d.faqs)}).catch(()=>undefined)},[]);
  return <section className="section section-border"><div className="wrap faq-preview-layout"><div><SectionHeading label={`05 / ${t('faq')}`} title={t('faqPreview')}/><Link className="text-link" to="/faq">{t('allFaq')}<ArrowRight size={16}/></Link></div><div className="faq-list">{faq.slice(0,3).map(item=><details key={item.id}><summary>{item.question[locale]}<ChevronDown size={18}/></summary><p>{item.answer[locale]}</p></details>)}</div></div></section>;
}

function ContactCta() {
  const { t, copy } = useLocale();const contact=copy('contact_cta_text',t('contactText'));
  return <section className="contact-cta wrap"><div><span className="eyebrow">06 / AJ TAXI PARK</span><h2>{t('contactTitle')}</h2><p>{contact}</p></div><div className="contact-cta-actions"><WhatsAppLink className="button button-light" message={contact}>{t('contactUs')}<ArrowUpRight size={17}/></WhatsAppLink><Link className="text-link" to="/contacts">{t('contacts')}<ArrowRight size={16}/></Link></div></section>;
}

export function DriversPage() {
  const { t, copy } = useLocale();
  return <><section className="page-top wrap"><PageHeading eyebrow={`AJ / ${t('drivers')}`} title={t('driverTitle')} text={copy('drivers_intro',t('driverText'))}/></section>
    <section className="section wrap"><div className="driver-layout"><div><span className="eyebrow">01 / {t('processTitle')}</span><h2>{t('processTitle')}</h2><div className="steps-list compact-steps">{(['step1','step2','step3'] as const).map((key,i)=><div className="step-row" key={key}><span className="step-count">0{i+1}</span><div><h3>{t(key)}</h3><p>{t(`${key}Text` as 'step1Text'|'step2Text'|'step3Text')}</p></div></div>)}</div></div><div className="note-panel"><span className="eyebrow">02 / {t('requirementsTitle')}</span><h3>{t('requirementsTitle')}</h3><p>{copy('drivers_requirements',t('requirementsText'))}</p></div></div></section>
    <section className="section form-section"><div className="wrap form-layout"><div><span className="eyebrow">03 / {t('applicationTitle')}</span><h2>{t('applicationTitle')}</h2><p>{copy('home_driver_text',t('fleetText'))}</p><WhatsAppLink className="text-link" message={`${t('applicationTitle')} — ${t('city')}`}>{t('contactUs')}<ArrowUpRight size={16}/></WhatsAppLink></div><DriverForm/></div></section></>;
}

function DriverForm() {
  const { t, locale } = useLocale(); const navigate=useNavigate(); const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>) { e.preventDefault();setError('');const data=new FormData(e.currentTarget);const name=String(data.get('name')||'').trim(), phone=String(data.get('phone')||'').trim();const consent=data.get('consent')==='on';
    if(!name||!phone){setError(t('required'));return;}if(!/^[+\d\s()\-]{7,24}$/.test(phone)){setError(t('invalidPhone'));return;}if(!consent){setError(t('consentRequired'));return;}
    const input={fullName:name,phone,preferredLanguage:String(data.get('language')||locale) as Locale,ownsVehicle:data.get('ownsVehicle')==='yes',vehicleBrand:String(data.get('brand')||''),vehicleModel:String(data.get('model')||''),vehicleYear:data.get('year')?Number(data.get('year')):undefined,additionalMessage:String(data.get('message')||''),consent,website:String(data.get('website')||'')};
    setBusy(true);try{await submitDriverApplication(input);navigate('/success',{state:{type:'driver'}})}catch(err){setError(err instanceof Error&&err.message==='not_configured'?t('configError'):t('submitError'))}finally{setBusy(false)}
  }
  return <form className="form-card" onSubmit={submit} noValidate><div className="form-grid"><label className="field"><span>{t('fullName')} *</span><input name="name" autoComplete="name" required maxLength={120}/></label><label className="field"><span>{t('phone')} *</span><input name="phone" type="tel" autoComplete="tel" required maxLength={24} placeholder="+7"/></label><label className="field"><span>{t('preferredLanguage')}</span><select name="language" defaultValue={locale}><option value="kk">Қазақша</option><option value="ru">Русский</option><option value="en">English</option></select></label><label className="field"><span>{t('ownsVehicle')}</span><select name="ownsVehicle"><option value="yes">{t('ownsVehicle')}</option><option value="no">{t('noOwnVehicle')}</option></select></label></div>
    <div className="form-grid vehicle-fields"><label className="field"><span>{t('vehicleBrand')}</span><input name="brand" maxLength={80}/></label><label className="field"><span>{t('vehicleModel')}</span><input name="model" maxLength={80}/></label><label className="field"><span>{t('vehicleYear')}</span><input name="year" type="number" min="1980" max="2035"/></label></div>
    <label className="field"><span>{t('message')}</span><textarea name="message" rows={3} maxLength={1000}/></label><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <label className="consent-field"><input type="checkbox" name="consent"/><span><Link to="/privacy">{t('consent')}</Link></span></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button button-light" type="submit" disabled={busy}>{busy?t('loading'):t('submit')}<ArrowUpRight size={16}/></button></form>;
}

export function VehicleCatalogPage() {
  const {t,copy}=useLocale();const vehicles=useVehicles();const [brand,setBrand]=useState('');const [availability,setAvailability]=useState('');const [maxPrice,setMaxPrice]=useState('');const [period,setPeriod]=useState<RentalPeriod>('day');const [sort,setSort]=useState('name');
  const brands=Array.from(new Set(vehicles.map(v=>v.brand))).sort();const filtered=useMemo(()=>vehicles.filter(v=>{const price=period==='day'?v.daily_price:period==='week'?v.weekly_price:v.monthly_price;return (!brand||v.brand===brand)&&(!availability||v.availability_status===availability)&&(!maxPrice||(price!==null&&price!==undefined&&price<=Number(maxPrice)))}).sort((a,b)=>sort==='price'?((a.daily_price??Infinity)-(b.daily_price??Infinity)):a.brand.localeCompare(b.brand)),[vehicles,brand,availability,maxPrice,period,sort]);
  return <><section className="page-top wrap"><PageHeading eyebrow={`AJ / ${t('vehicles')}`} title={t('rentalTitle')} text={copy('rental_intro',t('rentalIntro'))}/></section><section className="section wrap"><div className="catalog-note"><span className="note-mark">i</span><p>{t('demoNote')}</p></div><div className="catalog-toolbar"><span className="eyebrow"><SlidersHorizontal size={14}/>{t('filters')}</span><div className="filter-fields"><label className="field"><span>{t('brand')}</span><select value={brand} onChange={e=>setBrand(e.target.value)}><option value="">{t('allBrands')}</option>{brands.map(b=><option key={b}>{b}</option>)}</select></label><label className="field"><span>{t('period')}</span><select value={period} onChange={e=>setPeriod(e.target.value as RentalPeriod)}><option value="day">{t('day')}</option><option value="week">{t('week')}</option><option value="month">{t('month')}</option></select></label><label className="field"><span>{t('priceMax')}</span><input type="number" min="0" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/></label><label className="field"><span>{t('status')}</span><select value={availability} onChange={e=>setAvailability(e.target.value)}><option value="">{t('anyAvailability')}</option><option value="available">{t('available')}</option><option value="on_request">{t('onRequest')}</option><option value="unavailable">{t('unavailable')}</option></select></label><label className="field"><span>{t('sort')}</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="name">{t('sortName')}</option><option value="price">{t('sortPrice')}</option></select></label></div></div>
    {filtered.length?<VehicleGrid vehicles={filtered}/>:<div className="empty-state"><span className="empty-icon"><SlidersHorizontal/></span><p>{t('noVehicles')}</p><button className="text-link" onClick={()=>{setBrand('');setAvailability('');setMaxPrice('')}}>{t('filters')}<ArrowRight size={15}/></button></div>}</section></>;
}

export function VehicleDetailsPage() {
  const {id}=useParams();const {t,locale}=useLocale();const vehicles=useVehicles();const vehicle=vehicles.find(v=>v.id===id);const [showForm,setShowForm]=useState(false);
  useEffect(()=>{if(vehicle)setPageMeta(`${vehicle.brand} ${vehicle.model||t('demo')}`,localized(vehicle.description,locale)||t('noSpecs'))},[vehicle,t,locale]);
  if(!vehicle)return <section className="section wrap"><PageHeading title={t('noVehicles')}/><Link className="text-link" to="/vehicles">{t('vehicles')}<ArrowRight size={15}/></Link></section>;
  const model=vehicle.model||t('demo');
  return <><section className="section wrap detail-layout"><div className="detail-image"><img src={publicImageUrl(vehicle.image_urls?.[0])} alt={`${vehicle.brand} ${model}`} onError={e=>e.currentTarget.src=assetUrl('/assets/vehicle-placeholder.svg')}/><span className="vehicle-badge">{vehicle.is_demo?t('demo'):vehicle.availability_status==='on_request'?t('onRequest'):t(vehicle.availability_status)}</span></div><div className="detail-copy"><span className="eyebrow">AJ / {t('details')}</span><h1>{vehicle.brand}<br/><span>{model}</span></h1><p>{localized(vehicle.description,locale)||t('noSpecs')}</p><p className="detail-price">{money(vehicle.daily_price,locale)||t('contactPrice')} <small>/ {t('day').toLowerCase()}</small></p><button className="button button-light" onClick={()=>setShowForm(true)}>{t('requestRental')}<ArrowUpRight size={16}/></button><WhatsAppLink className="text-link" message={`${t('requestRental')}: ${vehicle.brand} ${vehicle.model||t('demo')}`}>{t('contactUs')}<ArrowUpRight size={16}/></WhatsAppLink></div></section>
    <section className="section section-border"><div className="wrap specs-layout"><SectionHeading label={t('details')} title={t('specifications')}/><div className="spec-list"><Spec label={t('brand')} value={vehicle.brand}/><Spec label={t('year')} value={vehicle.year||t('unknown')}/><Spec label={t('transmission')} value={vehicle.transmission||t('unknown')}/><Spec label={t('fuelType')} value={vehicle.fuel_type||t('unknown')}/><Spec label={t('daily')} value={money(vehicle.daily_price,locale)||t('unknown')}/><Spec label={t('weekly')} value={money(vehicle.weekly_price,locale)||t('unknown')}/><Spec label={t('monthly')} value={money(vehicle.monthly_price,locale)||t('unknown')}/><Spec label={t('deposit')} value={money(vehicle.deposit,locale)||t('unknown')}/><Spec label={t('conditions')} value={localized(vehicle.rental_conditions,locale)||t('unknown')}/></div></div></section>
    {showForm&&<RentalModal vehicle={vehicle} onClose={()=>setShowForm(false)}/>}
  </>;
}

function Spec({label,value}:{label:string;value:string|number}) { return <div className="spec-row"><span>{label}</span><strong>{value}</strong></div>; }

function RentalModal({vehicle,onClose}:{vehicle:Vehicle;onClose:()=>void}) {
  const {t}=useLocale();const navigate=useNavigate();const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');const d=new FormData(e.currentTarget);const name=String(d.get('name')||'').trim(),phone=String(d.get('phone')||'').trim();if(!name||!phone){setError(t('required'));return;}if(!/^[+\d\s()\-]{7,24}$/.test(phone)){setError(t('invalidPhone'));return;}if(d.get('consent')!=='on'){setError(t('consentRequired'));return;}setBusy(true);try{await submitRentalApplication({fullName:name,phone,vehicleId:vehicle.id,rentalPeriod:String(d.get('period')||'day') as RentalPeriod,preferredStartDate:String(d.get('start')||''),additionalMessage:String(d.get('message')||''),consent:true,website:String(d.get('website')||'')});navigate('/success',{state:{type:'rental'}})}catch(err){setError(err instanceof Error&&err.message==='not_configured'?t('configError'):t('submitError'))}finally{setBusy(false)}}
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="rental-modal-title" onClick={e=>e.stopPropagation()}><button className="modal-close icon-button" aria-label={t('close')} onClick={onClose}>×</button><span className="eyebrow">AJ / {t('vehicles')}</span><h2 id="rental-modal-title">{t('rentalFormTitle')}</h2><p className="modal-vehicle">{t('selectedVehicle')}: <strong>{vehicle.brand} {vehicle.model||t('demo')}</strong></p><form className="stack-form" onSubmit={submit} noValidate><label className="field"><span>{t('fullName')} *</span><input name="name" required maxLength={120}/></label><label className="field"><span>{t('phone')} *</span><input name="phone" type="tel" required maxLength={24} placeholder="+7"/></label><div className="form-grid"><label className="field"><span>{t('rentalPeriod')}</span><select name="period"><option value="day">{t('day')}</option><option value="week">{t('week')}</option><option value="month">{t('month')}</option></select></label><label className="field"><span>{t('startDate')}</span><input name="start" type="date" min={new Date().toISOString().slice(0,10)}/></label></div><label className="field"><span>{t('message')}</span><textarea name="message" rows={3} maxLength={1000}/></label><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><label className="consent-field"><input type="checkbox" name="consent"/><span><Link to="/privacy">{t('legal')}</Link></span></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button button-light" disabled={busy}>{busy?t('loading'):t('submit')}<ArrowUpRight size={16}/></button></form><p className="modal-footnote">{t('successText')}</p></section></div>;
}

export function AboutPage() {
  const {t,copy}=useLocale();return <><section className="page-top wrap"><PageHeading eyebrow={`AJ / ${t('about')}`} title={t('aboutTitle')} text={copy('about_intro',t('aboutText'))}/></section><section className="section wrap"><div className="about-feature"><div className="about-feature-image"><img src={assetUrl('/assets/vehicle-placeholder.svg')} alt=""/></div><div><span className="eyebrow">{t('city')}</span><h2>{t('practical')}</h2><p>{copy('about_practical',t('practicalText'))}</p></div></div></section><section className="section section-border"><div className="wrap principles-layout"><SectionHeading label={t('principles')} title={t('principles')}/><div className="principles-list">{(['principle1','principle2','principle3'] as const).map((key,i)=><p key={key}><span>0{i+1}</span>{t(key)}</p>)}</div></div></section><ContactCta/></>;
}

export function FaqPage() {
  const {t,locale}=useLocale();const [items,setItems]=useState<FAQItem[]>(faqItems);const [category,setCategory]=useState('all');
  useEffect(()=>{fetch('/api/content?type=faq').then(r=>r.ok?r.json():null).then(d=>{if(Array.isArray(d?.faqs))setItems(d.faqs)}).catch(()=>undefined)},[]);
  const categories=[['all',t('faq')],['drivers',t('catDrivers')],['rental',t('catRental')],['payments',t('catPayments')],['documents',t('catDocuments')],['general',t('catGeneral')]];
  const visible=items.filter(item=>category==='all'||item.category===category);
  return <><section className="page-top wrap"><PageHeading eyebrow={`AJ / ${t('faq')}`} title={t('faqTitle')}/></section><section className="section wrap faq-page-layout"><div className="faq-categories">{categories.map(([key,label])=><button key={key} className={category===key?'active':''} onClick={()=>setCategory(key)}>{label}<ArrowRight size={15}/></button>)}</div><div className="faq-list">{visible.map(item=><details key={item.id}><summary>{item.question[locale]}<ChevronDown size={18}/></summary><p>{item.answer[locale]}</p></details>)}</div></section><ContactCta/></>;
}

export function ContactsPage() {
  const {t,copy}=useLocale();const [settings,setSettings]=useState<Record<string,string>>({});useEffect(()=>{getPublicSettings().then(s=>setSettings(s as Record<string,string>))},[]);return <><section className="page-top wrap"><PageHeading eyebrow={`AJ / ${t('contacts')}`} title={t('contactsTitle')} text={copy('contacts_intro',t('contactsText'))}/></section><section className="section wrap contacts-layout"><div className="contact-detail-list"><div className="contact-detail" id="whatsapp"><span className="eyebrow">{t('whatsapp')}</span><strong>{settings.whatsapp_number||t('placeholder')}</strong><WhatsAppLink className="text-link">{t('contactUs')}<ArrowUpRight size={16}/></WhatsAppLink></div><ContactDetail label={t('phone')} value={settings.phone||t('placeholder')}/><ContactDetail label={t('address')} value={settings.address||t('placeholder')}/><ContactDetail label={t('hours')} value={settings.working_hours||t('placeholder')}/></div><div className="map-placeholder"><div className="map-lines"/><span className="map-pin">AJ</span><p>{t('mapPlaceholder')}</p></div></section></>;
}
function ContactDetail({label,value,action}:{label:string;value:string;action?:React.ReactNode}) { return <div className="contact-detail"><span className="eyebrow">{label}</span><strong>{value}</strong>{action}</div>; }

export function PrivacyPage() {
  const {t}=useLocale();return <section className="page-top wrap"><PageHeading eyebrow={`AJ / ${t('legal')}`} title={t('privacyTitle')}/><div className="privacy-content"><p className="privacy-lede">{t('privacyIntro')}</p><h2>{t('privacyData')}</h2><p>{t('privacyDataText')}</p><h2>{t('privacyUse')}</h2><p>{t('privacyUseText')}</p><h2>{t('privacyRights')}</h2><p>{t('privacyRightsText')}</p><p className="muted-copy">{t('placeholder')}</p></div></section>;
}

export function RentalSuccessPage() {
  const {t}=useLocale();const location=useLocation();const submitted=location.state?.type==='driver'||location.state?.type==='rental';const type=location.state?.type==='driver'?'driverApp':'rentalApp';
  useEffect(()=>setPageMeta(t('successTitle'),t('successText')),[t]);
  if(!submitted)return <Navigate to="/" replace/>;
  return <section className="success-screen wrap"><span className="success-check"><Check size={27}/></span><span className="eyebrow">AJ / {t(type)}</span><h1>{t('successTitle')}</h1><p>{t('successText')}</p><div className="success-actions"><Link className="button button-light" to="/">{t('backHome')}<ArrowRight size={16}/></Link><WhatsAppLink className="button button-outline">{t('contactUs')}<ArrowUpRight size={16}/></WhatsAppLink></div></section>;
}
