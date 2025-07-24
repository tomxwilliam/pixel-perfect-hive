import { useState } from "react";
import { Search, Globe, Server, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
export default function CustomerDomainsHosting() {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch customer's existing domains
  const {
    data: domains,
    refetch: refetchDomains
  } = useQuery({
    queryKey: ['customer-domains'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('domains').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });

  // Fetch customer's hosting subscriptions
  const {
    data: hostingSubscriptions
  } = useQuery({
    queryKey: ['customer-hosting'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('hosting_subscriptions').select(`
          *,
          hosting_packages(*),
          domains(domain_name)
        `).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });

  // Fetch available hosting packages
  const {
    data: hostingPackages
  } = useQuery({
    queryKey: ['hosting-packages'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('hosting_packages').select('*').eq('is_active', true).order('monthly_price', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });
  const handleDomainSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const response = await supabase.functions.invoke('domain-search', {
        body: {
          domain: searchTerm.toLowerCase().trim(),
          tlds: ['.com', '.co.uk', '.org', '.net', '.info', '.biz']
        }
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      setSearchResults(response.data.results || []);
      toast({
        title: "Domain search completed",
        description: `Found ${response.data.results?.filter((r: any) => r.available).length || 0} available domains`
      });
    } catch (error) {
      console.error('Domain search failed:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search for domains. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  const handleDomainPurchase = async (domain: string, price: number) => {
    if (!user) return;
    try {
      const domainParts = domain.split('.');
      const domainName = domainParts[0];
      const tld = '.' + domainParts.slice(1).join('.');
      const response = await supabase.functions.invoke('domain-register', {
        body: {
          domain: domainName,
          tld: tld,
          price: price,
          customerId: user.id
        }
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      toast({
        title: "Registration Initiated",
        description: `Domain registration for ${domain} has been initiated. You will receive an invoice shortly.`
      });

      // Refresh domains list
      if (refetchDomains) refetchDomains();

      // Clear search results
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Domain purchase failed:', error);
      toast({
        title: "Registration Failed",
        description: "Unable to initiate domain registration. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleHostingOrder = async (packageId: string) => {
    if (!user) return;
    try {
      const response = await supabase.functions.invoke('hosting-order', {
        body: {
          packageId: packageId,
          customerId: user.id,
          billingCycle: 'annual' // Updated to annual billing to match new plans
        }
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      toast({
        title: "Hosting Order Created",
        description: "Your hosting order has been created. You will receive an invoice shortly."
      });

      // Refresh hosting subscriptions list
      // The useQuery will automatically refetch
    } catch (error) {
      console.error('Hosting order failed:', error);
      toast({
        title: "Order Failed",
        description: "Unable to process hosting order. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
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
                <Input placeholder="Enter domain name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleDomainSearch()} />
                <Button onClick={handleDomainSearch} disabled={isSearching}>
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {searchResults.length > 0 && <div className="space-y-2">
                  <h3 className="font-semibold">Search Results:</h3>
                  {searchResults.map((result, index) => <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.domain}</span>
                        <Badge variant={result.available ? "default" : "secondary"}>
                          {result.available ? 'Available' : 'Taken'}
                        </Badge>
                      </div>
                      {result.available && <div className="flex items-center gap-2">
                          <span className="text-sm">£{result.price}/year</span>
                          <Button size="sm" onClick={() => handleDomainPurchase(result.domain, result.price)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Register
                          </Button>
                        </div>}
                    </div>)}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          {domains?.length === 0 ? <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No domains yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Search and register your first domain to get started
                </p>
              </CardContent>
            </Card> : domains?.map(domain => <Card key={domain.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{domain.domain_name}.{domain.tld}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={domain.status === 'active' ? 'default' : 'secondary'}>
                          {domain.status}
                        </Badge>
                        {domain.expiry_date && <span className="text-sm text-muted-foreground">
                            Expires: {new Date(domain.expiry_date).toLocaleDateString()}
                          </span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">£{domain.price}</div>
                      <div className="text-xs text-muted-foreground">per year</div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
        </TabsContent>

        <TabsContent value="hosting" className="space-y-4">
          {hostingSubscriptions?.length === 0 ? <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Server className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No hosting accounts yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Choose a hosting plan to get started
                </p>
              </CardContent>
            </Card> : hostingSubscriptions?.map(subscription => <Card key={subscription.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{subscription.hosting_packages.package_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                        {subscription.domains?.domain_name && <span className="text-sm text-muted-foreground">
                            Domain: {subscription.domains.domain_name}
                          </span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        £{subscription.hosting_packages.monthly_price}/month
                      </div>
                      {subscription.next_billing_date && <div className="text-xs text-muted-foreground">
                          Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
                        </div>}
                    </div>
                  </div>
                </CardContent>
              </Card>)}
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Web Hosting Packages (Annual Billing)</h2>
            <p className="text-muted-foreground">
              All packages include a FREE .co.uk domain, lightning-fast UK servers, and 24/7 support.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="relative border-2 border-green-200">
              <CardHeader className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🟢</span>
                </div>
                <CardTitle className="text-xl">Starter Plan</CardTitle>
                <div className="text-3xl font-bold">
                  £33
                  <span className="text-sm font-normal text-muted-foreground"> / year</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    1 Website
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    5 GB SSD Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Free SSL Certificate
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Free .co.uk Domain
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    1 Email Account
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Weekly Backups
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    UK-Based Support
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={() => handleHostingOrder('11111111-1111-1111-1111-111111111111')}>
                  Choose Plan
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-200">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Best Value</Badge>
              </div>
              <CardHeader className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🔵</span>
                </div>
                <CardTitle className="text-xl">Pro Plan</CardTitle>
                <div className="text-3xl font-bold">
                  £66
                  <span className="text-sm font-normal text-muted-foreground"> / year</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    3 Websites
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    20 GB SSD Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Free SSL Certificates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Free .co.uk Domain
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    5 Email Accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Daily Backups
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Priority UK Support
                  </li>
                </ul>
                <Button className="w-full" onClick={() => handleHostingOrder('22222222-2222-2222-2222-222222222222')}>
                  Choose Plan
                </Button>
              </CardContent>
            </Card>

            {/* Elite Plan */}
            <Card className="relative border-2 border-purple-200">
              <CardHeader className="text-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🟣</span>
                </div>
                <CardTitle className="text-xl">Elite Plan</CardTitle>
                <div className="text-3xl font-bold">
                  £99
                  <span className="text-sm font-normal text-muted-foreground"> / year</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Unlimited Websites
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    50 GB SSD Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Free SSL Certificates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Free .co.uk Domain
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Unlimited Emails
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Daily Backups
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Priority UK Support
                  </li>
                  
                </ul>
                <Button className="w-full" variant="outline" onClick={() => handleHostingOrder('33333333-3333-3333-3333-333333333333')}>
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}