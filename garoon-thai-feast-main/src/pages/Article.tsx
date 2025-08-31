import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  content: string;
  category?: string;
  featured_image?: string;
  status: "draft" | "published" | "scheduled";
  published_at?: string;
  created_at: string;
  updated_at: string;
}

const Article = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchArticle(id);
      fetchRelatedArticles(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: "Error",
        description: "Article not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (currentId: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .neq('id', currentId)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRelatedArticles(data || []);
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thai-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
            <Button variant="hero" asChild>
              <Link to="/news">Back to News</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Button variant="elegant" size="sm" asChild className="mb-8">
            <Link to="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
          </Button>
          
          {/* Hero Image */}
          <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
            <img 
              src={article.featured_image || "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=600&fit=crop"} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-thai-charcoal/30"></div>
          </div>

          {/* Article Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-4">
              {article.category && (
                <Badge variant="default" className="bg-thai-gold text-thai-charcoal">
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </Badge>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(article.published_at || article.created_at)}
              </div>
            </div>
            
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              {article.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              Published on {formatDate(article.published_at || article.created_at)}
            </p>

            <Button variant="elegant" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>

          {/* Article Content */}
          <div className="max-w-4xl mx-auto prose prose-lg max-w-none ml-8">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-thai-gold/20">
            <div className="flex justify-between items-center">
              <Button variant="elegant" asChild>
                <Link to="/news">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  All Articles
                </Link>
              </Button>
              
              <Button variant="hero" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="max-w-6xl mx-auto mt-16">
              <h2 className="font-playfair text-3xl font-bold text-foreground mb-8 text-center">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <div key={relatedArticle.id} className="group">
                    <Link to={`/news/${relatedArticle.id}`}>
                      <div className="bg-card rounded-lg overflow-hidden border border-thai-gold/20 card-elegant">
                        <img 
                          src={relatedArticle.featured_image || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop"} 
                          alt={relatedArticle.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="p-6">
                          {relatedArticle.category && (
                            <Badge variant="outline" className="mb-3">
                              {relatedArticle.category.charAt(0).toUpperCase() + relatedArticle.category.slice(1)}
                            </Badge>
                          )}
                          <h3 className="font-playfair text-lg font-semibold text-foreground group-hover:text-thai-gold transition-colors mb-2">
                            {relatedArticle.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3">
                            {relatedArticle.content.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(relatedArticle.published_at || relatedArticle.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Article;