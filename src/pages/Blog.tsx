import { useState } from "react";
import { Link } from "react-router-dom";
import { StaticNavigation } from "@/components/StaticNavigation";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import Seo from "@/components/Seo";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: posts, isLoading } = useBlogPosts({ 
    status: "published",
    categoryId: selectedCategory 
  });
  const { data: categories } = useBlogCategories();

  const filteredPosts = posts?.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredPost = posts?.[0];

  return (
    <>
      <Seo
        title="Blog - 404 Code Lab"
        description="Read the latest articles about web development, app development, game development, and AI integration from 404 Code Lab."
        canonicalUrl="https://404codelab.com/blog"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <StaticNavigation />
        
        <main className="flex-1 container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights, tutorials, and updates from the world of digital development
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Featured Post */}
          {featuredPost && !searchQuery && !selectedCategory && (
            <Card className="mb-12 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6">
                {featuredPost.featured_image_url && (
                  <img
                    src={featuredPost.featured_image_url}
                    alt={featuredPost.title}
                    className="w-full h-80 object-cover"
                  />
                )}
                <div className="p-6 flex flex-col justify-center">
                  <Badge className="w-fit mb-2">Featured</Badge>
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <h2 className="text-3xl font-bold mb-3 hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                  </Link>
                  <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredPost.published_at && format(new Date(featuredPost.published_at), "MMM d, yyyy")}
                    </span>
                    {featuredPost.read_time_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredPost.read_time_minutes} min read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Category Tabs */}
          <Tabs defaultValue="all" className="mb-8" onValueChange={(value) => setSelectedCategory(value === "all" ? undefined : value)}>
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              {categories?.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.icon && <span className="mr-1">{category.icon}</span>}
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts?.map((post: any) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featured_image_url && (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardContent className="p-6">
                    {post.blog_categories && (
                      <Badge className="mb-2" style={{ backgroundColor: post.blog_categories.color || undefined }}>
                        {post.blog_categories.icon && <span className="mr-1">{post.blog_categories.icon}</span>}
                        {post.blog_categories.name}
                      </Badge>
                    )}
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.published_at), "MMM d")}
                        </span>
                      )}
                      {post.read_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.read_time_minutes} min
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredPosts?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found matching your search.</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
