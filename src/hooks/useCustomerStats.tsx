
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CustomerStats {
  activeProjects: number;
  openTickets: number;
  pendingInvoices: number;
  totalSpent: number;
  upcomingBookings: number;
}

export const useCustomerStats = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<CustomerStats>({
    activeProjects: 0,
    openTickets: 0,
    pendingInvoices: 0,
    totalSpent: 0,
    upcomingBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch project count
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id)
        .in('status', ['in_progress', 'pending']);

      // Fetch ticket count
      const { count: ticketCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id)
        .in('status', ['open', 'in_progress']);

      // Fetch invoice data - admin sees all, customers see their own
      const isAdmin = profile.role === 'admin' || profile.email === 'admin@404codelab.com';
      
      const invoiceQuery = supabase
        .from('invoices')
        .select('amount, status');
      
      if (!isAdmin) {
        invoiceQuery.eq('customer_id', user.id);
      }
      
      const { data: invoices } = await invoiceQuery;

      const pendingInvoiceAmount = invoices
        ?.filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const totalSpent = invoices
        ?.filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

      // Fetch upcoming bookings
      const { count: bookingCount } = await supabase
        .from('call_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .eq('completed', false);

      setStats({
        activeProjects: projectCount || 0,
        openTickets: ticketCount || 0,
        pendingInvoices: pendingInvoiceAmount,
        totalSpent,
        upcomingBookings: bookingCount || 0
      });

    } catch (err) {
      console.error('Error fetching customer stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions
    const projectsChannel = supabase
      .channel('customer-projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects', filter: `customer_id=eq.${user?.id}` },
        () => fetchStats()
      )
      .subscribe();

    const ticketsChannel = supabase
      .channel('customer-tickets-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tickets', filter: `customer_id=eq.${user?.id}` },
        () => fetchStats()
      )
      .subscribe();

    const invoicesChannel = supabase
      .channel('customer-invoices-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, [user?.id, profile?.role]);

  return { stats, loading, error, refetch: fetchStats };
};
