import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Globe, ShoppingCart, Server, Check } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

interface DomainQuote {
  available: boolean;
  domain: string;
  years: number;
  domainPrice: number;
  idProtectPrice: number;
  totalGBP: number;
  currency: string;
}

interface HostingPackage {
  id: string;
  package_name: string;
  stripe_price_id: string;
  annual_price: number;
  features: any;
}

export default function HostingDomainCheckout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [domainQuote, setDomainQuote] = useState<DomainQuote | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<HostingPackage | null>(null);
  const [years, setYears] = useState(1);
  const [idProtect, setIdProtect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  // Fetch hosting packages
  const { data: hostingPackages } = useQuery({
    queryKey: ['hosting-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosting_packages')
        .select('*')
        .eq('is_active', true)
        .not('stripe_price_id', 'is', null)
        .order('monthly_price', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Get domain quote
  const getDomainQuote = useMutation({
    mutationFn: async ({ domain, years, id_protect }: { domain: string; years: number; id_protect: boolean }) => {
      const { data, error } = await supabase.functions.invoke('domain-quote', {
        body: { domain, years, id_protect }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setDomainQuote(data);
      if (!data.available) {
        toast({
          title: "Domain Unavailable",
          description: `${data.domain} is not available for registration`,
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Quote Failed",
        description: error.message || "Failed to get domain quote",
        variant: "destructive"
      });
    }
  });

  // Create checkout session
  const createCheckout = useMutation({
    mutationFn: async () => {
      if (!selectedPackage || !domainQuote) throw new Error("Package and domain required");
      
      const { data, error } = await supabase.functions.invoke('combined-checkout', {
        body: {
          hostingPriceId: selectedPackage.stripe_price_id,
          domain: domainQuote.domain,
          years: domainQuote.years,
          id_protect: idProtect,
          nameservers: ['ns1.404codelab.com', 'ns2.404codelab.com'],
          domainPriceGBP: domainQuote.domainPrice,
          idProtectPriceGBP: domainQuote.idProtectPrice
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Failed",
        description: error.message || "Failed to create checkout session",
        variant: "destructive"
      });
    }
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Enter domain name",
        description: "Please enter a domain name to search",
        variant: "destructive"
      });
      return;
    }

    const domain = searchTerm.trim().includes('.') 
      ? searchTerm.trim() 
      : `${searchTerm.trim()}.com`;

    getDomainQuote.mutate({ domain, years, id_protect: idProtect });
  };

  const totalPrice = selectedPackage && domainQuote 
    ? selectedPackage.annual_price + domainQuote.totalGBP 
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Domain Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Search
          </CardTitle>
          <CardDescription>
            Search for your perfect domain name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter domain name (e.g., mywebsite.com)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Input
              type="number"
              placeholder="Years"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value) || 1)}
              className="w-24"
              min="1"
              max="10"
            />
            <Button 
              onClick={handleSearch}
              disabled={getDomainQuote.isPending}
            >
              <Search className="h-4 w-4 mr-2" />
              {getDomainQuote.isPending ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="id-protect" 
              checked={idProtect}
              onCheckedChange={(checked) => setIdProtect(checked as boolean)}
            />
            <label htmlFor="id-protect" className="text-sm">
              Add ID Protection (+£{Math.round((9.95 * 0.79 * 1.05 * years) * 100) / 100}/year)
            </label>
          </div>

          {domainQuote && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{domainQuote.domain}</h3>
                  <p className="text-sm text-muted-foreground">
                    {domainQuote.years} year{domainQuote.years > 1 ? 's' : ''}
                    {idProtect && ' + ID Protection'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={domainQuote.available ? "default" : "destructive"}>
                    {domainQuote.available ? "Available" : "Unavailable"}
                  </Badge>
                  <p className="font-semibold">£{domainQuote.totalGBP.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hosting Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Choose Hosting Package
          </CardTitle>
          <CardDescription>
            Select the hosting plan that fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {hostingPackages?.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-6 border rounded-lg cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{pkg.package_name}</h3>
                  {selectedPackage?.id === pkg.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-2xl font-bold">
                    £{pkg.annual_price}/year
                  </div>
                  <div className="text-sm text-muted-foreground">
                    £{pkg.monthly_price}/month when paid yearly
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {pkg.features?.websites && (
                    <div>Websites: {pkg.features.websites}</div>
                  )}
                  <div>{pkg.disk_space_gb}GB Storage</div>
                  <div>Unlimited Bandwidth</div>
                  <div>{pkg.email_accounts} Email Account{pkg.email_accounts > 1 ? 's' : ''}</div>
                  {pkg.features?.ssl && <div>Free SSL Certificate</div>}
                  {pkg.features?.backups && <div>{pkg.features.backups} Backups</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary & Checkout */}
      {selectedPackage && domainQuote?.available && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{selectedPackage.package_name} (1 year)</span>
                <span>£{selectedPackage.annual_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{domainQuote.domain} ({domainQuote.years} year{domainQuote.years > 1 ? 's' : ''})</span>
                <span>£{domainQuote.domainPrice.toFixed(2)}</span>
              </div>
              {idProtect && (
                <div className="flex justify-between">
                  <span>ID Protection ({domainQuote.years} year{domainQuote.years > 1 ? 's' : ''})</span>
                  <span>£{domainQuote.idProtectPrice.toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>£{totalPrice.toFixed(2)}/year</span>
              </div>
            </div>

            <Button 
              onClick={() => createCheckout.mutate()}
              disabled={createCheckout.isPending}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {createCheckout.isPending ? "Creating checkout..." : "Proceed to Checkout"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}