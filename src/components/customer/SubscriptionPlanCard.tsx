import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import type { SubscriptionPlan } from "@/hooks/useSubscriptionPlans";
import { toast } from "sonner";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
}

export const SubscriptionPlanCard = ({ plan }: SubscriptionPlanCardProps) => {
  const isPopular = plan.display_order === 2; // Middle tier is usually most popular

  const handleSubscribe = () => {
    // TODO: Implement subscription flow with Stripe or manual approval
    toast.info("Subscription request", {
      description: "Please contact us to set up your subscription. We'll reach out shortly!"
    });
  };

  return (
    <Card className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground gap-1 px-4 py-1">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="space-y-2">
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
          <div className="pt-2">
            <span className="text-4xl font-bold text-foreground">
              £{plan.price_monthly}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Includes:</p>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-ok shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {plan.add_ons && plan.add_ons.length > 0 && (
          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Optional Add-Ons:</p>
            <ul className="space-y-2">
              {plan.add_ons.slice(0, 3).map((addon, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground">• {addon}</span>
                </li>
              ))}
              {plan.add_ons.length > 3 && (
                <li className="text-xs text-muted-foreground italic">
                  + {plan.add_ons.length - 3} more available
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          variant={isPopular ? "default" : "outline"}
          onClick={handleSubscribe}
        >
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
};
