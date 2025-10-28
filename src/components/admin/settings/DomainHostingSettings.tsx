import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DomainHostingSettingsProps {
  isSuperAdmin: boolean;
}

export default function DomainHostingSettings({ isSuperAdmin }: DomainHostingSettingsProps) {
  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You need super admin privileges to access domain & hosting settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain & Hosting Services
          </CardTitle>
          <CardDescription>
            Domain and hosting services are provided through our partnership with 20i
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="space-y-4">
              <p className="text-sm">
                We have partnered with <strong>20i</strong> to provide professional domain registration and web hosting services. 
                This partnership allows us to offer competitive pricing, excellent uptime, and 24/7 support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <a href="/partner/hosting" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Partner Page
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://www.20i.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit 20i Website
                  </a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ol className="list-decimal list-inside space-y-2">
                <li>Customers visit our partner page to browse domain and hosting options</li>
                <li>They are redirected to 20i's secure platform to complete their purchase</li>
                <li>20i handles all provisioning, billing, and technical support</li>
                <li>We earn commission on successful referrals through our affiliate partnership</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>No infrastructure management required</li>
                <li>Professional 24/7 customer support from 20i</li>
                <li>Industry-leading uptime and performance</li>
                <li>Simplified billing and customer management</li>
                <li>Focus on core services while earning affiliate revenue</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
