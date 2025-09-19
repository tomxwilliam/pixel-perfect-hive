import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Apple, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppStoreLink {
  id: string;
  game_name: string;
  ios_link: string;
  google_play_link: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AdminAppStoreLinks = () => {
  const [links, setLinks] = useState<AppStoreLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<AppStoreLink | null>(null);
  const [formData, setFormData] = useState({
    game_name: "",
    ios_link: "",
    google_play_link: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAppStoreLinks();
  }, []);

  const fetchAppStoreLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("app_store_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching app store links:", error);
      toast({
        title: "Error",
        description: "Failed to fetch app store links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      game_name: "",
      ios_link: "",
      google_play_link: "",
      is_active: true,
    });
    setEditingLink(null);
  };

  const openDialog = (link?: AppStoreLink) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        game_name: link.game_name,
        ios_link: link.ios_link || "",
        google_play_link: link.google_play_link || "",
        is_active: link.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLink) {
        const { error } = await supabase
          .from("app_store_links")
          .update(formData)
          .eq("id", editingLink.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "App store link updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("app_store_links")
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "App store link created successfully",
        });
      }

      fetchAppStoreLinks();
      closeDialog();
    } catch (error) {
      console.error("Error saving app store link:", error);
      toast({
        title: "Error",
        description: "Failed to save app store link",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("app_store_links")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "App store link deleted successfully",
      });
      
      fetchAppStoreLinks();
    } catch (error) {
      console.error("Error deleting app store link:", error);
      toast({
        title: "Error",
        description: "Failed to delete app store link",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("app_store_links")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "App store link status updated",
      });
      
      fetchAppStoreLinks();
    } catch (error) {
      console.error("Error updating app store link:", error);
      toast({
        title: "Error",
        description: "Failed to update app store link",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading app store links...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">App Store Links</h2>
          <p className="text-muted-foreground">
            Manage download links for your mobile games
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Game
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingLink ? "Edit Game Links" : "Add Game Links"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="game_name">Game Name</Label>
                <Input
                  id="game_name"
                  value={formData.game_name}
                  onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
                  placeholder="Enter game name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="ios_link">iOS App Store Link</Label>
                <Input
                  id="ios_link"
                  value={formData.ios_link}
                  onChange={(e) => setFormData({ ...formData, ios_link: e.target.value })}
                  placeholder="https://apps.apple.com/..."
                  type="url"
                />
              </div>
              
              <div>
                <Label htmlFor="google_play_link">Google Play Store Link</Label>
                <Input
                  id="google_play_link"
                  value={formData.google_play_link}
                  onChange={(e) => setFormData({ ...formData, google_play_link: e.target.value })}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  type="url"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingLink ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {links.map((link) => (
          <Card key={link.id} className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{link.game_name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={link.is_active ? "default" : "secondary"}>
                    {link.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={link.is_active}
                    onCheckedChange={() => toggleActive(link.id, link.is_active)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Apple className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">iOS App Store</Label>
                    <div className="text-sm text-muted-foreground truncate">
                      {link.ios_link || "No link set"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Google Play Store</Label>
                    <div className="text-sm text-muted-foreground truncate">
                      {link.google_play_link || "No link set"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog(link)}
                >
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Game Links</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the app store links for "{link.game_name}"? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(link.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {links.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Games Added</h3>
              <p className="text-muted-foreground mb-4">
                Add your first game to manage app store download links.
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};