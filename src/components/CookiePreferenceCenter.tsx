import { useState, useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Shield, Settings, BarChart3, Megaphone } from 'lucide-react';

export function CookiePreferenceCenter() {
  const {
    isPreferenceCenterOpen,
    closePreferenceCenter,
    preferences,
    savePreferences,
    acceptAll,
    rejectAll,
  } = useCookieConsent();

  const [localPreferences, setLocalPreferences] = useState({
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        preferences: preferences.preferences,
        analytics: preferences.analytics,
        marketing: preferences.marketing,
      });
    }
  }, [preferences, isPreferenceCenterOpen]);

  const handleSave = () => {
    savePreferences(localPreferences);
  };

  return (
    <Dialog open={isPreferenceCenterOpen} onOpenChange={closePreferenceCenter}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Necessary Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label className="text-base font-semibold">Necessary Cookies</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Required for the website to function properly. These cannot be disabled.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Examples: Authentication, security, session management
                    </p>
                  </div>
                </div>
                <Switch checked={true} disabled className="mt-1" />
              </div>
              <Separator />
            </div>

            {/* Preference Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Settings className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label htmlFor="preferences" className="text-base font-semibold cursor-pointer">
                      Preference Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Remember your settings and preferences (theme, language, UI state).
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Examples: Theme preference, sidebar state, language selection
                    </p>
                  </div>
                </div>
                <Switch
                  id="preferences"
                  checked={localPreferences.preferences}
                  onCheckedChange={(checked) =>
                    setLocalPreferences({ ...localPreferences, preferences: checked })
                  }
                  className="mt-1"
                />
              </div>
              <Separator />
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label htmlFor="analytics" className="text-base font-semibold cursor-pointer">
                      Analytics Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Help us understand how visitors use our website to improve user experience.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Examples: Google Analytics, page views, user behaviour tracking
                    </p>
                  </div>
                </div>
                <Switch
                  id="analytics"
                  checked={localPreferences.analytics}
                  onCheckedChange={(checked) =>
                    setLocalPreferences({ ...localPreferences, analytics: checked })
                  }
                  className="mt-1"
                />
              </div>
              <Separator />
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Megaphone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label htmlFor="marketing" className="text-base font-semibold cursor-pointer">
                      Marketing Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Used to deliver personalized advertisements and track campaign effectiveness.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Examples: Ad pixels, remarketing tags, social media integrations
                    </p>
                  </div>
                </div>
                <Switch
                  id="marketing"
                  checked={localPreferences.marketing}
                  onCheckedChange={(checked) =>
                    setLocalPreferences({ ...localPreferences, marketing: checked })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="pt-4">
              <p className="text-xs text-muted-foreground">
                For more information about our cookie usage, please read our{' '}
                <Link to="/legal/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={rejectAll} className="w-full sm:w-auto">
            Reject All
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" onClick={acceptAll} className="flex-1 sm:flex-none">
              Accept All
            </Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none">
              Save Preferences
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
