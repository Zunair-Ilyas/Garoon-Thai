import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { ShoppingCart, Star, Flame, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url?: string;
  delivery_link?: string;
  pickup_link?: string;
  is_active: boolean;
}

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch menu items
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (menuItemsError) throw menuItemsError;

      setCategories(categoriesData || []);
      setMenuItems(menuItemsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load menu data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get category name for filtering
  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);
  
  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category_id === activeCategory);

  const allCategories = [
    { id: "all", name: "All Items" },
    ...categories
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thai-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading menu...</p>
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
            Our Menu
          </h1>
          <p className="text-xl text-thai-charcoal/80 max-w-2xl mx-auto">
            Discover the authentic flavors of Thailand with our carefully crafted dishes
          </p>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {allCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "hero" : "elegant"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="transition-all duration-300"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Order Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <Button variant="hero" size="lg" className="shadow-glow">
              Order via Uber Eats
            </Button>
            <Button variant="accent" size="lg">
              Schedule Pickup
            </Button>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="card-elegant border-thai-gold/20 group overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img 
                    src={item.image_url || "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&h=300&fit=crop"} 
                    alt={item.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-thai-charcoal/20 group-hover:bg-thai-charcoal/10 transition-colors duration-300" />
                </div>

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-playfair text-xl font-semibold text-foreground group-hover:text-thai-gold transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-xl font-bold text-thai-gold">
                      ${item.price}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {item.description || "Delicious Thai dish prepared with authentic ingredients"}
                  </p>

                  <div className="flex gap-2">
                    {item.delivery_link && (
                      <Button 
                        variant="hero" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(item.delivery_link, '_blank')}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Delivery
                      </Button>
                    )}
                    {item.pickup_link && (
                      <Button 
                        variant="accent" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(item.pickup_link, '_blank')}
                      >
                        Pickup
                      </Button>
                    )}
                    {!item.delivery_link && !item.pickup_link && (
                      <Button 
                        variant="hero" 
                        size="sm" 
                        className="w-full"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No menu items found in this category.
              </p>
            </div>
          )}

          {/* Menu Note */}
          <div className="text-center mt-12 p-6 bg-thai-beige-light/30 rounded-lg">
            <p className="text-muted-foreground">
              <strong>Note:</strong> Most dishes can be prepared vegetarian or vegan upon request. 
              Please inform our staff of any allergies or dietary restrictions.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Menu;