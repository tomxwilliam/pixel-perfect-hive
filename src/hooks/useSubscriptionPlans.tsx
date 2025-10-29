import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  category: 'it_support' | 'website_care';
  price_monthly: number;
  features: string[];
  add_ons: string[] | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  stripe_product_id?: string | null;
  stripe_price_id_monthly?: string | null;
}

export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('category')
          .order('display_order');

        if (error) throw error;

        setPlans(data as SubscriptionPlan[] || []);
      } catch (err) {
        console.error('Error fetching subscription plans:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return { plans, loading, error };
};
