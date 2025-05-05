/**
 * Generate Google Analytics 4 script
 * @param {string} measurementId - GA4 measurement ID
 */
const generateGoogleAnalyticsScript = (measurementId) => {
  if (!measurementId) return "";

  return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>
`;
};

/**
 * Generate Meta Pixel (Facebook) script
 * @param {string} pixelId - Meta Pixel ID
 */
const generateFacebookPixelScript = (pixelId) => {
  if (!pixelId) return "";

  return `
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
`;
};

module.exports = {
  generateGoogleAnalyticsScript,
  generateFacebookPixelScript,
};
