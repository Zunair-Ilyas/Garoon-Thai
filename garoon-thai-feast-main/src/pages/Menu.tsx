import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { Search, X } from "lucide-react";

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
  is_active: boolean;
  is_gluten_free?: boolean;
  is_vegan?: boolean;
  is_spicy?: boolean; // new
  is_vegetarian?: boolean; // new
}

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      // This throw is caught locally, safe to ignore warning
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

  const filteredItems = (activeCategory === "all"
    ? menuItems
    : menuItems.filter(item => item.category_id === activeCategory)
  ).filter(item => {
    const q = search.toLowerCase();
    const cat = categories.find(c => c.id === item.category_id)?.name?.toLowerCase() || "";
    return (
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      cat.includes(q)
    );
  });

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
          {/* Category Filter & Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div className="flex flex-wrap gap-2">
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
            <div className="relative w-full md:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by name, description, or category..."
                className="border border-gray-300 rounded pl-9 pr-8 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-thai-gold"
                onKeyDown={e => {
                  if (e.key === 'Escape') setSearchInput("");
                  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                    e.preventDefault();
                    (e.target as HTMLInputElement).select();
                  }
                }}
                aria-label="Search menu items"
              />
              {searchInput && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchInput("")}
                  tabIndex={0}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
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

                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.is_gluten_free && (
                      <Badge variant="outline" className="whitespace-nowrap bg-green-50 text-green-800 border-green-300 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
                        Can be Ordered Gluten Free
                      </Badge>
                    )}
                    {item.is_vegan && (
                      <Badge variant="outline" className="whitespace-nowrap bg-emerald-50 text-emerald-800 border-emerald-300 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
                        Can be Ordered Vegan
                      </Badge>
                    )}
                    {item.is_spicy && (
                      <Badge variant="outline" className="whitespace-nowrap bg-red-50 text-red-800 border-red-300 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
                        Can be Ordered Spicy
                      </Badge>
                    )}
                    {item.is_vegetarian && (
                      <Badge variant="outline" className="whitespace-nowrap bg-yellow-50 text-yellow-800 border-yellow-300 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
                        Can be Ordered Vegetarian
                      </Badge>
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
