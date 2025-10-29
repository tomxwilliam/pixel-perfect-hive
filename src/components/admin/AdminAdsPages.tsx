import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAdsLandingPages, useUpdateAdsLandingPage, AdsLandingPage, TrustSignal, Testimonial } from '@/hooks/useAdsLandingPages';
import { Loader2, Plus, Trash2, ExternalLink, Star } from 'lucide-react';

export default function AdminAdsPages() {
  const { data: pages, isLoading } = useAdsLandingPages();
  const updatePage = useUpdateAdsLandingPage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ads Landing Pages</h2>
        <p className="text-muted-foreground">
          Manage content for your Google Ads landing pages
        </p>
      </div>

      <Tabs defaultValue="web_development" className="space-y-4">
        <TabsList>
          <TabsTrigger value="web_development">Web Development</TabsTrigger>
          <TabsTrigger value="game_development">Game Development</TabsTrigger>
          <TabsTrigger value="app_development">App Development</TabsTrigger>
        </TabsList>

        {pages?.map((page) => (
          <TabsContent key={page.id} value={page.page_type}>
            <PageEditor page={page} onUpdate={updatePage.mutate} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function PageEditor({ 
  page, 
  onUpdate 
}: { 
  page: AdsLandingPage; 
  onUpdate: (data: { id: string; updates: Partial<AdsLandingPage> }) => void;
}) {
  const [formData, setFormData] = useState(page);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      id: page.id,
      updates: {
        urgency_message: formData.urgency_message,
        headline: formData.headline,
        subheadline: formData.subheadline,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        cta_text: formData.cta_text,
        cta_subtext: formData.cta_subtext,
        trust_signals: formData.trust_signals,
        testimonials: formData.testimonials,
      },
    });
  };

  const addTrustSignal = () => {
    setFormData({
      ...formData,
      trust_signals: [...formData.trust_signals, { value: '', label: '' }],
    });
  };

  const updateTrustSignal = (index: number, field: keyof TrustSignal, value: string) => {
    const newSignals = [...formData.trust_signals];
    newSignals[index] = { ...newSignals[index], [field]: value };
    setFormData({ ...formData, trust_signals: newSignals });
  };

  const removeTrustSignal = (index: number) => {
    setFormData({
      ...formData,
      trust_signals: formData.trust_signals.filter((_, i) => i !== index),
    });
  };

  const addTestimonial = () => {
    setFormData({
      ...formData,
      testimonials: [...formData.testimonials, { quote: '', author: '', role: '', rating: 5 }],
    });
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string | number) => {
    const newTestimonials = [...formData.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setFormData({ ...formData, testimonials: newTestimonials });
  };

  const removeTestimonial = (index: number) => {
    setFormData({
      ...formData,
      testimonials: formData.testimonials.filter((_, i) => i !== index),
    });
  };

  const getPageUrl = () => {
    const typeMap = {
      web_development: 'web-development',
      game_development: 'game-development',
      app_development: 'app-development',
    };
    return `/ads/${typeMap[page.page_type]}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.open(getPageUrl(), '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Preview Page
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>

      {/* SEO Section */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Meta Data</CardTitle>
          <CardDescription>Page title and description for search engines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title">Page Title</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="Professional Web Development Starting at £299 | 404 Code Lab"
            />
            <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              placeholder="Launch your professional website in 2 weeks..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Main headline and urgency message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="urgency_message">Urgency Message</Label>
            <Input
              id="urgency_message"
              value={formData.urgency_message}
              onChange={(e) => setFormData({ ...formData, urgency_message: e.target.value })}
              placeholder="🔥 Book this week and save 10% on your project"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline">Main Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Professional Web Development Starting at £299"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subheadline">Subheadline</Label>
            <Textarea
              id="subheadline"
              value={formData.subheadline}
              onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
              placeholder="Launch Your Website in 2 Weeks - No Hidden Fees, 100% Satisfaction Guaranteed"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trust Signals */}
      <Card>
        <CardHeader>
          <CardTitle>Trust Signals</CardTitle>
          <CardDescription>Metrics displayed below the hero section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.trust_signals.map((signal, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="150+"
                value={signal.value}
                onChange={(e) => updateTrustSignal(index, 'value', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Websites Built"
                value={signal.label}
                onChange={(e) => updateTrustSignal(index, 'label', e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeTrustSignal(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addTrustSignal} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Trust Signal
          </Button>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>Client reviews and feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Label className="text-base">Testimonial {index + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeTestimonial(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Quote</Label>
                  <Textarea
                    value={testimonial.quote}
                    onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                    placeholder="Our new website increased leads by 300%..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Author Name</Label>
                    <Input
                      value={testimonial.author}
                      onChange={(e) => updateTestimonial(index, 'author', e.target.value)}
                      placeholder="Sarah Johnson"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role/Company</Label>
                    <Input
                      value={testimonial.role}
                      onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                      placeholder="CEO, TechStart Inc"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateTestimonial(index, 'rating', star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= testimonial.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={addTestimonial} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card>
        <CardHeader>
          <CardTitle>Call to Action</CardTitle>
          <CardDescription>Button text and supporting message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cta_text">CTA Button Text</Label>
            <Input
              id="cta_text"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              placeholder="Get Your Free Quote Today"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta_subtext">CTA Subtext</Label>
            <Input
              id="cta_subtext"
              value={formData.cta_subtext}
              onChange={(e) => setFormData({ ...formData, cta_subtext: e.target.value })}
              placeholder="No obligation. Receive your custom quote within 24 hours."
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Save All Changes
        </Button>
      </div>
    </form>
  );
}
