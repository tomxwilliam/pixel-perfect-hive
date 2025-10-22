import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Phone, Mail, DollarSign, Calendar, Activity, TrendingUp, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tables } from '@/integrations/supabase/types';
import { LeadConversion } from './LeadConversion';

type Lead = Tables<'leads'>;
type PipelineStage = Tables<'pipeline_stages'>;
type LeadActivity = Tables<'lead_activities'>;

interface LeadWithStage extends Lead {
  pipeline_stage?: PipelineStage;
  activities?: LeadActivity[];
}

export const CRMPipeline = () => {
  const [leads, setLeads] = useState<LeadWithStage[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [draggedLead, setDraggedLead] = useState<LeadWithStage | null>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<LeadWithStage | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    source: '',
    deal_value: '',
    notes: ''
  });
  
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch pipeline stages
      const { data: stagesData } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('is_active', true)
        .order('stage_order');

      // Fetch leads with stage info
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          pipeline_stage:pipeline_stages(*)
        `)
        .order('created_at', { ascending: false });

      setStages(stagesData || []);
      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error fetching CRM data:', error);
      toast({
        title: "Error",
        description: "Failed to load CRM data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDragStart = (lead: LeadWithStage) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!draggedLead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          pipeline_stage_id: stageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggedLead.id);

      if (error) throw error;

      // Log stage change activity
      await supabase
        .from('lead_activities')
        .insert({
          lead_id: draggedLead.id,
          activity_type: 'stage_change',
          title: 'Stage Changed',
          description: `Moved to ${stages.find(s => s.id === stageId)?.name}`,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
          completed_at: new Date().toISOString()
        });

      toast({
        title: "Success",
        description: "Lead stage updated successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error updating lead stage:', error);
      toast({
        title: "Error",
        description: "Failed to update lead stage",
        variant: "destructive",
      });
    }

    setDraggedLead(null);
  };

  const handleCreateLead = async () => {
    try {
      const { data: firstStage } = await supabase
        .from('pipeline_stages')
        .select('id')
        .eq('is_active', true)
        .order('stage_order')
        .limit(1)
        .single();

      const { error } = await supabase
        .from('leads')
        .insert({
          ...newLead,
          deal_value: parseFloat(newLead.deal_value) || 0,
          pipeline_stage_id: firstStage?.id,
          lead_score: 0
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead created successfully",
      });

      setNewLead({
        name: '',
        email: '',
        company: '',
        phone: '',
        source: '',
        deal_value: '',
        notes: ''
      });
      setShowLeadDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;

    try {
      // First, delete associated activities
      await supabase
        .from('lead_activities')
        .delete()
        .eq('lead_id', leadToDelete.id);

      // Then delete the lead
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });

      setShowDeleteDialog(false);
      setLeadToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  const getStageLeads = (stageId: string) => {
    return leads.filter(lead => lead.pipeline_stage_id === stageId);
  };

  const filteredLeads = selectedStage === 'all' 
    ? leads 
    : leads.filter(lead => lead.pipeline_stage_id === selectedStage);

  const totalValue = leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
  const avgDealSize = leads.length > 0 ? totalValue / leads.length : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse h-64 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Mobile view - show as list
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sales Pipeline</h2>
            <p className="text-muted-foreground">Manage your leads and deals</p>
          </div>
          <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Name"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                />
                <Input
                  placeholder="Company"
                  value={newLead.company}
                  onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                />
                <Input
                  placeholder="Phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                />
                <Input
                  placeholder="Deal Value"
                  type="number"
                  value={newLead.deal_value}
                  onChange={(e) => setNewLead({...newLead, deal_value: e.target.value})}
                />
                <Textarea
                  placeholder="Notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                />
                <Button onClick={handleCreateLead} className="w-full">Create Lead</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-lg font-semibold">£{totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-lg font-semibold">{leads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stage filter */}
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map(stage => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Leads list */}
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <Card key={lead.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{lead.name || lead.email}</h3>
                  <div className="flex items-center gap-2">
                    <Badge 
                      style={{ backgroundColor: lead.pipeline_stage?.color }}
                      className="text-white"
                    >
                      {lead.pipeline_stage?.name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setLeadToDelete(lead);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {lead.company && (
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    {lead.email && <Mail className="h-3 w-3" />}
                    {lead.phone && <Phone className="h-3 w-3" />}
                  </div>
                  {lead.deal_value && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>£{lead.deal_value.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Lead</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the lead "{leadToDelete?.name || leadToDelete?.email}"? 
                This action cannot be undone and will also delete all associated activities.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setLeadToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteLead}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Desktop view - kanban board
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sales Pipeline</h2>
          <p className="text-muted-foreground">Manage your leads and deals</p>
        </div>
        <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                value={newLead.name}
                onChange={(e) => setNewLead({...newLead, name: e.target.value})}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({...newLead, email: e.target.value})}
              />
              <Input
                placeholder="Company"
                value={newLead.company}
                onChange={(e) => setNewLead({...newLead, company: e.target.value})}
              />
              <Input
                placeholder="Phone"
                value={newLead.phone}
                onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
              />
              <Input
                placeholder="Deal Value"
                type="number"
                value={newLead.deal_value}
                onChange={(e) => setNewLead({...newLead, deal_value: e.target.value})}
              />
              <Textarea
                placeholder="Notes"
                value={newLead.notes}
                onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
              />
              <Button onClick={handleCreateLead} className="w-full">Create Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
                <p className="text-2xl font-bold">£{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">£{avgDealSize.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{leads.filter(l => 
                  new Date(l.created_at).getMonth() === new Date().getMonth()
                ).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline columns */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 min-h-[600px]">
        {stages.map(stage => (
          <div
            key={stage.id}
            className="space-y-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${stage.color}20` }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{stage.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {getStageLeads(stage.id).length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
            </div>
            
            <div className="space-y-2">
              {getStageLeads(stage.id).map(lead => (
                <Card
                  key={lead.id}
                  className="p-3 cursor-move hover:shadow-md transition-shadow group"
                  draggable
                  onDragStart={() => handleDragStart(lead)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm flex-1">{lead.name || lead.email}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLeadToDelete(lead);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    {lead.company && (
                      <p className="text-xs text-muted-foreground">{lead.company}</p>
                    )}
                    {lead.deal_value && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-600">
                          £{lead.deal_value.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      {lead.email && <Mail className="h-3 w-3 text-muted-foreground" />}
                      {lead.phone && <Phone className="h-3 w-3 text-muted-foreground" />}
                      <Badge variant="outline" className="text-xs">
                        Score: {lead.lead_score || 0}
                      </Badge>
                     </div>
                     {!lead.converted_to_customer && (
                       <div className="mt-2">
                         <LeadConversion lead={lead} onConversionComplete={fetchData} />
                       </div>
                     )}
                   </div>
                 </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lead "{leadToDelete?.name || leadToDelete?.email}"? 
              This action cannot be undone and will also delete all associated activities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLeadToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};