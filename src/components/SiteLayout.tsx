import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, Phone, X } from 'lucide-react';
import { useLocale } from '../i18n';
import { setPageMeta } from '../lib/seo';
import { assetUrl } from '../lib/assets';
import { AJLOGIST_PHONE, AJLOGIST_PHONE_TEL } from '../lib/contact';

const nav = [
  { to:'/vehicles', key:'vehicles' as const }, { to:'/owners', key:'owners' as const }, { to:'/contacts', key:'contacts' as const },
];

export function SiteLayout() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const sectionByRoute: Record<string, string> = {
      '/': 'top', '/owners': 'owners', '/contacts': 'contacts',
    };
    const sectionId = sectionByRoute[pathname];
    requestAnimationFrame(() => {
      if (sectionId) document.getElementById(sectionId)?.scrollIntoView({ behavior: pathname === '/' ? 'auto' : 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [pathname]);

  return <div className="site-shell">
    <button className="skip-link" type="button" onClick={() => document.getElementById('main')?.focus()}>{t('skipToContent')}</button>
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="brand" to="/" aria-label={'AJLOGIST — ' + t('home')}><img src={assetUrl('/assets/aj-logo-dark.svg')} alt="AJLOGIST" /></Link>
        <button className="mobile-menu-button icon-button" aria-label={open ? t('closeNavigation') : t('openNavigation')} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label={t('mainNavigation')}>
          {nav.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setOpen(false)}>{t(item.key)}</NavLink>)}
        </nav>
        <div className="desktop-nav-actions"><LanguageSelect /><a className="button button-accent header-cta" href={'tel:' + AJLOGIST_PHONE_TEL}><Phone size={16}/><span>{t('callForDetails')}</span></a></div>
      </div>
    </header>
    <main id="main" tabIndex={-1}><Outlet /></main>
    <Footer />
  </div>;
}

function LanguageSelect() {
  const { locale, setLocale, t } = useLocale();
  return <label className="language-select"><span className="sr-only">{t('language')}</span><select aria-label={t('language')} value={locale} onChange={e => setLocale(e.target.value as 'ru'|'kk'|'en')}>
    <option value="ru">RU</option><option value="kk">ҚАЗ</option><option value="en">EN</option>
  </select></label>;
}

function Footer() {
  const { t } = useLocale();
  return <footer className="site-footer">
    <div className="wrap footer-top">
      <div className="footer-brand"><Link className="footer-wordmark" to="/">AJLOGIST</Link><p>{t('footerLine')}<br/>{t('city')}</p></div>
      <nav className="footer-links" aria-label={t('mainNavigation')}>
        {nav.filter(item => item.key !== 'contacts').map(item => <Link key={item.to} to={item.to}>{t(item.key)}</Link>)}
      </nav>
      <div className="footer-contact"><span>{t('contacts')}</span><a href={'tel:' + AJLOGIST_PHONE_TEL}>{AJLOGIST_PHONE}</a></div>
    </div>
    <div className="wrap footer-bottom"><span>{t('copyright')}</span><Link to="/privacy">{t('legal')}</Link></div>
  </footer>;
}

export function PageHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  useEffect(()=>{
    setPageMeta(title,text);
  },[title,text]);
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{text && <p className="page-intro">{text}</p>}</div></div>;
}

export function SectionHeading({ label, title, text }: { label?: string; title: string; text?: string }) {
  return <div className="section-heading">{label && <span className="eyebrow">{label}</span>}<h2>{title}</h2>{text && <p>{text}</p>}</div>;
}
