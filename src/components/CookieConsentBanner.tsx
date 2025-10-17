import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

export function CookieConsentBanner() {
  const { hasConsented, acceptAll, rejectAll, openPreferenceCenter } = useCookieConsent();

  if (hasConsented) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg animate-in slide-in-from-bottom duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground font-medium mb-1">
                We use cookies to enhance your experience
              </p>
              <p className="text-xs text-muted-foreground">
                We use cookies to improve functionality, analyze traffic, and remember your preferences.{' '}
                <Link to="/legal/cookies" className="text-primary hover:underline">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              onClick={acceptAll}
              className="flex-1 md:flex-none"
              size="sm"
            >
              Accept All
            </Button>
            <Button
              onClick={rejectAll}
              variant="outline"
              className="flex-1 md:flex-none"
              size="sm"
            >
              Reject Non-Essential
            </Button>
            <Button
              onClick={openPreferenceCenter}
              variant="ghost"
              className="flex-1 md:flex-none"
              size="sm"
            >
              Manage Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
