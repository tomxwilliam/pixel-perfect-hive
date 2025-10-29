import { useState } from "react";
import { useAllPageContent, useUpdatePageContent, useCreatePageContent, useDeletePageContent } from "@/hooks/usePageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function AdminPageContent() {
  const { data: pages, isLoading } = useAllPageContent();
  const updatePage = useUpdatePageContent();
  const createPage = useCreatePageContent();
  const deletePage = useDeletePageContent();
  
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const selectedPage = pages?.find(p => p.id === selectedPageId);

  const handleSelectPage = (pageId: string) => {
    const page = pages?.find(p => p.id === pageId);
    if (page) {
      setSelectedPageId(pageId);
      setFormData(page);
      setIsCreating(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedPageId("");
    setFormData({
      page_route: "",
      page_name: "",
      page_type: "main",
      meta_title: "",
      meta_description: "",
      meta_keywords: [],
      og_title: "",
      og_description: "",
      og_image: "",
      twitter_card_type: "summary_large_image",
      no_index: false,
      hero_section: {},
      content_sections: [],
      features: [],
      testimonials: [],
      cta_section: {},
      faq_items: [],
      is_active: true,
    });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        await createPage.mutateAsync(formData);
        setIsCreating(false);
      } else if (selectedPageId) {
        await updatePage.mutateAsync({ id: selectedPageId, ...formData });
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedPageId) return;
    if (confirm("Are you sure you want to delete this page content?")) {
      await deletePage.mutateAsync(selectedPageId);
      setSelectedPageId("");
      setFormData({});
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateJsonField = (field: string, jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      updateField(field, parsed);
    } catch (e) {
      // Invalid JSON, keep as string
      updateField(field, jsonString);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pagesByType = pages?.reduce((acc, page) => {
    if (!acc[page.page_type]) acc[page.page_type] = [];
    acc[page.page_type].push(page);
    return acc;
  }, {} as Record<string, typeof pages>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Page Content Manager</h2>
          <p className="text-muted-foreground">Manage content and SEO for all website pages</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Page Selector Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Pages</CardTitle>
            <CardDescription>{pages?.length || 0} total pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(pagesByType || {}).map(([type, typePages]) => (
              <div key={type}>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">{type}</h4>
                <div className="space-y-1 mb-3">
                  {typePages.map((page) => (
                    <Button
                      key={page.id}
                      variant={selectedPageId === page.id ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => handleSelectPage(page.id)}
                    >
                      <div className="flex-1 truncate">{page.page_name}</div>
                      {!page.is_active && <Badge variant="outline" className="ml-2">Inactive</Badge>}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Editor Panel */}
        <div className="md:col-span-3">
          {(selectedPage || isCreating) ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{isCreating ? "Create New Page" : formData.page_name}</CardTitle>
                    <CardDescription>{formData.page_route}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isCreating && formData.page_route && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={formData.page_route} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Preview
                        </a>
                      </Button>
                    )}
                    <Button onClick={handleSave} disabled={updatePage.isPending || createPage.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    {!isCreating && (
                      <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  {/* Basic Tab */}
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="page_name">Page Name</Label>
                        <Input
                          id="page_name"
                          value={formData.page_name || ""}
                          onChange={(e) => updateField("page_name", e.target.value)}
                          placeholder="Home, About, Contact..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="page_route">Page Route</Label>
                        <Input
                          id="page_route"
                          value={formData.page_route || ""}
                          onChange={(e) => updateField("page_route", e.target.value)}
                          placeholder="/, /about, /contact..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="page_type">Page Type</Label>
                        <Select
                          value={formData.page_type || "main"}
                          onValueChange={(value) => updateField("page_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Main</SelectItem>
                            <SelectItem value="portfolio">Portfolio</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="ads">Ads Landing</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                            <SelectItem value="blog">Blog</SelectItem>
                            <SelectItem value="dashboard">Dashboard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 flex items-center gap-2 pt-8">
                        <Switch
                          id="is_active"
                          checked={formData.is_active || false}
                          onCheckedChange={(checked) => updateField("is_active", checked)}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                  </TabsContent>

                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input
                        id="meta_title"
                        value={formData.meta_title || ""}
                        onChange={(e) => updateField("meta_title", e.target.value)}
                        placeholder="Page Title - 404 Code Lab"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={formData.meta_description || ""}
                        onChange={(e) => updateField("meta_description", e.target.value)}
                        placeholder="Brief description for search engines (150-160 characters)"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="canonical_url">Canonical URL</Label>
                      <Input
                        id="canonical_url"
                        value={formData.canonical_url || ""}
                        onChange={(e) => updateField("canonical_url", e.target.value)}
                        placeholder="https://404codelab.com/page"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="og_title">Open Graph Title</Label>
                      <Input
                        id="og_title"
                        value={formData.og_title || ""}
                        onChange={(e) => updateField("og_title", e.target.value)}
                        placeholder="Title for social media sharing"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="og_description">Open Graph Description</Label>
                      <Textarea
                        id="og_description"
                        value={formData.og_description || ""}
                        onChange={(e) => updateField("og_description", e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="og_image">Open Graph Image URL</Label>
                      <Input
                        id="og_image"
                        value={formData.og_image || ""}
                        onChange={(e) => updateField("og_image", e.target.value)}
                        placeholder="https://404codelab.com/images/og-image.jpg"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="no_index"
                        checked={formData.no_index || false}
                        onCheckedChange={(checked) => updateField("no_index", checked)}
                      />
                      <Label htmlFor="no_index">No Index (Hide from search engines)</Label>
                    </div>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero_section">Hero Section (JSON)</Label>
                      <Textarea
                        id="hero_section"
                        value={JSON.stringify(formData.hero_section, null, 2) || "{}"}
                        onChange={(e) => updateJsonField("hero_section", e.target.value)}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="features">Features (JSON Array)</Label>
                      <Textarea
                        id="features"
                        value={JSON.stringify(formData.features, null, 2) || "[]"}
                        onChange={(e) => updateJsonField("features", e.target.value)}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta_section">CTA Section (JSON)</Label>
                      <Textarea
                        id="cta_section"
                        value={JSON.stringify(formData.cta_section, null, 2) || "{}"}
                        onChange={(e) => updateJsonField("cta_section", e.target.value)}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom_css">Custom CSS</Label>
                      <Textarea
                        id="custom_css"
                        value={formData.custom_css || ""}
                        onChange={(e) => updateField("custom_css", e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                        placeholder="/* Custom CSS for this page */"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom_scripts">Custom Scripts</Label>
                      <Textarea
                        id="custom_scripts"
                        value={formData.custom_scripts || ""}
                        onChange={(e) => updateField("custom_scripts", e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                        placeholder="// Custom JavaScript for this page"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <p className="text-muted-foreground">Select a page to edit or create a new one</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
