import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Globe, Star, ShoppingCart } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import DomainPurchaseModal from "./DomainPurchaseModal";

interface DomainResult {
  domain: string;
  available: boolean;
  price: number;
  tld: string;
  premium?: boolean;
}

export default function DomainSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DomainResult | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (searchInput: string) => {
      // Parse domain input to extract domain name and any specified TLD
      const parseDomainInput = (input: string) => {
        const cleaned = input.trim().toLowerCase();
        const commonTlds = ['.com', '.co.uk', '.org', '.net', '.uk', '.io', '.ai', '.app'];
        
        // Check if input includes a TLD
        let domainName = cleaned;
        let specifiedTld: string | null = null;
        
        for (const tld of commonTlds) {
          if (cleaned.endsWith(tld)) {
            domainName = cleaned.slice(0, -tld.length);
            specifiedTld = tld;
            break;
          }
        }
        
        // Remove any remaining special characters from domain name
        domainName = domainName.replace(/[^a-z0-9-]/g, '');
        
        return { domainName, specifiedTld };
      };
      
      const { domainName, specifiedTld } = parseDomainInput(searchInput);
      
      // Build TLD list, prioritizing user's specified TLD if any
      let tldList = ['.com', '.co.uk', '.org', '.net', '.uk'];
      if (specifiedTld && !tldList.includes(specifiedTld)) {
        tldList = [specifiedTld, ...tldList];
      } else if (specifiedTld) {
        // Move specified TLD to front
        tldList = [specifiedTld, ...tldList.filter(t => t !== specifiedTld)];
      }
      
      const { data, error } = await supabase.functions.invoke('domain-search', {
        body: {
          domain: domainName,
          tlds: tldList
        }
      });

      if (error) throw error;
      return data.results;
    },
    onSuccess: (data) => {
      setResults(data);
      if (data.length === 0) {
        toast({
          title: "No results",
          description: "No domains found for your search.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search domains. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Enter domain name",
        description: "Please enter a domain name to search.",
        variant: "destructive"
      });
      return;
    }

    searchMutation.mutate(searchTerm.trim());
  };

  const handlePurchase = (domain: DomainResult) => {
    if (!domain.available) {
      toast({
        title: "Domain unavailable",
        description: "This domain is not available for registration.",
        variant: "destructive"
      });
      return;
    }

    setSelectedDomain(domain);
    setPurchaseModalOpen(true);
  };

  const handlePurchaseComplete = () => {
    setPurchaseModalOpen(false);
    setSelectedDomain(null);
    toast({
      title: "Registration successful",
      description: "Your domain has been registered successfully!",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Search
          </CardTitle>
          <CardDescription>
            Search for available domain names and register them instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter domain name (e.g., mywebsite)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={searchMutation.isPending}
            >
              <Search className="h-4 w-4 mr-2" />
              {searchMutation.isPending ? "Searching..." : "Search"}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Search Results</h3>
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.domain}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.domain}</span>
                        {result.premium && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <Badge variant={result.available ? "default" : "secondary"}>
                        {result.available ? "Available" : "Taken"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">£{result.price.toFixed(2)}/year</span>
                      {result.available ? (
                        <Button 
                          size="sm"
                          onClick={() => handlePurchase(result)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Register
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Unavailable
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Searching for available domains...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DomainPurchaseModal
        domain={selectedDomain}
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
}