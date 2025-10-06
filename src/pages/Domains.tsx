import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface DomainAvailability {
  domain: string;
  available: boolean;
  price: number;
  tld: string;
}

export default function Domains() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTld, setSelectedTld] = useState(".com");
  const [years, setYears] = useState(1);
  const [selectedHosting, setSelectedHosting] = useState<string | null>(null);
  const [domainResult, setDomainResult] = useState<DomainAvailability | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch TLD pricing
  const { data: tldPricing } = useQuery({
    queryKey: ["tld-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domain_tld_pricing")
        .select("tld, reg_1y_gbp")
        .order("tld");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch hosting packages
  const { data: hostingPackages } = useQuery({
    queryKey: ["hosting-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hosting_packages")
        .select("*")
        .eq("is_active", true)
        .order("monthly_price");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setDomainResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("domain-search", {
        body: {
          domain: searchTerm.trim().toLowerCase().replace(/^www\./, ""),
          tlds: [selectedTld],
        },
      });

      if (error) throw error;

      if (data && data.results && data.results.length > 0) {
        setDomainResult(data.results[0]);
      }
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message || "Failed to search domain",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!domainResult?.available) {
      toast({
        title: "Error",
        description: "Domain is not available",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an order",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const hostingPackage = selectedHosting 
        ? hostingPackages?.find(p => p.id === selectedHosting)
        : null;

      const hostingPrice = hostingPackage ? Number(hostingPackage.monthly_price) * 12 * years : 0;
      const domainPrice = Number(domainResult.price) * years;
      const totalEstimate = domainPrice + hostingPrice;

      const { error } = await supabase
        .from("pending_domain_orders")
        .insert({
          user_id: user.id,
          domain_name: domainResult.domain,
          tld: domainResult.tld,
          years,
          domain_price: domainPrice,
          hosting_plan_id: selectedHosting,
          hosting_price: hostingPrice,
          total_estimate: totalEstimate,
          status: "PENDING_REVIEW",
        });

      if (error) throw error;

      toast({
        title: "Order Submitted",
        description: "Your order is pending admin review. We'll notify you once it's approved!",
      });

      // Navigate to orders page
      navigate("/account/orders");
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedHostingPackage = hostingPackages?.find(p => p.id === selectedHosting);
  const hostingPrice = selectedHostingPackage ? Number(selectedHostingPackage.monthly_price) * 12 * years : 0;
  const domainPrice = domainResult ? Number(domainResult.price) * years : 0;
  const totalEstimate = domainPrice + hostingPrice;

  return (
    <>
      <Seo
        title="Search Domains & Hosting"
        description="Find your perfect domain name and optional web hosting packages"
      />
      
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Domain</h1>
            <p className="text-muted-foreground text-lg">
              Search for available domains and add optional hosting
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Domain Search</CardTitle>
              <CardDescription>
                Enter your desired domain name and select a TLD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-col sm:flex-row">
                <Input
                  placeholder="yourdomain"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Select value={selectedTld} onValueChange={setSelectedTld}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tldPricing?.map((tld) => (
                      <SelectItem key={tld.tld} value={tld.tld}>
                        {tld.tld} - £{tld.reg_1y_gbp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Search Result */}
              {domainResult && (
                <div className="mt-6 p-6 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {domainResult.available ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold text-lg">{domainResult.domain}</p>
                        <p className="text-sm text-muted-foreground">
                          {domainResult.available ? "Available" : "Not Available"}
                        </p>
                      </div>
                    </div>
                    {domainResult.available && (
                      <div className="text-right">
                        <p className="text-2xl font-bold">£{domainResult.price}</p>
                        <p className="text-sm text-muted-foreground">per year</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Only show the rest if domain is available */}
          {domainResult?.available && (
            <>
              {/* Years Selector */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Registration Period</CardTitle>
                  <CardDescription>How many years would you like to register?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={String(years)} onValueChange={(val) => setYears(Number(val))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y} {y === 1 ? "Year" : "Years"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Hosting Packages */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Optional Web Hosting</CardTitle>
                  <CardDescription>
                    Add a hosting package or choose domain only
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedHosting === null
                          ? "border-primary shadow-lg"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => setSelectedHosting(null)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">Domain Only</CardTitle>
                        <p className="text-sm text-muted-foreground">No hosting</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">£0</p>
                      </CardContent>
                    </Card>

                    {hostingPackages?.map((pkg) => (
                      <Card
                        key={pkg.id}
                        className={`cursor-pointer transition-all ${
                          selectedHosting === pkg.id
                            ? "border-primary shadow-lg"
                            : "hover:border-muted-foreground/50"
                        }`}
                        onClick={() => setSelectedHosting(pkg.id)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                          <Badge variant="secondary">{pkg.package_type}</Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold mb-2">
                            £{pkg.monthly_price}/mo
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• {pkg.disk_space_gb}GB Storage</li>
                            <li>• {pkg.email_accounts} Email Accounts</li>
                            {pkg.free_ssl && <li>• Free SSL</li>}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="mb-8 border-primary">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <div className="flex items-start gap-2 mt-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Subject to admin verification. You'll receive an invoice after approval.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Domain ({domainResult.domain})</span>
                    <span className="font-semibold">£{domainPrice.toFixed(2)}</span>
                  </div>
                  {selectedHostingPackage && (
                    <div className="flex justify-between">
                      <span>Hosting ({selectedHostingPackage.package_name})</span>
                      <span className="font-semibold">£{hostingPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration Period</span>
                    <span>{years} {years === 1 ? "Year" : "Years"}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total Estimate</span>
                    <span>£{totalEstimate.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Order for Review"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}
