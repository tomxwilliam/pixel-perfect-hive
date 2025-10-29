import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { SubscriptionPlan } from './useSubscriptionPlans';

export interface CustomerSubscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  next_billing_date: string;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export const useCustomerSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('customer_subscriptions')
          .select(`
            *,
            plan:subscription_plans(*)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSubscriptions(data as CustomerSubscription[] || []);
      } catch (err) {
        console.error('Error fetching customer subscriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  return { subscriptions, loading, error };
};
