import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import type { PageContextServer } from 'vike/types'
import { AppRoot } from '@/renderer/AppRoot'
import { getMetadata } from '@/shared/seo/metadata'
import type { PageData } from '@/shared/seo/route-data'
import { siteUrl } from '@/renderer/server-config'
import { jsonForHtml } from '@/shared/lib/plain-text'
import { metrikaId } from '@/shared/analytics/metrika'
import { gudokTag } from '@/shared/analytics/gudok'

const metrikaTag = metrikaId
  ? `<script type="text/javascript">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${metrikaId}', 'ym');

    ym(${metrikaId}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
</script>`
  : ''

const metrikaNoscript = metrikaId
  ? `<noscript><div><img src="https://mc.yandex.ru/watch/${metrikaId}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>`
  : ''

export function onRenderHtml(pageContext: PageContextServer) {
  const data = (pageContext.data ?? pageContext.abortReason ?? { url: pageContext.urlOriginal, siteUrl, status: pageContext.is404 ? 404 : 500, ssr: true }) as PageData
  const meta = getMetadata(data.url, data)
  const html = data.ssr ? renderToString(<AppRoot data={data} server />) : ''
  return {
    documentHtml: escapeInject`<!DOCTYPE html>
      <html lang="ru"><head>
      <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1c1f22" /><link rel="icon" href="/favicon.ico" />
      <meta name="google-site-verification" content="Gb-69uubJew9MOxsK3Cl-z5IAMLNVpHmYKjMNE-o-bI" />
      <title>${meta.title}</title><meta name="description" content="${meta.description}" />
      <meta name="robots" content="${meta.robots}" /><link rel="canonical" href="${meta.canonical}" />
      <meta property="og:type" content="website" /><meta property="og:site_name" content="ИНВИА" /><meta property="og:locale" content="ru_RU" />
      <meta property="og:title" content="${meta.title}" /><meta property="og:description" content="${meta.socialDescription}" /><meta property="og:url" content="${meta.canonical}" /><meta property="og:image" content="${meta.image}" />
      <meta name="twitter:card" content="summary" /><meta name="twitter:title" content="${meta.title}" /><meta name="twitter:description" content="${meta.socialDescription}" /><meta name="twitter:image" content="${meta.image}" />
      ${meta.jsonLd.length ? escapeInject`<script id="seo-json-ld" type="application/ld+json">${dangerouslySkipEscape(jsonForHtml(meta.jsonLd))}</script>` : ''}
      ${dangerouslySkipEscape(metrikaTag)}
      ${dangerouslySkipEscape(gudokTag)}
      </head><body><div id="root">${dangerouslySkipEscape(html)}</div>${dangerouslySkipEscape(metrikaNoscript)}</body></html>`,
    pageContext: { data },
  }
}
