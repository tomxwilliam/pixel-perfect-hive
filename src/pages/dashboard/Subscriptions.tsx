import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCustomerSubscriptions } from "@/hooks/useCustomerSubscriptions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Monitor, Globe, ArrowLeft } from "lucide-react";
import { SubscriptionPlanCard } from "@/components/customer/SubscriptionPlanCard";
import { ActiveSubscriptionCard } from "@/components/customer/ActiveSubscriptionCard";
import { Link } from "react-router-dom";

const Subscriptions = () => {
  const { user } = useAuth();
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { subscriptions, loading: subsLoading } = useCustomerSubscriptions();

  const itSupportPlans = plans.filter(p => p.category === 'it_support');
  const websiteCarePlans = plans.filter(p => p.category === 'website_care');

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StaticNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Back Button */}
          <Link to="/dashboard">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage your IT support and website care subscriptions
            </p>
          </div>

          {/* Active Subscriptions */}
          {subsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeSubscriptions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Active Subscriptions</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeSubscriptions.map((subscription) => (
                  <ActiveSubscriptionCard key={subscription.id} subscription={subscription} />
                ))}
              </div>
            </div>
          )}

          {/* Available Plans */}
          <Tabs defaultValue="it_support" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="it_support" className="gap-2">
                <Monitor className="h-4 w-4" />
                IT Support Plans
              </TabsTrigger>
              <TabsTrigger value="website_care" className="gap-2">
                <Globe className="h-4 w-4" />
                Website Care Plans
              </TabsTrigger>
            </TabsList>

            <TabsContent value="it_support" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Monitor className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">IT Support Plans</h2>
                    <p className="text-muted-foreground">Remote support and tech assistance</p>
                  </div>
                </div>

                {plansLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {itSupportPlans.map((plan) => (
                      <SubscriptionPlanCard key={plan.id} plan={plan} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="website_care" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">404 Website Care Plans</h2>
                    <p className="text-muted-foreground">Ongoing website maintenance and support</p>
                  </div>
                </div>

                {plansLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {websiteCarePlans.map((plan) => (
                      <SubscriptionPlanCard key={plan.id} plan={plan} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Subscriptions;
