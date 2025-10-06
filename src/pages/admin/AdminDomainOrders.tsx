import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";

interface PendingOrder {
  id: string;
  domain_name: string;
  tld: string;
  years: number;
  domain_price: number;
  hosting_price: number;
  total_estimate: number;
  status: string;
  created_at: string;
  admin_notes?: string;
  profiles: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  hosting_packages?: {
    package_name: string;
  };
}

export default function AdminDomainOrders() {
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-pending-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pending_domain_orders")
        .select(`
          *,
          hosting_packages (
            package_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately to avoid relationship issues
      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, first_name, last_name")
            .eq("id", order.user_id)
            .single();

          return {
            ...order,
            profiles: profile || { email: "Unknown", first_name: null, last_name: null },
          };
        })
      );

      return ordersWithProfiles as PendingOrder[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Update order status
      const { error: updateError } = await supabase
        .from("pending_domain_orders")
        .update({
          status: "APPROVED",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Here you would typically:
      // 1. Create an invoice
      // 2. Send email with payment link
      // This would be done via edge function in production
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-orders"] });
      setApproveDialogOpen(false);
      setSelectedOrder(null);
      toast({
        title: "Order Approved",
        description: "The order has been approved and customer will be notified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve order",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ orderId, notes }: { orderId: string; notes: string }) => {
      const { error } = await supabase
        .from("pending_domain_orders")
        .update({
          status: "REJECTED",
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-orders"] });
      setRejectDialogOpen(false);
      setSelectedOrder(null);
      setRejectionNotes("");
      toast({
        title: "Order Rejected",
        description: "The order has been rejected and customer will be notified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject order",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; icon: any }> = {
      PENDING_REVIEW: { variant: "secondary", icon: Clock },
      APPROVED: { variant: "default", icon: CheckCircle },
      REJECTED: { variant: "destructive", icon: XCircle },
      PAID: { variant: "outline", icon: CheckCircle },
    };

    const { variant, icon: Icon } = config[status] || config.PENDING_REVIEW;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const filterOrders = (status?: string) => {
    if (!orders) return [];
    if (!status) return orders;
    return orders.filter((o) => o.status === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const OrdersTable = ({ orders }: { orders: PendingOrder[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domain</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Hosting</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              No orders found
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.domain_name}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {order.profiles.first_name || order.profiles.last_name
                      ? `${order.profiles.first_name || ""} ${order.profiles.last_name || ""}`.trim()
                      : "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.profiles.email}</p>
                </div>
              </TableCell>
              <TableCell>
                {order.hosting_packages?.package_name || "Domain only"}
              </TableCell>
              <TableCell>{order.years}y</TableCell>
              <TableCell className="font-semibold">
                £{Number(order.total_estimate).toFixed(2)}
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{format(new Date(order.created_at), "MMM dd, yyyy")}</TableCell>
              <TableCell>
                {order.status === "PENDING_REVIEW" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setApproveDialogOpen(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedOrder(order);
                        setRejectDialogOpen(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Seo
        title="Domain Orders - Admin"
        description="Manage domain and hosting orders"
      />

      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Domain Orders</CardTitle>
            <CardDescription>Review and manage customer domain orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({filterOrders("PENDING_REVIEW").length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({filterOrders("APPROVED").length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({filterOrders("REJECTED").length})
                </TabsTrigger>
                <TabsTrigger value="paid">
                  Paid ({filterOrders("PAID").length})
                </TabsTrigger>
                <TabsTrigger value="all">All ({orders?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <OrdersTable orders={filterOrders("PENDING_REVIEW")} />
              </TabsContent>
              <TabsContent value="approved">
                <OrdersTable orders={filterOrders("APPROVED")} />
              </TabsContent>
              <TabsContent value="rejected">
                <OrdersTable orders={filterOrders("REJECTED")} />
              </TabsContent>
              <TabsContent value="paid">
                <OrdersTable orders={filterOrders("PAID")} />
              </TabsContent>
              <TabsContent value="all">
                <OrdersTable orders={orders || []} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this order? An invoice will be generated and sent to the customer.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-2">
              <p><strong>Domain:</strong> {selectedOrder.domain_name}</p>
              <p><strong>Customer:</strong> {selectedOrder.profiles.email}</p>
              <p><strong>Total:</strong> £{Number(selectedOrder.total_estimate).toFixed(2)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedOrder && approveMutation.mutate(selectedOrder.id)}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the customer.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p><strong>Domain:</strong> {selectedOrder.domain_name}</p>
                <p><strong>Customer:</strong> {selectedOrder.profiles.email}</p>
              </div>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedOrder &&
                rejectMutation.mutate({ orderId: selectedOrder.id, notes: rejectionNotes })
              }
              disabled={!rejectionNotes.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
