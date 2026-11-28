import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, MessageCircle, X } from 'lucide-react';
import { useLocale } from '../i18n';
import { setPageMeta } from '../lib/seo';
import { assetUrl } from '../lib/assets';
import { AJLOGIST_PHONE } from '../lib/contact';
import { WhatsAppLink } from './WhatsAppLink';

const nav = [
  { to:'/vehicles', key:'vehicles' as const }, { to:'/owners', key:'owners' as const }, { to:'/contacts', key:'contacts' as const },
];

export function SiteLayout() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const sectionByRoute: Record<string, string> = {
      '/': 'top', '/owners': 'owners',
    };
    const sectionId = sectionByRoute[pathname];
    setOpen(false);
    const frame = requestAnimationFrame(() => {
      const target = sectionId ? document.getElementById(sectionId) : null;
      if (!target) {
        window.scrollTo(0, 0);
        return;
      }
      const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 76;
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight - 12);
      window.scrollTo(0, top);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return <div className="site-shell">
    <button className="skip-link" type="button" onClick={() => document.getElementById('main')?.focus()}>{t('skipToContent')}</button>
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="brand" to="/" aria-label={'AJLOGIST — ' + t('home')} onClick={event => {
          setOpen(false);
          if (pathname === '/') { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        }}><img src={assetUrl('/assets/ajlogist-logo-2026.png')} alt="AJLOGIST" /></Link>
        <button className="mobile-menu-button icon-button" aria-label={open ? t('closeNavigation') : t('openNavigation')} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav id="primary-navigation" className={`main-nav ${open ? 'is-open' : ''}`} aria-label={t('mainNavigation')}>
          {nav.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setOpen(false)}>{t(item.key)}</NavLink>)}
        </nav>
        <div className="desktop-nav-actions"><LanguageSelect /><WhatsAppLink className="button button-accent header-cta" message={t('contactText')}><MessageCircle size={16}/><span>{t('contactUs')}</span></WhatsAppLink></div>
      </div>
      {open && <button className="mobile-nav-backdrop" type="button" aria-label={t('closeNavigation')} onClick={() => setOpen(false)} />}
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
      <div className="footer-brand"><Link className="footer-wordmark" to="/" aria-label="AJLOGIST"><img src={assetUrl('/assets/ajlogist-logo-light-2026.png')} alt="" /></Link><p>{t('footerLine')}<br/>{t('city')}</p></div>
      <nav className="footer-links" aria-label={t('mainNavigation')}>
        {nav.map(item => <Link key={item.to} to={item.to}>{t(item.key)}</Link>)}
      </nav>
      <div className="footer-contact"><span className="footer-phone">{AJLOGIST_PHONE}</span><WhatsAppLink className="footer-whatsapp" /></div>
    </div>
    <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} AJLOGIST · {t('city')}</span><Link to="/privacy">{t('legal')}</Link></div>
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
