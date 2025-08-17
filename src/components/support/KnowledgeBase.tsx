import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, FileText, ThumbsUp, ThumbsDown, Eye, 
  Plus, Edit, Trash2, BookOpen, Tag, Clock
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Article = Tables<'knowledge_base_articles'>;
type Category = Tables<'ticket_categories'>;

interface ArticleWithCategory extends Article {
  category?: Category | null;
}

export const KnowledgeBase = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [articles, setArticles] = useState<ArticleWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithCategory | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch articles
      let query = supabase
        .from('knowledge_base_articles')
        .select(`
          *,
          category:ticket_categories(*)
        `)
        .order('view_count', { ascending: false });

      // Only show published articles for non-admins
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }

      const { data: articlesData, error: articlesError } = await query;

      if (articlesError) throw articlesError;
      setArticles((articlesData as any) || []);

    } catch (error) {
      console.error('Error fetching knowledge base data:', error);
      toast.error('Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (article: ArticleWithCategory) => {
    setSelectedArticle(article);
    
    // Increment view count
    try {
      await supabase
        .from('knowledge_base_articles')
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq('id', article.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleHelpfulVote = async (articleId: string, isHelpful: boolean) => {
    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      const updates = isHelpful 
        ? { helpful_count: (article.helpful_count || 0) + 1 }
        : { not_helpful_count: (article.not_helpful_count || 0) + 1 };

      await supabase
        .from('knowledge_base_articles')
        .update(updates)
        .eq('id', articleId);

      toast.success('Thank you for your feedback!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = categoryFilter === 'all' || article.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-muted"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedArticle(null)}
          className="mb-6"
        >
          ← Back to Knowledge Base
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {selectedArticle.view_count || 0} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(selectedArticle.updated_at).toLocaleDateString()}
                  </div>
                  {selectedArticle.category && (
                    <Badge variant="outline" style={{ borderColor: selectedArticle.category.color }}>
                      {selectedArticle.category.name}
                    </Badge>
                  )}
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {!selectedArticle.is_published && (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br />') }} />
            </div>

            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Was this article helpful?</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHelpfulVote(selectedArticle.id, true)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Yes ({selectedArticle.helpful_count || 0})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHelpfulVote(selectedArticle.id, false)}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  No ({selectedArticle.not_helpful_count || 0})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Knowledge Base
          </h2>
          <p className="text-muted-foreground">
            Find answers to frequently asked questions and guides
          </p>
        </div>
        {isAdmin && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles, topics, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No articles available yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card 
              key={article.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleArticleClick(article)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {article.title}
                  </CardTitle>
                  {isAdmin && !article.is_published && (
                    <Badge variant="secondary" className="shrink-0">
                      Draft
                    </Badge>
                  )}
                </div>
                {article.category && (
                  <Badge variant="outline" style={{ borderColor: article.category.color }} className="w-fit">
                    {article.category.name}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.view_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {article.helpful_count || 0}
                    </div>
                  </div>
                  <div>
                    {new Date(article.updated_at).toLocaleDateString()}
                  </div>
                </div>

                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{article.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Popular Articles Section */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Articles</CardTitle>
          <CardDescription>The most viewed and helpful articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {articles
              .filter(a => a.is_published)
              .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
              .slice(0, 5)
              .map((article, index) => (
                <div 
                  key={article.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{article.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{article.view_count || 0} views</span>
                      <span>{article.helpful_count || 0} helpful votes</span>
                    </div>
                  </div>
                  {article.category && (
                    <Badge variant="outline" style={{ borderColor: article.category.color }}>
                      {article.category.name}
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};