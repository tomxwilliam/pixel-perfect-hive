import { useState } from "react";
import { Search, Globe, Server, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDomainsHosting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Fetch customer's existing domains
  const { data: domains } = useQuery({
    queryKey: ['customer-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch customer's hosting subscriptions
  const { data: hostingSubscriptions } = useQuery({
    queryKey: ['customer-hosting'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosting_subscriptions')
        .select(`
          *,
          hosting_packages(*),
          domains(domain_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch available hosting packages
  const { data: hostingPackages } = useQuery({
    queryKey: ['hosting-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosting_packages')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const handleDomainSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // TODO: Implement OpenProvider domain search API call
      // For now, simulate search results
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tlds = ['com', 'net', 'org', 'uk', 'co.uk'];
      const mockResults = tlds.map(tld => ({
        domain: `${searchTerm}.${tld}`,
        available: Math.random() > 0.5,
        price: Math.floor(Math.random() * 20) + 10
      }));
      
      setSearchResults(mockResults);
      toast({
        title: "Domain search completed",
        description: `Found ${mockResults.filter(r => r.available).length} available domains`
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search domains. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDomainPurchase = async (domain: string, price: number) => {
    try {
      // TODO: Implement domain purchase flow
      toast({
        title: "Domain purchase initiated",
        description: `Purchase process for ${domain} will be implemented in Phase 2`,
      });
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: "Unable to process domain purchase.",
        variant: "destructive"
      });
    }
  };

  const handleHostingOrder = async (packageId: string) => {
    try {
      // TODO: Implement hosting order flow
      toast({
        title: "Hosting order initiated",
        description: "Hosting provisioning will be implemented in Phase 3",
      });
    } catch (error) {
      toast({
        title: "Order failed", 
        description: "Unable to process hosting order.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Domains & Hosting</h1>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search Domains</TabsTrigger>
          <TabsTrigger value="domains">My Domains ({domains?.length || 0})</TabsTrigger>
          <TabsTrigger value="hosting">My Hosting ({hostingSubscriptions?.length || 0})</TabsTrigger>
          <TabsTrigger value="packages">Hosting Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domain Search</CardTitle>
              <CardDescription>
                Search for available domain names and register them instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter domain name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDomainSearch()}
                />
                <Button onClick={handleDomainSearch} disabled={isSearching}>
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Search Results:</h3>
                  {searchResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.domain}</span>
                        <Badge variant={result.available ? "default" : "secondary"}>
                          {result.available ? 'Available' : 'Taken'}
                        </Badge>
                      </div>
                      {result.available && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">£{result.price}/year</span>
                          <Button size="sm" onClick={() => handleDomainPurchase(result.domain, result.price)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Register
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          {domains?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No domains yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Search and register your first domain to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            domains?.map((domain) => (
              <Card key={domain.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{domain.domain_name}.{domain.tld}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={domain.status === 'active' ? 'default' : 'secondary'}>
                          {domain.status}
                        </Badge>
                        {domain.expiry_date && (
                          <span className="text-sm text-muted-foreground">
                            Expires: {new Date(domain.expiry_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">£{domain.price}</div>
                      <div className="text-xs text-muted-foreground">per year</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="hosting" className="space-y-4">
          {hostingSubscriptions?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Server className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No hosting accounts yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Choose a hosting plan to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            hostingSubscriptions?.map((subscription) => (
              <Card key={subscription.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{subscription.hosting_packages.package_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                        {subscription.domains?.domain_name && (
                          <span className="text-sm text-muted-foreground">
                            Domain: {subscription.domains.domain_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        £{subscription.hosting_packages.monthly_price}/month
                      </div>
                      {subscription.next_billing_date && (
                        <div className="text-xs text-muted-foreground">
                          Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {hostingPackages?.map((pkg) => (
              <Card key={pkg.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {pkg.package_name}
                    {pkg.package_type === 'business' && (
                      <Badge variant="secondary">Popular</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Perfect for {pkg.package_type} use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    £{pkg.monthly_price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li>✓ {pkg.disk_space_gb}GB Storage</li>
                    <li>✓ {pkg.bandwidth_gb}GB Bandwidth</li>
                    <li>✓ {pkg.email_accounts} Email Accounts</li>
                    <li>✓ {pkg.databases} Databases</li>
                    <li>✓ {pkg.subdomains} Subdomains</li>
                    {pkg.free_ssl && <li>✓ Free SSL Certificate</li>}
                  </ul>

                  <Button 
                    className="w-full" 
                    onClick={() => handleHostingOrder(pkg.id)}
                    variant={pkg.package_type === 'business' ? 'default' : 'outline'}
                  >
                    Order Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}