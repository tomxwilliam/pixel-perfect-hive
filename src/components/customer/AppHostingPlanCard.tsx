import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AppHostingPlanCardProps {
  title: string;
  description: string;
  price: string;
  priceLabel: string;
  features: string[];
  note?: string;
  buttonText: string;
  priceId: string;
  isRecurring: boolean;
}

export const AppHostingPlanCard = ({
  title,
  description,
  price,
  priceLabel,
  features,
  note,
  buttonText,
  priceId,
  isRecurring,
}: AppHostingPlanCardProps) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      const functionName = isRecurring ? 'create-subscription' : 'create-payment';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { priceId },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout unavailable",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative rounded-2xl border-2 hover:border-primary/50 transition-colors">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
        
        {note && (
          <p className="text-xs text-muted-foreground border-t pt-3">
            {note}
          </p>
        )}
        
        <div className="pt-4 border-t">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-foreground">{price}</span>
            <span className="text-sm text-muted-foreground">{priceLabel}</span>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleCheckout}
            disabled={loading}
            aria-label={`${buttonText} - ${priceLabel}`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening checkout...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
