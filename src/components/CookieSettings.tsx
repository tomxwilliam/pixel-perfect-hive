import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CookieSettings() {
  const { preferences, openPreferenceCenter, hasConsented } = useCookieConsent();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cookie className="h-5 w-5 text-primary" />
          <CardTitle>Privacy & Cookies</CardTitle>
        </div>
        <CardDescription>
          Manage your cookie preferences and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasConsented && preferences ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-sm">Necessary</span>
                <Badge variant="default">Always On</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-sm">Preferences</span>
                <Badge variant={preferences.preferences ? 'default' : 'secondary'}>
                  {preferences.preferences ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-sm">Analytics</span>
                <Badge variant={preferences.analytics ? 'default' : 'secondary'}>
                  {preferences.analytics ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-sm">Marketing</span>
                <Badge variant={preferences.marketing ? 'default' : 'secondary'}>
                  {preferences.marketing ? 'On' : 'Off'}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(preferences.timestamp).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You haven't set your cookie preferences yet.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={openPreferenceCenter} className="flex-1">
            <Settings className="mr-2 h-4 w-4" />
            Manage Cookie Preferences
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/legal/cookies">View Cookie Policy</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
