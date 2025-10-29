import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { StaticNavigation } from "@/components/StaticNavigation";
import Footer from "@/components/Footer";
import { useBlogPost, useBlogPosts, useIncrementViewCount } from "@/hooks/useBlogPosts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import { format } from "date-fns";
import Seo from "@/components/Seo";
import { toast } from "sonner";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug!);
  const { data: allPosts } = useBlogPosts({ status: "published" });
  const incrementView = useIncrementViewCount();

  useEffect(() => {
    if (post?.id) {
      incrementView.mutate(post.id);
    }
  }, [post?.id]);

  const relatedPosts = allPosts
    ?.filter(p => p.id !== post?.id && p.category_id === post?.category_id)
    ?.slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StaticNavigation />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-12 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-40 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StaticNavigation />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || "",
    "image": post.featured_image_url || "",
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Organization",
      "name": "404 Code Lab"
    }
  };

  return (
    <>
      <Seo
        title={post.meta_title || `${post.title} - 404 Code Lab Blog`}
        description={post.meta_description || post.excerpt || ""}
        canonicalUrl={`https://404codelab.com/blog/${post.slug}`}
        jsonLd={jsonLd}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <StaticNavigation />
        
        <main className="flex-1">
          {/* Hero Section */}
          <div className="bg-muted py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
              
              {post.blog_categories && (
                <Badge className="mb-4" style={{ backgroundColor: post.blog_categories.color || undefined }}>
                  {post.blog_categories.icon && <span className="mr-1">{post.blog_categories.icon}</span>}
                  {post.blog_categories.name}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.published_at), "MMMM d, yyyy")}
                  </span>
                )}
                {post.read_time_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.read_time_minutes} min read
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="container mx-auto px-4 max-w-4xl -mt-8 mb-12">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="container mx-auto px-4 max-w-4xl mb-12">
            <Card className="p-8">
              <div 
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </Card>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {post.tags.map((tag) => (
                  <Link key={tag} to={`/blog/tag/${tag}`}>
                    <Badge variant="outline">#{tag}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="bg-muted py-12">
              <div className="container mx-auto px-4 max-w-6xl">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost: any) => (
                    <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {relatedPost.featured_image_url && (
                        <img
                          src={relatedPost.featured_image_url}
                          alt={relatedPost.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <Link to={`/blog/${relatedPost.slug}`}>
                          <h3 className="font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
