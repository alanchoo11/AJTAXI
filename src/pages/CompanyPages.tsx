import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';
import type { Locale } from '../types';
import { useLocale } from '../i18n';
import { WhatsAppLink } from '../components/WhatsAppLink';
import { setPageMeta } from '../lib/seo';
import { AJLOGIST_PHONE, AJLOGIST_PHONE_TEL } from '../lib/contact';

function contactMessage(locale: Locale, topic: 'rental' | 'owner' | 'general') {
  const messages = {
    ru: {
      rental: 'Здравствуйте! Хочу уточнить условия аренды автомобиля.',
      owner: 'Здравствуйте! Хочу обсудить передачу автомобиля в аренду и условия для владельца.',
      general: 'Здравствуйте! Хочу узнать подробнее об аренде автомобилей AJLOGIST.',
    },
    kk: {
      rental: 'Сәлеметсіз бе! Көлікті жалға алу шарттарын білгім келеді.',
      owner: 'Сәлеметсіз бе! Көлікті жалға беру және иесіне арналған шарттарды талқылағым келеді.',
      general: 'Сәлеметсіз бе! AJLOGIST көліктерін жалға алу туралы білгім келеді.',
    },
    en: {
      rental: 'Hello! I would like to ask about the car rental terms.',
      owner: 'Hello! I would like to discuss offering my car for rental and the owner terms.',
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
          <a className="button button-accent" href={'tel:' + AJLOGIST_PHONE_TEL}>{t('callForDetails')}<ArrowUpRight size={17} /></a>
          <Link className="text-link hero-owner-link" to="/owners">{t('ownersCta')}<ArrowRight size={16} /></Link>
        </div>
      </div>
      <div className="hero-path-panel">
        <Link className="hero-path" to="/vehicles">
          <span>{t('vehicles')}</span><strong>{t('rentalTitle')}</strong><ArrowRight size={19} />
        </Link>
        <Link className="hero-path" to="/owners">
          <span>{t('owners')}</span><strong>{t('ownerShareTitle')}</strong><ArrowRight size={19} />
        </Link>
      </div>
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
            <span>{t('ownersCta')}</span><ArrowUpRight size={16} />
          </WhatsAppLink>
        </div>
      </div>
    </section>

    <section className="contact-section" id="contacts">
      <div className="wrap contact-section-inner">
        <div className="contact-copy">
          <h2>{t('contactTitle')}</h2>
          <p>{t('contactText')}</p>
        </div>
        <div className="contact-methods">
          <a className="contact-phone" href={'tel:' + AJLOGIST_PHONE_TEL}>{AJLOGIST_PHONE}</a>
          <span className="contact-city">{t('city')}</span>
          <WhatsAppLink className="button button-paper" message={contactMessage(locale, 'general')}>
            <MessageCircle size={17} /><span>{t('whatsapp')}</span><ArrowUpRight size={16} />
          </WhatsAppLink>
        </div>
      </div>
    </section>
  </div>;
}

export function OwnerPage() { return <HomePage />; }
export function VehicleCatalogPage() {
  const { t, locale } = useLocale();
  const cars = [
    { brand: 'Geely', model: 'Emgrand', year: null },
    { brand: 'JAC', model: 'J7', year: '2023' },
    { brand: 'BYD', model: 'Seal 05', year: '2025' },
    { brand: 'Hyundai', model: 'Accent', year: '2021' },
  ];
  useEffect(() => setPageMeta(t('catalogTitle'), t('catalogIntro')), [locale, t]);
  return <>
    <section className="page-top wrap"><div className="catalog-heading"><span className="eyebrow">{t('vehicles')}</span><h1>{t('catalogTitle')}</h1><p>{t('catalogIntro')}</p></div></section>
    <section className="section wrap catalog-section" aria-label={t('catalogTitle')}>
      <div className="catalog-list">{cars.map((car) => {
        const name = [car.brand, car.model, car.year].filter(Boolean).join(' ');
        return <article className="catalog-row" key={name}>
          <div className="catalog-model"><h2>{car.brand} {car.model}</h2>{car.year && <span>{car.year}</span>}</div>
          <WhatsAppLink className="catalog-contact" message={t('catalogMessage').replace('{model}', name)}>
            {t('catalogAsk')}<ArrowUpRight size={17} />
          </WhatsAppLink>
        </article>;
      })}</div>
    </section>
  </>;
}
export function VehicleDetailsPage() { return <Navigate to="/vehicles" replace />; }
export function AboutPage() { return <Navigate to="/" replace />; }
export function FaqPage() { return <Navigate to="/" replace />; }
export function RentalSuccessPage() { return <Navigate to="/" replace />; }

export function ContactsPage() { return <HomePage />; }

export function PrivacyPage() {
  const { t } = useLocale();
  useEffect(() => setPageMeta(t('privacyTitle'), t('privacyIntro')), [t]);
  return <section className="privacy-page wrap">
    <h1>{t('privacyTitle')}</h1>
    <p className="privacy-lede">{t('privacyIntro')}</p>
    <h2>{t('privacyData')}</h2><p>{t('privacyDataText')}</p>
    <h2>{t('privacyUse')}</h2><p>{t('privacyUseText')}</p>
    <h2>{t('privacyRights')}</h2><p>{t('privacyRightsText')}</p>
  </section>;
}
