import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Archive, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

const HostingPackageManagement = () => {
  const queryClient = useQueryClient();
  const [packageToDelete, setPackageToDelete] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch hosting packages with usage count
  const { data: packages, isLoading } = useQuery({
    queryKey: ['hosting-packages-with-usage'],
    queryFn: async () => {
      const { data: packagesData, error: packagesError } = await supabase
        .from('hosting_packages')
        .select('*')
        .order('monthly_price', { ascending: true });

      if (packagesError) throw packagesError;

      // Get usage count for each package
      const packagesWithUsage = await Promise.all(
        packagesData.map(async (pkg) => {
          const { count } = await supabase
            .from('hosting_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('package_id', pkg.id);
          
          return { ...pkg, usage_count: count || 0 };
        })
      );

      return packagesWithUsage;
    },
  });

  // Delete or archive package mutation
  const deletePackage = useMutation({
    mutationFn: async ({ packageId, forceDelete = false }: { packageId: string, forceDelete?: boolean }) => {
      // Check if package is in use
      const { count } = await supabase
        .from('hosting_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('package_id', packageId);

      if (count && count > 0 && !forceDelete) {
        // Archive instead of delete if in use
        const { error } = await supabase
          .from('hosting_packages')
          .update({ is_active: false })
          .eq('id', packageId);
        
        if (error) throw error;
        return { archived: true, count };
      } else {
        // Safe to delete if not in use or force delete
        const { error } = await supabase
          .from('hosting_packages')
          .delete()
          .eq('id', packageId);
        
        if (error) throw error;
        return { deleted: true };
      }
    },
    onSuccess: (result) => {
      if (result.archived) {
        toast.success(`Package archived (${result.count} active subscriptions). Customers can continue using it but new orders will be disabled.`);
      } else {
        toast.success('Hosting package deleted successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['hosting-packages-with-usage'] });
    },
    onError: (error: any) => {
      console.error('Error managing package:', error);
      if (error.code === '23503') {
        toast.error('Cannot delete package: It has active subscriptions. Use "Archive" instead.');
      } else {
        toast.error(`Failed to manage package: ${error.message}`);
      }
    }
  });

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;

    try {
      // First try to archive (safe approach)
      await deletePackage.mutateAsync({ 
        packageId: packageToDelete.id, 
        forceDelete: false 
      });
    } catch (error) {
      // Handle any errors
      console.error('Package management error:', error);
    } finally {
      setIsDeleteOpen(false);
      setPackageToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hosting Packages</CardTitle>
          <CardDescription>Loading packages...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hosting Package Management</CardTitle>
          <CardDescription>
            Manage hosting packages and their availability. Packages with active subscriptions will be archived instead of deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Active Subscriptions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages?.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">
                    {pkg.package_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {pkg.package_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pkg.disk_space_gb} GB
                  </TableCell>
                  <TableCell>
                    £{Number(pkg.monthly_price).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className={pkg.usage_count > 0 ? "font-medium text-blue-600" : "text-muted-foreground"}>
                        {pkg.usage_count}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? "Active" : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {pkg.usage_count > 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPackageToDelete(pkg);
                            setIsDeleteOpen(true);
                          }}
                          disabled={deletePackage.isPending}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Archive
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setPackageToDelete(pkg);
                            setIsDeleteOpen(true);
                          }}
                          disabled={deletePackage.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title={packageToDelete?.usage_count > 0 ? "Archive hosting package?" : "Delete hosting package?"}
        description={
          packageToDelete?.usage_count > 0 
            ? `This package has ${packageToDelete.usage_count} active subscription(s). It will be archived (hidden from new orders) but existing customers can continue using it.`
            : "This will permanently delete the hosting package. This action cannot be undone."
        }
      />
    </div>
  );
};

export default HostingPackageManagement;