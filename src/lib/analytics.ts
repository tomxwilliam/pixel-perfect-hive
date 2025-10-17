// Google Analytics integration with cookie consent

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

let isInitialized = false;

export function initializeAnalytics(hasConsent: boolean) {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // Only initialize if we have a measurement ID and consent
  if (!measurementId || !hasConsent || isInitialized) {
    return;
  }

  // Create gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true, // GDPR compliance
    cookie_flags: 'SameSite=None;Secure',
  });

  isInitialized = true;
}

export function trackPageView(path: string) {
  if (!window.gtag || !isInitialized) return;

  window.gtag('event', 'page_view', {
    page_path: path,
  });
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (!window.gtag || !isInitialized) return;

  window.gtag('event', eventName, params);
}

export function updateConsentMode(hasAnalyticsConsent: boolean, hasMarketingConsent: boolean) {
  if (!window.gtag) return;

  window.gtag('consent', 'update', {
    analytics_storage: hasAnalyticsConsent ? 'granted' : 'denied',
    ad_storage: hasMarketingConsent ? 'granted' : 'denied',
    ad_user_data: hasMarketingConsent ? 'granted' : 'denied',
    ad_personalization: hasMarketingConsent ? 'granted' : 'denied',
  });
}
