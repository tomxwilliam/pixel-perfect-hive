import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type Game = Tables<'games'>;

export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Game[];
    },
  });
};

export const useFeaturedGame = () => {
  return useQuery({
    queryKey: ['featured-game'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_featured', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      return data as Game | null;
    },
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameData: Partial<Game>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData: any = {
        ...gameData,
        created_by: user?.id || null,
      };
      
      const { data, error } = await supabase
        .from('games')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['featured-game'] });
      toast.success('Game created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create game');
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...gameData }: Partial<Game> & { id: string }) => {
      const { data, error } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['featured-game'] });
      toast.success('Game updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update game');
    },
  });
};

export const useDeleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, get the game to find associated images
      const { data: game } = await supabase
        .from('games')
        .select('logo_url, feature_image_url')
        .eq('id', id)
        .single();

      // Delete associated images from storage
      if (game) {
        const imagesToDelete: string[] = [];
        if (game.logo_url && game.logo_url.includes('game-assets')) {
          const path = game.logo_url.split('/game-assets/')[1];
          if (path) imagesToDelete.push(path);
        }
        if (game.feature_image_url && game.feature_image_url.includes('game-assets')) {
          const path = game.feature_image_url.split('/game-assets/')[1];
          if (path) imagesToDelete.push(path);
        }

        if (imagesToDelete.length > 0) {
          await supabase.storage.from('game-assets').remove(imagesToDelete);
        }
      }

      // Delete the game
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['featured-game'] });
      toast.success('Game deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete game');
    },
  });
};

export const useUploadGameImage = () => {
  return useMutation({
    mutationFn: async ({ file, gameId, type }: { file: File; gameId: string; type: 'logo' | 'feature' }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}/${gameId}-${type}.${fileExt}`;

      // Delete existing image if any
      await supabase.storage.from('game-assets').remove([fileName]);

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('game-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('game-assets')
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
};
