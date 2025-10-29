import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PageType = 'web_development' | 'game_development' | 'app_development';

export interface TrustSignal {
  value: string;
  label: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

export interface AdsLandingPage {
  id: string;
  page_type: PageType;
  urgency_message: string;
  headline: string;
  subheadline: string;
  meta_title: string;
  meta_description: string;
  cta_text: string;
  cta_subtext: string;
  trust_signals: TrustSignal[];
  testimonials: Testimonial[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAdsLandingPage(pageType: PageType) {
  return useQuery({
    queryKey: ['ads-landing-page', pageType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads_landing_pages')
        .select('*')
        .eq('page_type', pageType)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return {
        ...data,
        trust_signals: data.trust_signals as unknown as TrustSignal[],
        testimonials: data.testimonials as unknown as Testimonial[],
      } as AdsLandingPage;
    },
  });
}

export function useAdsLandingPages() {
  return useQuery({
    queryKey: ['ads-landing-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads_landing_pages')
        .select('*')
        .order('page_type');

      if (error) throw error;
      return data.map(item => ({
        ...item,
        trust_signals: item.trust_signals as unknown as TrustSignal[],
        testimonials: item.testimonials as unknown as Testimonial[],
      })) as AdsLandingPage[];
    },
  });
}

export function useUpdateAdsLandingPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Omit<AdsLandingPage, 'id' | 'created_at' | 'updated_at'>>
    }) => {
      const { data, error } = await supabase
        .from('ads_landing_pages')
        .update({
          ...updates,
          trust_signals: updates.trust_signals as any,
          testimonials: updates.testimonials as any,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ads-landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['ads-landing-page', data.page_type] });
      toast({
        title: 'Success',
        description: 'Landing page updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update landing page: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}
