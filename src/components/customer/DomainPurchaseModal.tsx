import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Globe, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface DomainResult {
  domain: string;
  available: boolean;
  price: number;
  tld: string;
  premium?: boolean;
}

interface DomainPurchaseModalProps {
  domain: DomainResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete: () => void;
}

export default function DomainPurchaseModal({ 
  domain, 
  open, 
  onOpenChange, 
  onPurchaseComplete 
}: DomainPurchaseModalProps) {
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    address: '',
    city: '',
    postcode: '',
    country: 'GB',
    phone: ''
  });
  const { toast } = useToast();

  const registerDomainMutation = useMutation({
    mutationFn: async () => {
      if (!domain) throw new Error('No domain selected');

      // First create the domain registration
      const { data: registrationData, error: registrationError } = await supabase.functions.invoke('domain-register', {
        body: {
          domain: domain.domain.split('.')[0],
          tld: domain.tld,
          registrationPeriod: 1,
          customerDetails,
          nameservers: ['ns1.404codelab.com', 'ns2.404codelab.com'],
          autoRenew: true
        }
      });

      if (registrationError) throw registrationError;

      // Process payment via Stripe
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('process-payment', {
        body: {
          invoiceId: registrationData.invoice.id
        }
      });

      if (paymentError) throw paymentError;

      return { registration: registrationData, payment: paymentData };
    },
    onSuccess: (data) => {
      toast({
        title: "Domain registration initiated",
        description: "Redirecting to payment...",
      });
      
      // Redirect to Stripe checkout
      if (data.payment?.checkoutUrl) {
        window.location.href = data.payment.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register domain. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handlePurchase = () => {
    if (!domain?.available) {
      toast({
        title: "Domain unavailable",
        description: "This domain is not available for registration.",
        variant: "destructive"
      });
      return;
    }

    // Basic validation
    if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    registerDomainMutation.mutate();
  };

  if (!domain) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Register {domain.domain}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Domain Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {domain.domain}
                  {domain.premium && <Star className="h-4 w-4 text-yellow-500" />}
                </span>
                <Badge variant={domain.available ? "default" : "destructive"}>
                  {domain.available ? "Available" : "Taken"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Domain registration for 1 year
                {domain.premium && " (Premium domain)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total Price:</span>
                <span>£{domain.price.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
              <CardDescription>
                Please provide your contact information for domain registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={customerDetails.firstName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={customerDetails.lastName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  value={customerDetails.company}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+44 123 456 7890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={customerDetails.city}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="London"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={customerDetails.postcode}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, postcode: e.target.value }))}
                    placeholder="SW1A 1AA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={customerDetails.country}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="GB"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Button */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={!domain.available || registerDomainMutation.isPending}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {registerDomainMutation.isPending ? "Processing..." : `Register Domain - £${domain.price.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}