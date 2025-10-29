import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard } from "lucide-react";
import type { CustomerSubscription } from "@/hooks/useCustomerSubscriptions";
import { format } from "date-fns";

interface ActiveSubscriptionCardProps {
  subscription: CustomerSubscription;
}

export const ActiveSubscriptionCard = ({ subscription }: ActiveSubscriptionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-ok text-white';
      case 'paused':
        return 'bg-warn text-white';
      case 'cancelled':
      case 'expired':
        return 'bg-danger text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{subscription.plan?.name || 'Subscription'}</CardTitle>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground">
          {subscription.plan?.description}
        </p>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              £{subscription.plan?.price_monthly} / {subscription.billing_cycle}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              Next billing: {format(new Date(subscription.next_billing_date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          Manage
        </Button>
      </CardFooter>
    </Card>
  );
};
