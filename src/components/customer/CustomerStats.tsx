
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerStats } from '@/hooks/useCustomerStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  FolderOpen, 
  TicketIcon, 
  CreditCard, 
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';

export const CustomerStats = () => {
  const { stats, loading } = useCustomerStats();
  const isMobile = useIsMobile();

  const statsCards = [
    {
      title: 'Active Projects',
      value: loading ? '...' : stats.activeProjects.toString(),
      description: 'Currently in progress',
      icon: FolderOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Open Tickets',
      value: loading ? '...' : stats.openTickets.toString(),
      description: 'Awaiting response',
      icon: TicketIcon,
      color: 'text-orange-600'
    },
    {
      title: 'Pending Invoices',
      value: loading ? '...' : stats.pendingInvoices.toString(),
      description: 'Outstanding payments',
      icon: CreditCard,
      color: 'text-red-600'
    },
    {
      title: 'Total Spent',
      value: loading ? '...' : `£${stats.totalSpent.toLocaleString()}`,
      description: 'All time',
      icon: TrendingUp,
      color: 'text-green-600'
    }
  ];

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
      {statsCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-between'}`}>
              <div className={isMobile ? 'flex-1' : ''}>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{stat.value}</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
                  {stat.title}
                </p>
                <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-muted/50 ${stat.color} ${isMobile ? 'ml-3' : ''}`}>
                <stat.icon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
