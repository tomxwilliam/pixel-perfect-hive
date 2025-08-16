import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Calendar as CalendarIcon, User, DollarSign, Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectTimeLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  taskId?: string;
  onTimeLogged?: () => void;
}

interface TimeLog {
  id: string;
  user_id: string;
  project_id: string;
  task_id?: string;
  work_date: string;
  hours_logged: number;
  hourly_rate?: number;
  total_cost?: number;
  description?: string;
  is_billable: boolean;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  invoice_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
  };
  task?: {
    title: string;
  };
}

interface TeamMember {
  id: string;
  user_id: string;
  project_id: string;
  role: string;
  hourly_rate?: number;
  can_log_time: boolean;
  user?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const ProjectTimeLogModal: React.FC<ProjectTimeLogModalProps> = ({
  open,
  onOpenChange,
  projectId,
  taskId,
  onTimeLogged
}) => {
  const { user } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewLogForm, setShowNewLogForm] = useState(false);
  const [newLog, setNewLog] = useState({
    work_date: new Date(),
    hours_logged: '',
    description: '',
    is_billable: true,
    task_id: taskId || '',
    user_id: user?.id || ''
  });

  const fetchTimeLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('project_time_logs')
        .select(`
          *,
          user:profiles!project_time_logs_user_id_fkey(first_name, last_name),
          task:project_tasks!project_time_logs_task_id_fkey(title)
        `)
        .eq('project_id', projectId)
        .order('work_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTimeLogs(data as any || []);
    } catch (error) {
      console.error('Error fetching time logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch time logs",
        variant: "destructive"
      });
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('project_team_members')
        .select(`
          *,
          user:profiles!project_team_members_user_id_fkey(first_name, last_name)
        `)
        .eq('project_id', projectId)
        .eq('can_log_time', true)
        .is('left_at', null);

      if (error) throw error;
      setTeamMembers(data as any || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  useEffect(() => {
    if (open && projectId) {
      fetchTimeLogs();
      fetchTeamMembers();
    }
  }, [open, projectId]);

  const handleLogTime = async () => {
    if (!newLog.hours_logged || !newLog.work_date) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Get hourly rate for the user
      const selectedMember = teamMembers.find(m => m.user_id === newLog.user_id);
      const hourlyRate = selectedMember?.hourly_rate || 0;
      const hours = parseFloat(newLog.hours_logged);
      const totalCost = newLog.is_billable ? hourlyRate * hours : 0;

      const { error } = await supabase
        .from('project_time_logs')
        .insert({
          project_id: projectId,
          task_id: newLog.task_id || null,
          user_id: newLog.user_id,
          work_date: format(newLog.work_date, 'yyyy-MM-dd'),
          hours_logged: hours,
          hourly_rate: hourlyRate,
          total_cost: totalCost,
          description: newLog.description,
          is_billable: newLog.is_billable,
          is_approved: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time logged successfully",
      });

      setNewLog({
        work_date: new Date(),
        hours_logged: '',
        description: '',
        is_billable: true,
        task_id: taskId || '',
        user_id: user?.id || ''
      });
      setShowNewLogForm(false);
      fetchTimeLogs();
      onTimeLogged?.();
    } catch (error) {
      console.error('Error logging time:', error);
      toast({
        title: "Error",
        description: "Failed to log time",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('project_time_logs')
        .update({
          is_approved: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time log approved",
      });

      fetchTimeLogs();
    } catch (error) {
      console.error('Error approving log:', error);
      toast({
        title: "Error",
        description: "Failed to approve time log",
        variant: "destructive"
      });
    }
  };

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours_logged, 0);
  const totalCost = timeLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
  const billableHours = timeLogs.filter(log => log.is_billable).reduce((sum, log) => sum + log.hours_logged, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Time Tracking</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-lg font-bold">{totalHours.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-lg font-bold">£{totalCost.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Billable Hours</p>
                    <p className="text-lg font-bold">{billableHours.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New Time Log Form */}
          {showNewLogForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Log New Time Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Team Member</Label>
                    <Select value={newLog.user_id} onValueChange={(value) => setNewLog({...newLog, user_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map(member => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {`${member.user?.first_name || ''} ${member.user?.last_name || ''}`.trim()} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Work Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(newLog.work_date, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newLog.work_date}
                          onSelect={(date) => date && setNewLog({...newLog, work_date: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hours Worked</Label>
                    <Input
                      type="number"
                      step="0.25"
                      placeholder="8.5"
                      value={newLog.hours_logged}
                      onChange={(e) => setNewLog({...newLog, hours_logged: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="billable"
                      checked={newLog.is_billable}
                      onCheckedChange={(checked) => setNewLog({...newLog, is_billable: checked})}
                    />
                    <Label htmlFor="billable">Billable Time</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the work performed..."
                    value={newLog.description}
                    onChange={(e) => setNewLog({...newLog, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleLogTime} disabled={loading}>
                    {loading ? 'Logging...' : 'Log Time'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewLogForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setShowNewLogForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log New Time
            </Button>
          )}

          {/* Time Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Time Log History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeLogs.length > 0 ? (
                  timeLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {`${log.user?.first_name || ''} ${log.user?.last_name || ''}`.trim()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.work_date), 'MMM dd, yyyy')}
                          </span>
                          {log.task?.title && (
                            <Badge variant="outline" className="text-xs">
                              {log.task.title}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{log.hours_logged}h</div>
                          {log.is_billable && (
                            <div className="text-sm text-green-600">£{(log.total_cost || 0).toFixed(2)}</div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {log.is_billable && (
                            <Badge variant="secondary" className="text-xs">Billable</Badge>
                          )}
                          {log.is_approved ? (
                            <Badge variant="default" className="text-xs bg-green-600">Approved</Badge>
                          ) : (
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveLog(log.id)}
                                className="h-6 px-2"
                              >
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No time logs found for this project
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};