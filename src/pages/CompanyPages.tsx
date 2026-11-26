import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, MessageCircle } from 'lucide-react';
import type { FAQItem, Locale } from '../types';
import { faqItems } from '../data/faq';
import { useLocale } from '../i18n';
import { WhatsAppLink } from '../components/WhatsAppLink';
import { setPageMeta } from '../lib/seo';
import { AJLOGIST_PHONE, AJLOGIST_PHONE_TEL } from '../lib/contact';

function contactMessage(locale: Locale, topic: 'rental' | 'owner' | 'general') {
  const messages = {
    ru: {
      rental: 'Здравствуйте! Хочу уточнить наличие автомобиля и условия аренды.',
      owner: 'Здравствуйте! Хочу обсудить передачу автомобиля в аренду.',
      general: 'Здравствуйте! Хочу узнать подробнее об аренде автомобилей AJLOGIST.',
    },
    kk: {
      rental: 'Сәлеметсіз бе! Көліктің қолжетімділігі мен жалдау шарттарын білгім келеді.',
      owner: 'Сәлеметсіз бе! Көлікті жалға беруге ұсыну туралы сөйлескім келеді.',
      general: 'Сәлеметсіз бе! AJLOGIST көліктерін жалға алу туралы білгім келеді.',
    },
    en: {
      rental: 'Hello! I would like to ask about vehicle availability and rental terms.',
      owner: 'Hello! I would like to discuss offering my car for rental.',
      general: 'Hello! I would like to learn more about AJLOGIST car rental.',
    },
  };
  return messages[locale][topic];
}

export function HomePage() {
  const { t, locale } = useLocale();
  useEffect(() => setPageMeta(t('heroTitle'), t('heroText')), [locale, t]);

  return <div className="company-page">
    <section className="company-hero wrap" id="top">
      <div className="company-hero-copy">
        <h1>{t('heroTitle')}</h1>
        <p className="company-hero-lede">{t('heroText')}</p>
        <div className="company-hero-actions">
          <Link className="button button-accent" to="/vehicles">{t('exploreCars')}<ArrowUpRight size={17} /></Link>
          <Link className="text-link hero-owner-link" to="/owners">{t('ownersCta')}<ArrowRight size={16} /></Link>
        </div>
      </div>
      <aside className="hero-path-panel" aria-label={t('twoWays')}>
        <div className="hero-path">
          <span>{t('forDrivers')}</span><strong>{t('driverOffer')}</strong>
        </div>
        <div className="hero-path">
          <span>{t('owners')}</span><strong>{t('ownerOfferShort')}</strong>
        </div>
      </aside>
    </section>

    <section className="company-section wrap" id="rental">
      <div className="company-section-heading">
        <h2>{t('rentalTitle')}</h2>
        <p>{t('rentalIntro')}</p>
      </div>
      <div className="rental-details">
        <div className="rental-facts-intro">
          <h3>{t('benefitsTitle')}</h3>
          <p>{t('benefitsIntro')}</p>
        </div>
        <ul className="rental-facts">
          <li>{t('benefitCondition')}</li>
          <li>{t('benefitTerms')}</li>
          <li>{t('benefitLongTerm')}</li>
          <li>{t('benefitQuick')}</li>
          <li>{t('benefitSupport')}</li>
        </ul>
      </div>
      <div className="rental-actions">
        <p className="scope-note">{t('practicalText')}</p>
        <WhatsAppLink className="button button-accent rental-cta" message={contactMessage(locale, 'rental')}>
          <MessageCircle size={18} /><span>{t('rentalWhatsAppCta')}</span><ArrowUpRight size={17} />
        </WhatsAppLink>
      </div>
    </section>

    <section className="owners-section" id="owners">
      <div className="wrap owners-section-inner">
        <div className="company-section-heading">
          <h2>{t('ownersTitle')}</h2>
          <p>{t('ownersIntro')}</p>
        </div>
        <div className="owner-terms">
          <h3>{t('ownerShareTitle')}</h3>
          <p>{t('ownerShareText')}</p>
          <WhatsAppLink className="text-link owner-contact-link" message={contactMessage(locale, 'owner')}>
            <MessageCircle size={16} /><span>{t('ownerWhatsappCta')}</span><ArrowUpRight size={16} />
          </WhatsAppLink>
        </div>
      </div>
    </section>

    <FaqPreview />
    <ContactBlock message={contactMessage(locale, 'general')} />
  </div>;
}

