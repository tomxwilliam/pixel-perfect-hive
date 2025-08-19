import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Users, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface Resource {
  id: string;
  name: string;
  type: 'human' | 'equipment' | 'software' | 'material';
  hourlyRate?: number;
  availability: number; // percentage
  skills?: string[];
  currentProjects: number;
  totalCapacity: number;
  utilizationRate: number;
  cost: number;
  status: 'available' | 'busy' | 'unavailable';
}

interface ResourceAllocation {
  id: string;
  resourceId: string;
  projectId: string;
  projectName: string;
  allocatedHours: number;
  startDate: Date;
  endDate: Date;
  role: string;
  billableRate: number;
}

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      name: 'John Doe',
      type: 'human',
      hourlyRate: 75,
      availability: 85,
      skills: ['React', 'Node.js', 'TypeScript'],
      currentProjects: 2,
      totalCapacity: 40,
      utilizationRate: 85,
      cost: 3000,
      status: 'busy'
    },
    {
      id: '2',
      name: 'Jane Smith',
      type: 'human',
      hourlyRate: 80,
      availability: 90,
      skills: ['UI/UX', 'Figma', 'React'],
      currentProjects: 1,
      totalCapacity: 40,
      utilizationRate: 70,
      cost: 3200,
      status: 'available'
    },
    {
      id: '3',
      name: 'Development Server',
      type: 'equipment',
      hourlyRate: 5,
      availability: 100,
      currentProjects: 5,
      totalCapacity: 24,
      utilizationRate: 95,
      cost: 120,
      status: 'available'
    }
  ]);

  const [allocations, setAllocations] = useState<ResourceAllocation[]>([
    {
      id: '1',
      resourceId: '1',
      projectId: 'proj1',
      projectName: 'E-commerce Website',
      allocatedHours: 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      role: 'Lead Developer',
      billableRate: 75
    }
  ]);

  const [newResource, setNewResource] = useState<Partial<Resource>>({
    type: 'human',
    status: 'available'
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateResource = () => {
    if (!newResource.name) return;

    const resource: Resource = {
      id: Date.now().toString(),
      name: newResource.name,
      type: newResource.type || 'human',
      hourlyRate: newResource.hourlyRate || 0,
      availability: newResource.availability || 100,
      skills: newResource.skills || [],
      currentProjects: 0,
      totalCapacity: newResource.totalCapacity || 40,
      utilizationRate: 0,
      cost: 0,
      status: newResource.status || 'available'
    };

    setResources(prev => [...prev, resource]);
    setNewResource({ type: 'human', status: 'available' });
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate <= 60) return 'text-green-600';
    if (rate <= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resource Management</h2>
          <p className="text-muted-foreground">
            Manage team members, equipment, and resource allocations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Resource Name</Label>
                <Input
                  id="name"
                  value={newResource.name || ''}
                  onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter resource name"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newResource.type} onValueChange={(value) => setNewResource(prev => ({ ...prev, type: value as Resource['type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human">Human Resource</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={newResource.hourlyRate || ''}
                  onChange={(e) => setNewResource(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Total Capacity (hours/week)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newResource.totalCapacity || ''}
                  onChange={(e) => setNewResource(prev => ({ ...prev, totalCapacity: parseFloat(e.target.value) }))}
                  placeholder="40"
                />
              </div>
              <Button onClick={handleCreateResource} className="w-full">
                Create Resource
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resource Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{resources.filter(r => r.status === 'available').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
                <p className="text-2xl font-bold">
                  {Math.round(resources.reduce((acc, r) => acc + r.utilizationRate, 0) / resources.length)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">
                  £{resources.reduce((acc, r) => acc + r.cost, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource List */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(resource.status)}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{resource.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>£{resource.hourlyRate}/hr</span>
                      <span>{resource.currentProjects} projects</span>
                      {resource.skills && resource.skills.length > 0 && (
                        <div className="flex gap-1">
                          {resource.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {resource.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{resource.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getUtilizationColor(resource.utilizationRate)}`}>
                      {resource.utilizationRate}% Utilized
                    </p>
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          resource.utilizationRate <= 60 ? 'bg-green-500' :
                          resource.utilizationRate <= 85 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(resource.utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Current Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allocations.map((allocation) => {
              const resource = resources.find(r => r.id === allocation.resourceId);
              return (
                <div key={allocation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{resource?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {allocation.projectName} • {allocation.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{allocation.allocatedHours}h allocated</p>
                    <p className="text-xs text-muted-foreground">
                      {format(allocation.startDate, 'MMM dd')} - {format(allocation.endDate, 'MMM dd')}
                    </p>
                  </div>
                </div>
              );
            })}
            {allocations.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No current allocations
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceManagement;