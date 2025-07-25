import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateQuoteDialog } from "./forms/CreateQuoteDialog";
import { QuoteManagementModal } from "./modals/QuoteManagementModal";
import { Search, Filter, DollarSign, FileText, Clock } from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  project_id: string | null;
  amount: number;
  status: string;
  due_date: string | null;
  valid_until: string | null;
  description: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string | null;
}

interface Project {
  id: string;
  title: string;
}

interface QuoteWithCustomer extends Quote {
  customer: Profile;
  project: Project | null;
}

export function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithCustomer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          customer:profiles(id, first_name, last_name, email, company_name),
          project:projects(id, title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes((data as any) || []);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch = 
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalValue = quotes.reduce((sum, quote) => sum + quote.amount, 0);
  const pendingQuotes = quotes.filter(q => q.status === "pending").length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading quotes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Quotes Management</h2>
        <CreateQuoteDialog onQuoteCreated={fetchQuotes} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quote Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingQuotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quotes Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.quote_number}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {quote.customer?.first_name} {quote.customer?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{quote.customer?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {quote.project?.title || "No Project"}
                </TableCell>
                <TableCell>${quote.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {quote.valid_until 
                    ? new Date(quote.valid_until).toLocaleDateString()
                    : "No expiry"
                  }
                </TableCell>
                <TableCell>
                  {new Date(quote.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedQuote(quote);
                        setIsModalOpen(true);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {selectedQuote && (
        <QuoteManagementModal
          quote={selectedQuote}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onQuoteUpdated={fetchQuotes}
        />
      )}
    </div>
  );
}