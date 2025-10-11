import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateGame, useUpdateGame, useUploadGameImage, Game } from '@/hooks/useGames';
import { Upload, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['in_concept', 'early_development', 'active_development', 'launched']),
  is_featured: z.boolean(),
  is_new: z.boolean(),
  key_point_1: z.string().optional(),
  key_point_1_icon: z.string().optional(),
  key_point_2: z.string().optional(),
  key_point_2_icon: z.string().optional(),
  key_point_3: z.string().optional(),
  key_point_3_icon: z.string().optional(),
  ios_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  google_play_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

interface CreateEditGameDialogProps {
  game: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateEditGameDialog = ({ game, open, onOpenChange, onSuccess }: CreateEditGameDialogProps) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [featureFile, setFeatureFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [featurePreview, setFeaturePreview] = useState<string | null>(null);
  
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();
  const uploadImage = useUploadGameImage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'in_concept',
      is_featured: false,
      is_new: false,
      key_point_1: '',
      key_point_1_icon: 'Star',
      key_point_2: '',
      key_point_2_icon: 'Zap',
      key_point_3: '',
      key_point_3_icon: 'TrendingUp',
      ios_link: '',
      google_play_link: '',
    },
  });

  useEffect(() => {
    if (game) {
      form.reset({
        name: game.name,
        description: game.description,
        status: game.status as any,
        is_featured: game.is_featured || false,
        is_new: game.is_new || false,
        key_point_1: game.key_point_1 || '',
        key_point_1_icon: game.key_point_1_icon || 'Star',
        key_point_2: game.key_point_2 || '',
        key_point_2_icon: game.key_point_2_icon || 'Zap',
        key_point_3: game.key_point_3 || '',
        key_point_3_icon: game.key_point_3_icon || 'TrendingUp',
        ios_link: game.ios_link || '',
        google_play_link: game.google_play_link || '',
      });
      setLogoPreview(game.logo_url || null);
      setFeaturePreview(game.feature_image_url || null);
    } else {
      form.reset();
      setLogoPreview(null);
      setFeaturePreview(null);
    }
    setLogoFile(null);
    setFeatureFile(null);
  }, [game, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        form.setError('name', { message: 'Logo must be less than 2MB' });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        form.setError('name', { message: 'Feature image must be less than 2MB' });
        return;
      }
      setFeatureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFeaturePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let gameId = game?.id;
      let logoUrl = game?.logo_url || null;
      let featureUrl = game?.feature_image_url || null;

      // Create or update game first
      if (game) {
        await updateGame.mutateAsync({ id: game.id, ...values });
      } else {
        const newGame = await createGame.mutateAsync(values);
        gameId = newGame.id;
      }

      // Upload images if provided
      if (logoFile && gameId) {
        logoUrl = await uploadImage.mutateAsync({ file: logoFile, gameId, type: 'logo' });
        await updateGame.mutateAsync({ id: gameId, logo_url: logoUrl });
      }

      if (featureFile && gameId) {
        featureUrl = await uploadImage.mutateAsync({ file: featureFile, gameId, type: 'feature' });
        await updateGame.mutateAsync({ id: gameId, feature_image_url: featureUrl });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const iconOptions = ['Star', 'Zap', 'TrendingUp', 'Sparkles', 'Trophy', 'Rocket', 'Target', 'Heart', 'Award'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{game ? 'Edit Game' : 'Create New Game'}</DialogTitle>
          <DialogDescription>
            {game ? 'Update game information' : 'Add a new game to your portfolio'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Name</FormLabel>
                    <FormControl>
                      <Input placeholder="BeeVerse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your game..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in_concept">In Concept</SelectItem>
                          <SelectItem value="early_development">Early Development</SelectItem>
                          <SelectItem value="active_development">Active Development</SelectItem>
                          <SelectItem value="launched">Launched</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <FormLabel>Featured</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_new"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <FormLabel>New</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Key Points */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Features</h3>
              
              {[1, 2, 3].map((num) => (
                <div key={num} className="grid grid-cols-[1fr_150px] gap-2">
                  <FormField
                    control={form.control}
                    name={`key_point_${num}` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Point {num}</FormLabel>
                        <FormControl>
                          <Input placeholder={`Feature ${num}`} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`key_point_${num}_icon` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {iconOptions.map((icon) => {
                              const Icon = (LucideIcons as any)[icon];
                              return (
                                <SelectItem key={icon} value={icon}>
                                  <div className="flex items-center gap-2">
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {icon}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Download Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Download Links</h3>
              
              <FormField
                control={form.control}
                name="ios_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>iOS App Store URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://apps.apple.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="google_play_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Play Store URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://play.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Images</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel>Logo Image</FormLabel>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                    {logoPreview ? (
                      <div className="relative">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-32 object-contain" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload logo (max 2MB)</p>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoChange}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <FormLabel>Feature Image</FormLabel>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                    {featurePreview ? (
                      <div className="relative">
                        <img src={featurePreview} alt="Feature preview" className="w-full h-32 object-contain" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0"
                          onClick={() => {
                            setFeatureFile(null);
                            setFeaturePreview(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload screenshot (max 2MB)</p>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFeatureChange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createGame.isPending || updateGame.isPending}>
                {createGame.isPending || updateGame.isPending ? 'Saving...' : game ? 'Update Game' : 'Create Game'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
