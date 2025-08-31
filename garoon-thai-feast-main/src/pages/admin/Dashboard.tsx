import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  FileText, 
  Utensils, 
  Settings, 
  LogOut, 
  Mail,
  MapPin,
  TrendingUp,
  Star,
  Eye,
  BarChart3
} from "lucide-react";
import MenuManager from "@/components/admin/MenuManager";
import ArticleManager from "@/components/admin/ArticleManager";
import ContactManager from "@/components/admin/ContactManager";
import SEOManager from "@/components/admin/SEOManager";
import UserManager from "@/components/admin/UserManager";
import CategoryManager from "@/components/admin/CategoryManager";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    menuItems: 0,
    articles: 0,
    subscribers: 0,
    profiles: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [menuItems, articles, subscribers, profiles] = await Promise.all([
        supabase.from('menu_items').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('member_subscriptions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        menuItems: menuItems.count || 0,
        articles: articles.count || 0,
        subscribers: subscribers.count || 0,
        profiles: profiles.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error signing out.",
        variant: "destructive",
      });
    }
  };

  const statCards = [
    {
      title: "Menu Items",
      value: stats.menuItems,
      icon: Utensils,
      color: "text-thai-gold",
      bgColor: "bg-thai-gold/10"
    },
    {
      title: "Articles",
      value: stats.articles,
      icon: FileText,
      color: "text-thai-green",
      bgColor: "bg-thai-green/10"
    },
    {
      title: "Subscribers",
      value: stats.subscribers,
      icon: Mail,
      color: "text-thai-red",
      bgColor: "bg-thai-red/10"
    },
    {
      title: "Users",
      value: stats.profiles,
      icon: Users,
      color: "text-thai-charcoal",
      bgColor: "bg-thai-charcoal/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-thai-charcoal border-b border-thai-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-playfair text-2xl font-bold text-thai-gold">
                Garoon Thai Admin
              </h1>
              <p className="text-thai-beige-light text-sm">
                Welcome back, {user?.email}
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-thai-beige-light hover:text-thai-gold"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <Card key={index} className="card-elegant border-thai-gold/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="card-elegant border-thai-gold/20">
              <CardHeader>
                <CardTitle className="font-playfair text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="hero" 
                    className="h-16 flex-col space-y-2"
                    onClick={() => {
                      const menuTab = document.querySelector('[value="menu"]') as HTMLElement;
                      menuTab?.click();
                    }}
                  >
                    <Utensils className="h-6 w-6" />
                    <span>Add Menu Item</span>
                  </Button>
                  <Button 
                    variant="elegant" 
                    className="h-16 flex-col space-y-2"
                    onClick={() => {
                      const articlesTab = document.querySelector('[value="articles"]') as HTMLElement;
                      articlesTab?.click();
                    }}
                  >
                    <FileText className="h-6 w-6" />
                    <span>Write Article</span>
                  </Button>
                  <Button 
                    variant="accent" 
                    className="h-16 flex-col space-y-2"
                    onClick={() => {
                      const seoTab = document.querySelector('[value="seo"]') as HTMLElement;
                      seoTab?.click();
                    }}
                  >
                    <Settings className="h-6 w-6" />
                    <span>Update Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="card-elegant border-thai-gold/20">
              <CardHeader>
                <CardTitle className="font-playfair text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-thai-beige-light/10 rounded-lg">
                    <div className="w-2 h-2 bg-thai-green rounded-full"></div>
                    <span className="text-sm text-muted-foreground">System initialized and ready</span>
                    <Badge variant="secondary" className="ml-auto">Just now</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="menu">
            <MenuManager />
          </TabsContent>

          <TabsContent value="articles">
            <ArticleManager />
          </TabsContent>

          <TabsContent value="contact">
            <ContactManager />
          </TabsContent>

          <TabsContent value="seo">
            <SEOManager />
          </TabsContent>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;