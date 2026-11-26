import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useLocale } from '../i18n';
import { WhatsAppLink } from './WhatsAppLink';
import { setPageMeta } from '../lib/seo';
import { assetUrl } from '../lib/assets';

const nav = [
  { to:'/', key:'home' as const }, { to:'/vehicles', key:'vehicles' as const }, { to:'/owners', key:'owners' as const },
  { to:'/about', key:'about' as const }, { to:'/faq', key:'faq' as const }, { to:'/contacts', key:'contacts' as const },
];

export function SiteLayout() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  return <div className="site-shell">
    <button className="skip-link" type="button" onClick={() => document.getElementById('main')?.focus()}>{t('skipToContent')}</button>
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="brand" to="/" aria-label={`AJLOGIST — ${t('home')}`}><img src={assetUrl('/assets/aj-logo.svg')} alt="AJLOGIST" /></Link>
        <button className="mobile-menu-button icon-button" aria-label={open ? t('closeNavigation') : t('openNavigation')} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label={t('mainNavigation')}>
          {nav.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setOpen(false)}>{t(item.key)}</NavLink>)}
          <div className="mobile-nav-actions">
            <LanguageSelect />
            <Link className="button button-light" to="/vehicles" onClick={() => setOpen(false)}>{t('exploreCars')}<ArrowUpRight size={16}/></Link>
          </div>
        </nav>
        <div className="desktop-nav-actions"><LanguageSelect /><Link className="button button-light header-cta" to="/vehicles">{t('exploreCars')}<ArrowUpRight size={16}/></Link></div>
      </div>
    </header>
    <main id="main" tabIndex={-1}><Outlet /></main>
    <Footer />
    <WhatsAppLink floating />
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
      <div className="footer-brand"><Link to="/"><img src={assetUrl('/assets/aj-logo.svg')} alt="AJLOGIST" /></Link><p>{t('footerLine')}<br/>{t('city')}</p></div>
      <div className="footer-links"><span className="eyebrow">AJLOGIST</span><div>{nav.map(item => <Link key={item.to} to={item.to}>{t(item.key)}</Link>)}<Link to="/privacy">{t('legal')}</Link></div></div>
      <div className="footer-contact"><span className="eyebrow">{t('contacts')}</span><WhatsAppLink className="footer-whatsapp" message={t('contactText')}>{t('contactUs')}<ArrowUpRight size={15}/></WhatsAppLink></div>
    </div>
    <div className="wrap footer-bottom"><span>{t('copyright')}</span><span>ASTANA · KZ</span></div>
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
