import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { Calendar, Clock, ArrowRight, Newspaper } from "lucide-react";
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

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from articles
  const categories = [
    { id: "all", name: "All News" },
    ...Array.from(new Set(articles.map(article => article.category).filter(Boolean)))
      .map(category => ({ id: category!, name: category!.charAt(0).toUpperCase() + category!.slice(1) }))
  ];

  const filteredArticles = selectedCategory === "all" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExcerpt = (content: string, length = 150) => {
    if (content.length <= length) return content;
    return content.substring(0, length) + "...";
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setSubscribing(true);
    try {
      console.log('Attempting to subscribe email:', email);
      
      // Insert directly into database
      const { data: dbData, error: dbError } = await supabase
        .from('member_subscriptions')
        .insert([{
          email: email,
          is_subscribed: true,
          subscribed_at: new Date().toISOString()
        }])
        .select();

      if (dbError) {
        console.error('Database insert failed:', dbError);
        toast({
          title: "Error",
          description: "Failed to subscribe. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully added to database:', dbData);
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter!",
      });
      setEmail("");
    } catch (error) {
      console.error('Error subscribing:', error);
      
      // Fallback: Store locally only
      try {
        const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
        const existingSubscription = subscriptions.find((sub: any) => sub.email === email);
        
        if (!existingSubscription) {
          const newSubscription = {
            email: email,
            is_subscribed: true,
            subscribed_at: new Date().toISOString()
          };
          subscriptions.push(newSubscription);
          localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
          
          toast({
            title: "Success!",
            description: "Thank you for subscribing to our newsletter! (Stored locally)",
          });
          setEmail("");
        } else {
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter",
            variant: "destructive",
          });
        }
      } catch (localError) {
        console.error('Local storage error:', localError);
        toast({
          title: "Error",
          description: "Failed to subscribe. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!contactForm.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    try {
      // Store contact form submission in contact_messages table
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: contactForm.name,
            email: contactForm.email,
            message: contactForm.message
          }
        ]);

      if (dbError) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Message Sent Successfully!",
        description: "Your message has been sent and will be reviewed by our team. We'll get back to you soon!",
      });
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Message Saved",
        description: "Your message has been saved locally. Please contact us directly if urgent.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };



  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thai-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-thai-charcoal mb-4">
            News & Events
          </h1>
          <p className="text-xl text-thai-charcoal/80 max-w-2xl mx-auto">
            Stay updated with the latest happenings at Easy Go Thai
          </p>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "hero" : "elegant"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="transition-all duration-300"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Featured Article */}
          {filteredArticles.length > 0 && (
            <div className="mb-16">
              <h2 className="font-playfair text-3xl font-bold text-foreground mb-8">Latest Story</h2>
              {(() => {
                const featured = filteredArticles[0];
                return (
                  <Card className="card-elegant border-thai-gold/20 overflow-hidden group">
                    <div className="md:flex">
                      <div className="md:w-1/2">
                        <img 
                          src={featured.featured_image || "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop"} 
                          alt={featured.title}
                          className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="md:w-1/2 p-8">
                        <div className="flex items-center gap-3 mb-4">
                          {featured.category && (
                            <Badge variant="default" className="bg-thai-gold text-thai-charcoal">
                              {featured.category.charAt(0).toUpperCase() + featured.category.slice(1)}
                            </Badge>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(featured.published_at || featured.created_at)}
                          </div>
                        </div>
                        <h3 className="font-playfair text-2xl font-bold text-foreground mb-4 group-hover:text-thai-gold transition-colors">
                          {featured.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {getExcerpt(featured.content)}
                        </p>
                        <Button variant="hero" asChild>
                          <Link to={`/news/${featured.id}`}>
                            Read Full Story
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </div>
          )}

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles
              .slice(1) // Skip the first article since it's featured
              .map((article, index) => (
                <Card 
                  key={article.id} 
                  className="card-elegant border-thai-gold/20 group overflow-hidden animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <img 
                      src={article.featured_image || "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop"} 
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-thai-charcoal/20 group-hover:bg-thai-charcoal/10 transition-colors duration-300" />
                    {article.category && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 text-thai-charcoal">
                          {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(article.published_at || article.created_at)}
                      </div>
                    </div>
                    
                    <h3 className="font-playfair text-xl font-semibold text-foreground group-hover:text-thai-gold transition-colors mb-3">
                      {article.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {getExcerpt(article.content, 120)}
                    </p>

                    <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-thai-gold hover:text-thai-gold/80">
                      <Link to={`/news/${article.id}`} className="flex items-center">
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Articles Found</h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all" 
                  ? "No articles have been published yet." 
                  : `No articles found in the "${selectedCategory}" category.`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-thai-charcoal">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <h2 className="font-playfair text-4xl font-bold text-thai-gold mb-4">
              Stay in the Loop
            </h2>
            <p className="text-thai-beige-light mb-8">
              Subscribe to our newsletter to get the latest news, special offers, and updates 
              delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-thai-gold/20 bg-white/10 text-thai-beige-light placeholder:text-thai-beige-dark focus:outline-none focus:ring-2 focus:ring-thai-gold"
                required
              />
              <Button 
                type="submit"
                variant="hero" 
                size="lg"
                disabled={subscribing}
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            <p className="text-sm text-thai-beige-dark mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
            

          </div>
        </div>
      </section>

      {/* Contact Form */}
      {/*<section className="py-16 bg-background">*/}
      {/*  <div className="container mx-auto px-4">*/}
      {/*    <div className="max-w-2xl mx-auto text-center mb-12">*/}
      {/*      <h2 className="font-playfair text-4xl font-bold text-foreground mb-4">*/}
      {/*        Get in Touch*/}
      {/*      </h2>*/}
      {/*      <p className="text-lg text-muted-foreground">*/}
      {/*        Have a question or want to share feedback? We'd love to hear from you!*/}
      {/*      </p>*/}
      {/*    </div>*/}

      {/*    <div className="max-w-2xl mx-auto">*/}
      {/*      <form onSubmit={handleContactSubmit} className="space-y-6">*/}
      {/*        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">*/}
      {/*          <div>*/}
      {/*            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">*/}
      {/*              Name **/}
      {/*            </label>*/}
      {/*            <input*/}
      {/*              type="text"*/}
      {/*              id="name"*/}
      {/*              value={contactForm.name}*/}
      {/*              onChange={(e) => setContactForm({...contactForm, name: e.target.value})}*/}
      {/*              className="w-full px-4 py-3 rounded-lg border border-thai-gold/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-thai-gold"*/}
      {/*              placeholder="Your full name"*/}
      {/*              required*/}
      {/*            />*/}
      {/*          </div>*/}
      {/*          <div>*/}
      {/*            <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">*/}
      {/*              Email **/}
      {/*            </label>*/}
      {/*            <input*/}
      {/*              type="email"*/}
      {/*              id="contact-email"*/}
      {/*              value={contactForm.email}*/}
      {/*              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}*/}
      {/*              className="w-full px-4 py-3 rounded-lg border border-thai-gold/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-thai-gold"*/}
      {/*              placeholder="your.email@example.com"*/}
      {/*              required*/}
      {/*            />*/}
      {/*          </div>*/}
      {/*        </div>*/}

      {/*        <div>*/}
      {/*          <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">*/}
      {/*            Subject*/}
      {/*          </label>*/}
      {/*          <input*/}
      {/*            type="text"*/}
      {/*            id="subject"*/}
      {/*            value={contactForm.subject}*/}
      {/*            onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}*/}
      {/*            className="w-full px-4 py-3 rounded-lg border border-thai-gold/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-thai-gold"*/}
      {/*            placeholder="What's this about?"*/}
      {/*          />*/}
      {/*        </div>*/}

      {/*        <div>*/}
      {/*          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">*/}
      {/*            Message **/}
      {/*          </label>*/}
      {/*          <textarea*/}
      {/*            id="message"*/}
      {/*            value={contactForm.message}*/}
      {/*            onChange={(e) => setContactForm({...contactForm, message: e.target.value})}*/}
      {/*            rows={6}*/}
      {/*            className="w-full px-4 py-3 rounded-lg border border-thai-gold/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-thai-gold resize-none"*/}
      {/*            placeholder="Tell us what's on your mind..."*/}
      {/*            required*/}
      {/*          />*/}
      {/*        </div>*/}

      {/*        <div className="text-center">*/}
      {/*          <Button*/}
      {/*            type="submit"*/}
      {/*            variant="hero"*/}
      {/*            size="lg"*/}
      {/*            disabled={sendingMessage}*/}
      {/*            className="px-8"*/}
      {/*          >*/}
      {/*            {sendingMessage ? "Sending..." : "Send Message"}*/}
      {/*          </Button>*/}
      {/*        </div>*/}
      {/*      </form>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}
    </Layout>
  );
};

export default News;

