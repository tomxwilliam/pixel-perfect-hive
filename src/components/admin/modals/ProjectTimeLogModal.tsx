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
  task_id: string | null;
  hours_logged: number;
  description: string;
  work_date: string;
  is_billable: boolean;
  is_approved: boolean;
  hourly_rate: number;
  total_cost: number;
  user: {
    first_name: string;
    last_name: string;
  };
  task: {
    title: string;
  } | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  hourly_rate: number;
  can_log_time: boolean;
  user: {
    first_name: string;
    last_name: string;
  };
}

interface Task {
  id: string;
  title: string;
  status: string;
}

const ProjectTimeLogModal = ({ 
  open, 
  onOpenChange, 
  projectId, 
  taskId, 
  onTimeLogged 
}: ProjectTimeLogModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingLog, setEditingLog] = useState<string | null>(null);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>(taskId || "");
  const [hoursLogged, setHoursLogged] = useState<string>("");
  const [description, setDescription] = useState("");
  const [workDate, setWorkDate] = useState<Date>(new Date());
  const [isBillable, setIsBillable] = useState(true);
  const [hourlyRate, setHourlyRate] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, projectId]);

  const fetchData = async () => {
    await Promise.all([
      fetchTimeLogs(),
      fetchTeamMembers(),
      fetchTasks()
    ]);
  };

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

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('id, title, status')
        .eq('project_id', projectId)
        .in('status', ['todo', 'in_progress', 'review'])
        .order('title');

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !hoursLogged || !workDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const selectedMember = teamMembers.find(m => m.user_id === selectedUserId);
      const rate = hourlyRate ? parseFloat(hourlyRate) : (selectedMember?.hourly_rate || 0);
      const hours = parseFloat(hoursLogged);
      const totalCost = isBillable ? hours * rate : 0;

      const timeLogData = {
        project_id: projectId,
        task_id: selectedTaskId || null,
        user_id: selectedUserId,
        hours_logged: hours,
        hourly_rate: rate,
        total_cost: totalCost,
        description,
        work_date: format(workDate, 'yyyy-MM-dd'),
        is_billable: isBillable
      };

      if (editingLog) {
        const { error } = await supabase
          .from('project_time_logs')
          .update(timeLogData)
          .eq('id', editingLog);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Time log updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('project_time_logs')
          .insert([timeLogData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Time logged successfully"
        });
      }

      resetForm();
      fetchTimeLogs();
      onTimeLogged?.();
    } catch (error) {
      console.error('Error saving time log:', error);
      toast({
        title: "Error",
        description: "Failed to save time log",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('project_time_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Time log deleted successfully"
      });
      
      fetchTimeLogs();
      onTimeLogged?.();
    } catch (error) {
      console.error('Error deleting time log:', error);
      toast({
        title: "Error",
        description: "Failed to delete time log",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (log: TimeLog) => {
    setEditingLog(log.id);
    setSelectedUserId(log.user_id);
    setSelectedTaskId(log.task_id || "");
    setHoursLogged(log.hours_logged.toString());
    setDescription(log.description);
    setWorkDate(new Date(log.work_date));
    setIsBillable(log.is_billable);
    setHourlyRate(log.hourly_rate.toString());
  };

  const resetForm = () => {
    setEditingLog(null);
    setSelectedUserId("");
    setSelectedTaskId(taskId || "");
    setHoursLogged("");
    setDescription("");
    setWorkDate(new Date());
    setIsBillable(true);
    setHourlyRate("");
  };

  const selectedMember = teamMembers.find(m => m.user_id === selectedUserId);
  const calculatedRate = hourlyRate ? parseFloat(hourlyRate) : (selectedMember?.hourly_rate || 0);
  const calculatedCost = isBillable && hoursLogged ? parseFloat(hoursLogged) * calculatedRate : 0;

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours_logged, 0);
  const totalCost = timeLogs.reduce((sum, log) => sum + (log.is_billable ? log.total_cost : 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Project Time Tracking
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Log Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingLog ? 'Edit Time Log' : 'Log Time'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Team Member *</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {member.user.first_name} {member.user.last_name}
                            </span>
                            {member.hourly_rate && (
                              <span className="text-muted-foreground ml-2">
                                £{member.hourly_rate}/hr
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task">Task (Optional)</Label>
                  <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific task</SelectItem>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours Logged *</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="24"
                      value={hoursLogged}
                      onChange={(e) => setHoursLogged(e.target.value)}
                      placeholder="8.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate (£)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder={selectedMember?.hourly_rate?.toString() || "0"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workDate">Work Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !workDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {workDate ? format(workDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={workDate}
                        onSelect={(date) => date && setWorkDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What work was performed?"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="billable"
                      checked={isBillable}
                      onCheckedChange={setIsBillable}
                    />
                    <Label htmlFor="billable">Billable</Label>
                  </div>
                  {hoursLogged && calculatedRate > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Cost: £{calculatedCost.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingLog && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Saving..." : editingLog ? "Update" : "Log Time"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Time Logs List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Recent Time Logs
                <div className="text-sm text-muted-foreground">
                  Total: {totalHours}h | £{totalCost.toFixed(2)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {timeLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">
                            {log.hours_logged}h
                          </Badge>
                          <span className="text-sm font-medium">
                            {log.user.first_name} {log.user.last_name}
                          </span>
                          {log.is_billable && (
                            <Badge variant="outline" className="text-xs">
                              £{log.total_cost.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {format(new Date(log.work_date), 'MMM dd, yyyy')}
                        </p>
                        {log.task && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Task: {log.task.title}
                          </p>
                        )}
                        {log.description && (
                          <p className="text-sm">{log.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {log.is_billable ? (
                            <Badge variant="default" className="text-xs">Billable</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Non-billable</Badge>
                          )}
                          {log.is_approved ? (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(log)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(log.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {timeLogs.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No time logs yet</p>
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

export default ProjectTimeLogModal;