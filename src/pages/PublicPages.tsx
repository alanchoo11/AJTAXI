import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { FAQItem, Locale, Vehicle } from '../types';
import { faqItems } from '../data/faq';
import { getVehicles } from '../lib/api';
import { useLocale } from '../i18n';
import { PageHeading, SectionHeading } from '../components/SiteLayout';
import { WhatsAppLink } from '../components/WhatsAppLink';
import { setPageMeta } from '../lib/seo';
import { assetUrl, publicImageUrl } from '../lib/assets';
import { AJLOGIST_PHONE, AJLOGIST_PHONE_TEL } from '../lib/contact';

function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  useEffect(() => {
    let active = true;
    getVehicles().then(items => {
      if (active) setVehicles(items.filter(vehicle => !vehicle.is_demo && vehicle.brand.trim() && vehicle.model.trim()));
    });
    return () => { active = false; };
  }, []);
  return vehicles;
}

function localized(value: Partial<Record<Locale, string>> | undefined, locale: Locale) {
  return value?.[locale] || value?.ru || value?.en || '';
}

export function HomePage() {
  const { t, locale } = useLocale();
  const vehicles = useVehicles();
  useEffect(() => setPageMeta(t('home'), t('heroText')), [locale, t]);
  return <>
    <section className="hero-section wrap">
      <div className="hero-copy reveal">
        <span className="eyebrow"><span className="status-dot" />{t('heroKicker')}</span>
        <h1>{t('heroTitle')}</h1>
        <p className="hero-lede">{t('heroText')}</p>
        <div className="hero-actions">
          <Link className="button button-light" to="/vehicles">{t('exploreCars')}<ArrowUpRight size={17} /></Link>
          <Link className="button button-outline" to="/owners">{t('owners') }<ArrowRight size={17} /></Link>
        </div>
        <div className="hero-location"><span className="mini-line" />{t('city')}</div>
      </div>
      <div className="hero-visual reveal delay-1">
        <img src={assetUrl('/assets/vehicle-placeholder.svg')} alt="" />
        <div className="hero-visual-shade" />
        <div className="visual-caption"><span>{t('heroVisualCaption')}</span></div>
      </div>
      <a className="hero-scroll" href="#directions"><span>{t('twoWays')}</span><ArrowRight size={15} /></a>
    </section>

    <section className="section wrap" id="directions">
      <SectionHeading title={t('twoWays')} text={t('twoWaysText')} />
      <div className="service-list">
        <article className="service-row">
          <div className="service-copy"><span className="eyebrow">{t('vehicles')}</span><h3>{t('rental')}</h3><p>{t('rentalText')}</p><Link className="text-link" to="/vehicles">{t('rentalCta')}<ArrowUpRight size={16} /></Link></div>
          <div className="service-side-mark service-car-mark" aria-hidden="true"><span className="mark-wheel" /><span className="mark-body" /><span className="mark-wheel mark-wheel-two" /></div>
        </article>
        <article className="service-row">
          <div className="service-copy"><span className="eyebrow">{t('owners')}</span><h3>{t('ownerOfferTitle')}</h3><p>{t('ownerOfferText')}</p><Link className="text-link" to="/owners">{t('ownersCta')}<ArrowUpRight size={16} /></Link></div>
          <div className="service-side-mark owner-mark" aria-hidden="true">AJ</div>
        </article>
      </div>
    </section>

    {vehicles.length > 0 && <section className="section section-border"><div className="wrap">
      <div className="section-title-line"><SectionHeading title={t('selectedCars')} /><Link className="text-link" to="/vehicles">{t('seeAll')}<ArrowRight size={17} /></Link></div>
      <VehicleGrid vehicles={vehicles.slice(0, 3)} />
    </div></section>}

    <section className="section section-border"><div className="wrap benefits-layout">
      <SectionHeading title={t('benefitsTitle')} text={t('benefitsIntro')} />
      <BenefitsList />
    </div></section>

    <FaqPreview />
    <ContactCta />
  </>;
}

function BenefitsList() {
  const { t } = useLocale();
  const benefits = ['benefitCondition', 'benefitTerms', 'benefitLongTerm', 'benefitQuick', 'benefitSupport'] as const;
  return <ul className="benefits-list">{benefits.map(key => <li key={key}>{t(key)}</li>)}</ul>;
}

