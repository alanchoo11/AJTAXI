import { MessageCircle, ArrowUpRight } from 'lucide-react';
import { whatsappUrl } from '../lib/whatsapp';
import { getPublicSettings } from '../lib/api';
import { useEffect, useState } from 'react';
import { useLocale } from '../i18n';

export function WhatsAppLink({ children, className = '', message, floating = false }: { children?: React.ReactNode; className?: string; message?: string; floating?: boolean }) {
  const { t } = useLocale();
  const [number,setNumber]=useState<string|undefined>(import.meta.env.VITE_WHATSAPP_NUMBER);
  useEffect(()=>{getPublicSettings().then(settings=>{if(settings.whatsapp_number)setNumber(settings.whatsapp_number)})},[]);
  const content = children ?? <><MessageCircle size={18}/><span>{t('whatsapp')}</span>{!floating && <ArrowUpRight size={15}/>}</>;
  const text = message || `${t('contactUs')} — AJ Taxi Park`;
  const href = whatsappUrl(text,number);
  return <a className={`${floating ? 'whatsapp-float' : ''} ${className}`} href={href} target={href.startsWith('https:')?'_blank':undefined} rel={href.startsWith('https:')?'noreferrer':undefined} aria-label={floating ? t('whatsapp') : undefined} title={floating ? t('whatsapp') : undefined}>{content}</a>;
}
