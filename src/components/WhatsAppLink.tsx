import { MessageCircle, ArrowUpRight } from 'lucide-react';
import { whatsappUrl } from '../lib/whatsapp';
import { useLocale } from '../i18n';
import { AJLOGIST_WHATSAPP_NUMBER } from '../lib/contact';

export function WhatsAppLink({ children, className = '', message, floating = false }: { children?: React.ReactNode; className?: string; message?: string; floating?: boolean }) {
  const { t } = useLocale();
  const number=AJLOGIST_WHATSAPP_NUMBER;
  const content = children ?? <><MessageCircle size={18}/><span>{t('whatsapp')}</span>{!floating && <ArrowUpRight size={15}/>}</>;
  const text = message || `${t('contactUs')} — AJLOGIST`;
  const href = whatsappUrl(text,number);
  return <a className={`${floating ? 'whatsapp-float' : ''} ${className}`} href={href} target={href.startsWith('https:')?'_blank':undefined} rel={href.startsWith('https:')?'noreferrer':undefined} aria-label={floating ? t('whatsapp') : undefined} title={floating ? t('whatsapp') : undefined}>{content}</a>;
}