export function OwnerPage() {
  const { t } = useLocale();
  return <>
    <section className="page-top wrap"><PageHeading eyebrow={t('owners')} title={t('ownersTitle')} text={t('ownersIntro')} /></section>
    <section className="section wrap owner-page-content">
      <div><span className="eyebrow">{t('ownerOfferTitle')}</span><h2>{t('ownerShareTitle')}</h2><p className="muted-copy">{t('ownerShareText')}</p></div>
      <div className="note-panel"><h3>{t('benefitsTitle')}</h3><BenefitsList /></div>
    </section>
    <ContactCta />
  </>;
}

function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  return <div className="vehicle-grid">{vehicles.map((vehicle, index) => <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />)}</div>;
}

function VehicleCard({ vehicle, index = 0 }: { vehicle: Vehicle; index?: number }) {
  const { t } = useLocale();
  const title = [vehicle.brand, vehicle.model].filter(Boolean).join(' ');
  return <article className="vehicle-card reveal" style={{ animationDelay: (index * 80) + 'ms' }}>
    <Link className="vehicle-image" to={'/vehicles/' + vehicle.id}>
      <img src={publicImageUrl(vehicle.image_urls?.[0])} alt={title} loading="lazy" onError={e => { e.currentTarget.src = assetUrl('/assets/vehicle-placeholder.svg'); }} />
      <span className="vehicle-badge">{vehicle.availability_status === 'on_request' ? t('onRequest') : t(vehicle.availability_status)}</span>
    </Link>
    <div className="vehicle-card-content"><div className="vehicle-name"><h3>{vehicle.brand}</h3><span>{vehicle.model}</span></div>
      <div className="vehicle-card-bottom"><span>{t('callForDetails')}</span><Link aria-label={t('viewVehicle') + ': ' + title} to={'/vehicles/' + vehicle.id}><ArrowUpRight size={19} /></Link></div>
    </div>
  </article>;
}

function FaqPreview() {
  const { t, locale } = useLocale();
  return <section className="section section-border"><div className="wrap faq-preview-layout">
    <div><SectionHeading title={t('faqPreview')} /><Link className="text-link" to="/faq">{t('allFaq')}<ArrowRight size={16} /></Link></div>
    <FaqList items={faqItems.slice(0, 3)} locale={locale} />
  </div></section>;
}

function FaqList({ items, locale }: { items: FAQItem[]; locale: Locale }) {
  return <div className="faq-list">{items.map(item => <details key={item.id}>
    <summary>{item.question[locale]}<ChevronDown size={18} /></summary><p>{item.answer[locale]}</p>
  </details>)}</div>;
}

function ContactCta() {
  const { t } = useLocale();
  return <section className="contact-cta wrap"><div>
    <span className="eyebrow">AJLOGIST</span><h2>{t('contactTitle')}</h2><p>{t('contactText')}</p>
    <a className="contact-phone" href={'tel:' + AJLOGIST_PHONE_TEL}>{AJLOGIST_PHONE}</a>
  </div><div className="contact-cta-actions">
    <WhatsAppLink className="button button-light" message={t('contactText')}>{t('contactUs')}<ArrowUpRight size={17} /></WhatsAppLink>
    <Link className="text-link" to="/contacts">{t('contacts')}<ArrowRight size={16} /></Link>
  </div></section>;
}

export function VehicleCatalogPage() {
  const { t } = useLocale();
  const vehicles = useVehicles();
  return <>
    <section className="page-top wrap"><PageHeading eyebrow={t('vehicles')} title={t('rentalTitle')} text={t('rentalIntro')} /></section>
    <section className="section wrap">
      {vehicles.length ? <VehicleGrid vehicles={vehicles} /> : <div className="empty-state">
        <span className="empty-icon"><SlidersHorizontal /></span><p>{t('catalogEmpty')}</p>
        <a className="button button-outline" href={'tel:' + AJLOGIST_PHONE_TEL}>{t('callForDetails')}</a>
      </div>}
    </section>
  </>;
}

export function VehicleDetailsPage() {
  const { id } = useParams();
  const { t, locale } = useLocale();
  const vehicles = useVehicles();
  const vehicle = vehicles.find(item => item.id === id);
  useEffect(() => {
    if (vehicle) setPageMeta([vehicle.brand, vehicle.model].filter(Boolean).join(' '), localized(vehicle.description, locale) || t('noSpecs'));
  }, [vehicle, locale, t]);
  if (!vehicle) return <section className="section wrap"><PageHeading title={t('catalogEmpty')} /><Link className="text-link" to="/vehicles">{t('vehicles')}<ArrowRight size={15} /></Link></section>;
  const title = [vehicle.brand, vehicle.model].filter(Boolean).join(' ');
  const description = localized(vehicle.description, locale);
  const conditions = localized(vehicle.rental_conditions, locale);
  return <>
    <section className="section wrap detail-layout">
      <div className="detail-image"><img src={publicImageUrl(vehicle.image_urls?.[0])} alt={title} onError={e => { e.currentTarget.src = assetUrl('/assets/vehicle-placeholder.svg'); }} />
        <span className="vehicle-badge">{vehicle.availability_status === 'on_request' ? t('onRequest') : t(vehicle.availability_status)}</span>
      </div>
      <div className="detail-copy"><span className="eyebrow">{t('vehicles')}</span><h1>{vehicle.brand}<br /><span>{vehicle.model}</span></h1>
        {description && <p>{description}</p>}
        <p className="detail-contact-note">{t('callForDetails')}</p>
        <a className="button button-light" href={'tel:' + AJLOGIST_PHONE_TEL}>{t('contactUs')}<ArrowUpRight size={16} /></a>
        <WhatsAppLink className="text-link" message={t('contactText')}>{t('whatsapp')}<ArrowUpRight size={16} /></WhatsAppLink>
      </div>
    </section>
    {conditions && <section className="section section-border"><div className="wrap"><SectionHeading title={t('conditions')} /><p className="muted-copy vehicle-conditions">{conditions}</p></div></section>}
  </>;
}

export function AboutPage() {
  const { t } = useLocale();
  return <>
    <section className="page-top wrap"><PageHeading eyebrow={t('about')} title={t('aboutTitle')} text={t('aboutText')} /></section>
    <section className="section wrap about-copy"><SectionHeading title={t('twoWays')} text={t('aboutDetails')} /><BenefitsList /></section>
    <ContactCta />
  </>;
}

export function FaqPage() {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState('all');
  const categories = [['all', t('faq')], ['rental', t('catRental')], ['owners', t('catOwners')]] as const;
  const visible = faqItems.filter(item => category === 'all' || item.category === category);
  return <>
    <section className="page-top wrap"><PageHeading eyebrow={t('faq')} title={t('faqTitle')} /></section>
    <section className="section wrap faq-page-layout">
      <div className="faq-categories">{categories.map(([key, label]) => <button key={key} className={category === key ? 'active' : ''} onClick={() => setCategory(key)}>{label}<ArrowRight size={15} /></button>)}</div>
      <FaqList items={visible} locale={locale} />
    </section>
    <ContactCta />
  </>;
}

export function ContactsPage() {
  const { t } = useLocale();
  return <>
    <section className="page-top wrap"><PageHeading eyebrow={t('contacts')} title={t('contactsTitle')} text={t('contactsText')} /></section>
    <section className="section wrap contacts-layout"><div className="contact-detail-list">
      <div className="contact-detail"><span className="eyebrow">{t('phone')}</span><a className="contact-number" href={'tel:' + AJLOGIST_PHONE_TEL}>{AJLOGIST_PHONE}</a></div>
      <div className="contact-detail"><span className="eyebrow">WhatsApp</span><WhatsAppLink className="text-link">{t('contactUs')}<ArrowUpRight size={16} /></WhatsAppLink></div>
      <div className="contact-detail"><span className="eyebrow">{t('cityLabel')}</span><strong>{t('city')}</strong></div>
    </div></section>
  </>;
}

export function PrivacyPage() {
  const { t } = useLocale();
  return <section className="page-top wrap"><PageHeading eyebrow={t('legal')} title={t('privacyTitle')} />
    <div className="privacy-content"><p className="privacy-lede">{t('privacyIntro')}</p><h2>{t('privacyData')}</h2><p>{t('privacyDataText')}</p><h2>{t('privacyUse')}</h2><p>{t('privacyUseText')}</p><h2>{t('privacyRights')}</h2><p>{t('privacyRightsText')}</p></div>
  </section>;
}

export function RentalSuccessPage() {
  return <Navigate to="/" replace />;
}
