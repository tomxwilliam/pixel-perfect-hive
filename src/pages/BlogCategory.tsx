import { Link, useParams } from "react-router-dom";
import { StaticNavigation } from "@/components/StaticNavigation";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useBlogCategory } from "@/hooks/useBlogCategories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";

export default function BlogCategory() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading } = useBlogCategory(slug!);
  const { data: posts, isLoading: postsLoading } = useBlogPosts({ 
    status: "published",
    categoryId: category?.id 
  });

  if (categoryLoading || postsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StaticNavigation />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-12" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StaticNavigation />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`${category.name} - Blog - 404 Code Lab`}
        description={category.description || `Browse ${category.name} articles from 404 Code Lab`}
        canonicalUrl={`https://404codelab.com/blog/category/${category.slug}`}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <StaticNavigation />
        
        <main className="flex-1 container mx-auto px-4 py-12">
          <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          <div className="text-center mb-12">
            {category.icon && <span className="text-6xl mb-4 block">{category.icon}</span>}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
            <Badge className="mt-4" style={{ backgroundColor: category.color || undefined }}>
              {posts?.length || 0} articles
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts?.map((post: any) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {post.featured_image_url && (
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-6">
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
                        {format(new Date(post.published_at), "MMM d, yyyy")}
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

          {posts?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts in this category yet.</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