function FaqList({ items }: { items: FAQItem[] }) {
  const { locale } = useLocale();
  return <div className="faq-list">{items.map(item => <details key={item.id}>
    <summary>{item.question[locale]}<ChevronDown size={18} aria-hidden="true" /></summary>
    <p>{item.answer[locale]}</p>
  </details>)}</div>;
}

function FaqPreview() {
  const { t } = useLocale();
  return <section className="faq-preview-section wrap" aria-labelledby="faq-preview-title">
    <div className="faq-preview-heading">
      <div><h2 id="faq-preview-title">{t('faqTitle')}</h2><p>{t('faqIntro')}</p></div>
      <Link className="text-link" to="/faq">{t('allFaq')}<ArrowRight size={16} /></Link>
    </div>
    <FaqList items={faqItems.slice(0, 2)} />
  </section>;
}

function ContactBlock({ message }: { message: string }) {
  const { t } = useLocale();
  return <section className="contact-section" id="contacts">
    <div className="wrap contact-section-inner">
      <div className="contact-copy">
        <h2>{t('contactTitle')}</h2>
        <p>{t('contactText')}</p>
      </div>
      <div className="contact-methods">
        <a className="contact-phone" href={'tel:' + AJLOGIST_PHONE_TEL}>{AJLOGIST_PHONE}</a>
        <span className="contact-city">{t('city')}</span>
        <WhatsAppLink className="button button-paper" message={message}>
          <MessageCircle size={17} /><span>{t('whatsapp')}</span><ArrowUpRight size={16} />
        </WhatsAppLink>
      </div>
    </div>
  </section>;
}

export function OwnerPage() { return <HomePage />; }

export function VehicleCatalogPage() {
  const { t, locale } = useLocale();
  const cars = [
    { brand: 'Geely', model: 'Emgrand', year: '' },
    { brand: 'JAC', model: 'J7', year: '2023' },
    { brand: 'BYD', model: 'Seal 05', year: '2025' },
    { brand: 'Hyundai', model: 'Accent', year: '2021' },
  ];
  useEffect(() => setPageMeta(t('catalogTitle'), t('catalogIntro')), [locale, t]);
  return <div className="company-page">
    <section className="page-top wrap"><div className="catalog-heading"><h1>{t('catalogTitle')}</h1><p>{t('catalogIntro')}</p></div></section>
    <section className="section wrap catalog-section" aria-label={t('catalogTitle')}>
      <div className="catalog-list">{cars.map((car) => {
        const name = [car.brand, car.model, car.year].filter(Boolean).join(' ');
        return <article className="catalog-row" key={name}>
          <div className="catalog-model"><h2>{car.brand} {car.model}</h2>{car.year && <span>{car.year} {t('modelYear')}</span>}</div>
          <WhatsAppLink className="catalog-contact" message={t('catalogMessage').replace('{model}', name)}>
            <MessageCircle size={16} /><span>WhatsApp · {t('catalogAsk')}</span><ArrowUpRight size={17} />
          </WhatsAppLink>
        </article>;
      })}</div>
    </section>
  </div>;
}

export function VehicleDetailsPage() { return <VehicleCatalogPage />; }

