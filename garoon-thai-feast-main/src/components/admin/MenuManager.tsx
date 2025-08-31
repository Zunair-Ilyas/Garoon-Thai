import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, DollarSign, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  category_id: z.string().optional(),
  image_url: z.string().optional(),
  delivery_link: z.string().optional(),
  pickup_link: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  is_active: z.boolean()
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url?: string;
  delivery_link?: string;
  pickup_link?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema)
  });

  const isActive = watch("is_active");

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onSubmit = async (data: MenuItemFormData) => {
    setLoading(true);
    try {
      const menuItemData = {
        ...data,
        price: parseFloat(data.price)
      };

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([menuItemData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Menu item created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      reset();
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setValue("name", item.name);
    setValue("description", item.description || "");
    setValue("price", item.price.toString());
    setValue("category_id", item.category_id || "");
    setValue("image_url", item.image_url || "");
    setValue("delivery_link", item.delivery_link || "");
    setValue("pickup_link", item.pickup_link || "");
    setValue("meta_title", item.meta_title || "");
    setValue("meta_description", item.meta_description || "");
    setValue("meta_keywords", item.meta_keywords || "");
    setValue("is_active", item.is_active);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Menu item deleted successfully",
        });
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast({
          title: "Error",
          description: "Failed to delete menu item",
          variant: "destructive",
        });
      }
    }
  };

  const handleNewItem = () => {
    setEditingItem(null);
    reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-playfair text-2xl font-bold text-foreground">Menu Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={handleNewItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input 
                    id="name" 
                    {...register("name")} 
                    placeholder="e.g., Pad Thai"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="price" 
                      {...register("price")} 
                      placeholder="14.95"
                      className="pl-9"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  {...register("description")} 
                  placeholder="Describe this delicious dish..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_id">Category</Label>
                  <Select onValueChange={(value) => setValue("category_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input 
                    id="image_url" 
                    {...register("image_url")} 
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_link">Delivery Link</Label>
                  <Input 
                    id="delivery_link" 
                    {...register("delivery_link")} 
                    placeholder="Uber Eats link"
                  />
                </div>

                <div>
                  <Label htmlFor="pickup_link">Pickup Link</Label>
                  <Input 
                    id="pickup_link" 
                    {...register("pickup_link")} 
                    placeholder="Online ordering link"
                  />
                </div>
              </div>

              {/* SEO Fields */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">SEO Settings</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input 
                      id="meta_title" 
                      {...register("meta_title")} 
                      placeholder="SEO title for this menu item"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea 
                      id="meta_description" 
                      {...register("meta_description")} 
                      placeholder="SEO description for this menu item"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                    <Input 
                      id="meta_keywords" 
                      {...register("meta_keywords")} 
                      placeholder="thai food, pad thai, authentic"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active" 
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <Label htmlFor="is_active">Active (visible on website)</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? "Saving..." : editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-elegant border-thai-gold/20">
        <CardHeader>
          <CardTitle>Menu Items ({menuItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {categories.find(c => c.id === item.category_id)?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? "default" : "secondary"} className="flex items-center gap-1">
                      {item.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {item.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {menuItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No menu items found. Create your first menu item to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManager;