import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import Seo from "@/components/Seo";
import { useNavigate } from "react-router-dom";

export default function CustomerOrders() {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["pending-domain-orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("pending_domain_orders")
        .select(`
          *,
          hosting_packages (
            package_name,
            package_type
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING_REVIEW: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
      PAID: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Seo
        title="My Orders"
        description="View your domain and hosting orders"
      />
      
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Orders</h1>
              <p className="text-muted-foreground">
                Track your domain and hosting orders
              </p>
            </div>
            <Button onClick={() => navigate("/domains")}>
              New Order
            </Button>
          </div>

          {!orders || orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by searching for a domain
                </p>
                <Button onClick={() => navigate("/domains")}>
                  Search Domains
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{order.domain_name}</CardTitle>
                        <CardDescription className="mt-1">
                          {order.hosting_packages
                            ? `with ${order.hosting_packages.package_name} hosting`
                            : "Domain only"}
                        </CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="font-medium">
                            {format(new Date(order.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">
                            {order.years} {order.years === 1 ? "Year" : "Years"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-medium text-lg">
                            £{Number(order.total_estimate).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {order.admin_notes && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-semibold mb-1">Admin Notes:</p>
                        <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
                      </div>
                    )}

                    {order.status === "PENDING_REVIEW" && (
                      <div className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                        ⏳ Your order is pending admin review. We'll notify you once it's approved!
                      </div>
                    )}

                    {order.status === "APPROVED" && (
                      <div className="mt-4 text-sm text-green-600 dark:text-green-400">
                        ✓ Order approved! You'll receive an invoice shortly.
                      </div>
                    )}

                    {order.status === "PAID" && (
                      <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                        ✓ Payment received! Your order is being processed.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