export function AboutPage() {
  const { t, locale } = useLocale();
  useEffect(() => setPageMeta(t('aboutTitle'), t('aboutText')), [locale, t]);
  return <div className="company-page">
    <section className="page-top wrap"><div className="catalog-heading"><h1>{t('aboutTitle')}</h1><p>{t('aboutText')}</p></div></section>
    <section className="section wrap about-details">
      <article><h2>{t('aboutRentalTitle')}</h2><p>{t('aboutRentalText')}</p><Link className="text-link" to="/vehicles">{t('exploreCars')}<ArrowRight size={16} /></Link></article>
      <article><h2>{t('aboutOwnersTitle')}</h2><p>{t('aboutOwnersText')}</p><Link className="text-link" to="/owners">{t('ownersCta')}<ArrowRight size={16} /></Link></article>
    </section>
    <section className="about-scope wrap"><p>{t('practicalText')}</p><Link className="text-link" to="/faq">{t('faqTitle')}<ArrowRight size={16} /></Link></section>
  </div>;
}

export function FaqPage() {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState('all');
  const categories = [['all', t('catAll')], ['rental', t('catRental')], ['owners', t('catOwners')]] as const;
  const visible = faqItems.filter(item => category === 'all' || item.category === category);
  useEffect(() => setPageMeta(t('faqTitle'), t('faqIntro')), [locale, t]);
  return <div className="company-page">
    <section className="page-top wrap"><div className="catalog-heading"><h1>{t('faqTitle')}</h1><p>{t('faqIntro')}</p></div></section>
    <section className="section wrap faq-page-layout" aria-label={t('faqTitle')}>
      <div className="faq-categories" role="group" aria-label={t('faqTitle')}>
        {categories.map(([key, label]) => <button key={key} type="button" className={category === key ? 'active' : ''} aria-pressed={category === key} onClick={() => setCategory(key)}>{label}<ArrowRight size={15} /></button>)}
      </div>
      <FaqList items={visible} />
    </section>
    <ContactBlock message={contactMessage(locale, 'general')} />
  </div>;
}

export function ContactsPage() {
  const { t, locale } = useLocale();
  useEffect(() => setPageMeta(t('contactsTitle'), t('contactsText')), [locale, t]);
  return <div className="company-page">
    <section className="page-top wrap"><div className="catalog-heading"><h1>{t('contactsTitle')}</h1><p>{t('contactsText')}</p></div></section>
    <ContactBlock message={contactMessage(locale, 'general')} />
  </div>;
}

export function PrivacyPage() {
  const { t, locale } = useLocale();
  useEffect(() => setPageMeta(t('privacyTitle'), t('privacyIntro')), [locale, t]);
  const date = new Intl.DateTimeFormat(locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en' : 'ru-RU', { dateStyle: 'long' }).format(new Date());
  return <section className="privacy-page wrap">
    <h1>{t('privacyTitle')}</h1>
    <p className="privacy-updated">{t('privacyUpdated')} {date}</p>
    <p className="privacy-lede">{t('privacyIntro')}</p>
    <h2>{t('privacyData')}</h2><p>{t('privacyDataText')}</p>
    <h2>{t('privacyStorage')}</h2><p>{t('privacyStorageText')}</p>
    <h2>{t('privacyUse')}</h2><p>{t('privacyUseText')}</p>
    <h2>{t('privacyRights')}</h2><p>{t('privacyRightsText')}</p>
    <a className="text-link privacy-law-link" href="https://old.adilet.zan.kz/rus/docs/Z1300000094" target="_blank" rel="noreferrer">{t('privacyLaw')}<ArrowUpRight size={15} /></a>
  </section>;
}

export function NotFoundPage() {
  const { t } = useLocale();
  const { pathname } = useLocation();
  useEffect(() => setPageMeta(t('notFoundTitle'), t('notFoundText')), [pathname, t]);
  return <section className="page-top wrap not-found-page">
    <div className="catalog-heading"><h1>{t('notFoundTitle')}</h1><p>{t('notFoundText')}</p>
      <div className="not-found-actions"><Link className="button button-accent" to="/">{t('backHome')}<ArrowRight size={16} /></Link><Link className="text-link" to="/vehicles">{t('vehicles')}<ArrowRight size={16} /></Link></div>
    </div>
  </section>;
}

export function RentalSuccessPage() { return <NotFoundPage />; }
