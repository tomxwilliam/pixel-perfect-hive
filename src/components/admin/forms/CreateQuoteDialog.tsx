import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  project_id: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  due_date: z.date().optional(),
  valid_until: z.date().optional(),
  description: z.string().optional(),
  quote_number: z.string().min(1, "Quote number is required"),
});

interface CreateQuoteDialogProps {
  onQuoteCreated?: () => void;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Project {
  id: string;
  title: string;
}

export function CreateQuoteDialog({ onQuoteCreated }: CreateQuoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      project_id: "",
      amount: "",
      description: "",
      quote_number: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchCustomersAndProjects();
      generateQuoteNumber();
    }
  }, [open]);

  const fetchCustomersAndProjects = async () => {
    try {
      const [customersResult, projectsResult] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, email").eq("role", "customer"),
        supabase.from("projects").select("id, title"),
      ]);

      if (customersResult.error) throw customersResult.error;
      if (projectsResult.error) throw projectsResult.error;

      setCustomers(customersResult.data || []);
      setProjects(projectsResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load customers and projects");
    }
  };

  const generateQuoteNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const quoteNumber = `QT-${timestamp}`;
    form.setValue("quote_number", quoteNumber);
  };

  const sendQuoteEmail = async (customerEmail: string, customerName: string, quoteData: any) => {
    try {
      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          customer_email: customerEmail,
          customer_name: customerName,
          invoice_number: quoteData.quote_number,
          amount: parseFloat(quoteData.amount),
          due_date: quoteData.valid_until,
          invoiceType: 'quote'
        }
      });

      if (error) throw error;

      toast.success("Quote email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Quote created but failed to send email notification");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const quoteData = {
        customer_id: values.customer_id,
        project_id: values.project_id === "no-project" ? null : values.project_id,
        amount: parseFloat(values.amount),
        due_date: values.due_date?.toISOString().split('T')[0] || null,
        valid_until: values.valid_until?.toISOString().split('T')[0] || null,
        description: values.description || null,
        quote_number: values.quote_number,
      };

      const { error } = await supabase.from("quotes").insert([quoteData]);

      if (error) throw error;

      // Find customer details for email
      const customer = customers.find(c => c.id === values.customer_id);
      if (customer) {
        await sendQuoteEmail(
          customer.email, 
          `${customer.first_name} ${customer.last_name}`,
          quoteData
        );
      }

      toast.success("Quote created successfully!");
      form.reset();
      setOpen(false);
      onQuoteCreated?.();
    } catch (error: any) {
      console.error("Error creating quote:", error);
      toast.error(error.message || "Failed to create quote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quote_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Number</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-project">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid Until (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Quote"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}