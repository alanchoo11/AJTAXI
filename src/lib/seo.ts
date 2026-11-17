export function setPageMeta(title:string,description?:string) {
  const fullTitle=`${title} · AJ TAXI PARK`;
  const summary=(description||`${title}. AJ Taxi Park — driver onboarding and vehicle rental in Astana.`).slice(0,300);
  document.title=fullTitle;
  setMeta('name','description',summary);
  setMeta('property','og:title',fullTitle);
  setMeta('property','og:description',summary);
  setMeta('property','og:type','website');
  const base=import.meta.env.VITE_SITE_URL as string|undefined;
  if(base) {
    try {
      const pagePath=window.location.hash.startsWith('#/')?window.location.hash.slice(2):window.location.pathname.replace(/^\/+/, '');
      const canonical=new URL(pagePath||'./',`${base.replace(/\/?$/, '/')}`).toString();
      let link=document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if(!link){link=document.createElement('link');link.rel='canonical';document.head.append(link)}
      link.href=canonical;
      setMeta('property','og:url',canonical);
    } catch { /* Invalid optional site URL; the page still gets a title and description. */ }
  }
}

function setMeta(attribute:'name'|'property',key:string,value:string) {
  let meta=document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if(!meta){meta=document.createElement('meta');meta.setAttribute(attribute,key);document.head.append(meta)}
  meta.content=value;
}
