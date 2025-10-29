import { Link, useParams } from "react-router-dom";
import { StaticNavigation } from "@/components/StaticNavigation";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { format } from "date-fns";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";

export default function BlogTag() {
  const { tag } = useParams<{ tag: string }>();
  const { data: posts, isLoading } = useBlogPosts({ 
    status: "published",
    tag: tag 
  });

  if (isLoading) {
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

  return (
    <>
      <Seo
        title={`#${tag} - Blog - 404 Code Lab`}
        description={`Browse articles tagged with #${tag} from 404 Code Lab`}
        canonicalUrl={`https://404codelab.com/blog/tag/${tag}`}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <StaticNavigation />
        
        <main className="flex-1 container mx-auto px-4 py-12">
          <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          <div className="text-center mb-12">
            <Tag className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">#{tag}</h1>
            <Badge className="mt-4">
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
              <p className="text-muted-foreground">No posts found with this tag.</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
