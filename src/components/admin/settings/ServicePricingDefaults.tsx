import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, DollarSign, Monitor, Smartphone, Gamepad2, Cog } from 'lucide-react';

interface ServicePricing {
  id: string;
  service_name: string;
  service_type: 'web_development' | 'app_development' | 'game_development' | 'custom';
  default_price: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  hourly_rate: number | null;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServicePricingDefaultsProps {
  isSuperAdmin: boolean;
}

const ServicePricingDefaults: React.FC<ServicePricingDefaultsProps> = ({ isSuperAdmin }) => {
  const [services, setServices] = useState<ServicePricing[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServicePricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    service_type: 'web_development' as ServicePricing['service_type'],
    default_price: '',
    price_range_min: '',
    price_range_max: '',
    hourly_rate: '',
    is_active: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('service_pricing_defaults')
        .select('*')
        .order('service_type', { ascending: true })
        .order('service_name', { ascending: true });

      if (error) throw error;
      setServices(data as ServicePricing[] || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch service pricing",
        variant: "destructive",
      });
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.service_name.trim()) {
      toast({
        title: "Error",
        description: "Service name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        service_name: formData.service_name.trim(),
        service_type: formData.service_type,
        default_price: formData.default_price ? parseFloat(formData.default_price) : null,
        price_range_min: formData.price_range_min ? parseFloat(formData.price_range_min) : null,
        price_range_max: formData.price_range_max ? parseFloat(formData.price_range_max) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        is_active: formData.is_active
      };

      if (editingService) {
        const { error } = await supabase
          .from('service_pricing_defaults')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Service pricing updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('service_pricing_defaults')
          .insert(serviceData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Service pricing created successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service pricing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: ServicePricing) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      service_type: service.service_type,
      default_price: service.default_price?.toString() || '',
      price_range_min: service.price_range_min?.toString() || '',
      price_range_max: service.price_range_max?.toString() || '',
      hourly_rate: service.hourly_rate?.toString() || '',
      is_active: service.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      service_type: 'web_development',
      default_price: '',
      price_range_min: '',
      price_range_max: '',
      hourly_rate: '',
      is_active: true
    });
    setEditingService(null);
  };

  const getServiceTypeIcon = (type: ServicePricing['service_type']) => {
    switch (type) {
      case 'web_development':
        return <Monitor className="h-4 w-4" />;
      case 'app_development':
        return <Smartphone className="h-4 w-4" />;
      case 'game_development':
        return <Gamepad2 className="h-4 w-4" />;
      case 'custom':
        return <Cog className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatServiceType = (type: ServicePricing['service_type']) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `£${price.toFixed(2)}`;
  };

  const formatPriceRange = (min: number | null, max: number | null) => {
    if (min === null && max === null) return 'N/A';
    if (min === null) return `Up to ${formatPrice(max)}`;
    if (max === null) return `From ${formatPrice(min)}`;
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Configure default pricing for different service types. These will auto-fill invoice and quote forms.
        </p>
        {isSuperAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Edit Service Pricing' : 'Add New Service Pricing'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_name">Service Name *</Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                    placeholder="e.g., Basic Website"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type *</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value: ServicePricing['service_type']) => 
                      setFormData(prev => ({ ...prev, service_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web_development">Web Development</SelectItem>
                      <SelectItem value="app_development">App Development</SelectItem>
                      <SelectItem value="game_development">Game Development</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_price">Default Price (£)</Label>
                  <Input
                    id="default_price"
                    type="number"
                    step="0.01"
                    value={formData.default_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_price: e.target.value }))}
                    placeholder="500.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    placeholder="50.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_range_min">Min Price (£)</Label>
                  <Input
                    id="price_range_min"
                    type="number"
                    step="0.01"
                    value={formData.price_range_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_range_min: e.target.value }))}
                    placeholder="300.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_range_max">Max Price (£)</Label>
                  <Input
                    id="price_range_max"
                    type="number"
                    step="0.01"
                    value={formData.price_range_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_range_max: e.target.value }))}
                    placeholder="800.00"
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="col-span-2">
                  <Button onClick={handleCreateOrUpdate} disabled={loading} className="w-full">
                    {editingService ? 'Update Service' : 'Create Service'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Service Pricing Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No service pricing configured
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Default Price</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Status</TableHead>
                  {isSuperAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.service_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getServiceTypeIcon(service.service_type)}
                        {formatServiceType(service.service_type)}
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(service.default_price)}</TableCell>
                    <TableCell>{formatPriceRange(service.price_range_min, service.price_range_max)}</TableCell>
                    <TableCell>{formatPrice(service.hourly_rate)}</TableCell>
                    <TableCell>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicePricingDefaults;