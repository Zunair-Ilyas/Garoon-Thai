import { useState, useEffect, ChangeEvent } from "react";
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
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  is_active: z.boolean(),
  is_gluten_free: z.boolean().optional(),
  is_vegan: z.boolean().optional(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_active: boolean;
  is_gluten_free?: boolean;
  is_vegan?: boolean;
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

const fetchMenuItems = async (setMenuItems, toast) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');
    if (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
      return;
    }
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

const fetchCategories = async (setCategories, toast) => {
  try {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order');
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      is_active: true,
      is_gluten_free: false,
      is_vegan: false
    }
  });

  const isActive = watch("is_active");

  useEffect(() => {
    fetchMenuItems(setMenuItems, toast);
    fetchCategories(setCategories, toast);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const getBase64FromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: MenuItemFormData) => {
    console.log('onSubmit called', data); // DEBUG
    setLoading(true);
    try {
      let imageBase64 = data.image_url;
      if (imageFile) {
        imageBase64 = await getBase64FromFile(imageFile);
      }
      const menuItemData = {
        ...data,
        image_url: imageBase64,
        price: parseFloat(data.price),
        category_id: data.category_id || null,
        is_active: data.is_active ?? true,
        is_gluten_free: data.is_gluten_free ?? false,
        is_vegan: data.is_vegan ?? false
      };
      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', editingItem.id)
          .select();
        if (error) {
          console.error('Update error:', error);
          toast({
            title: "Error",
            description: `Failed to update menu item: ${error.message || error}`,
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([menuItemData])
          .select();
        if (error) {
          console.error('Insert error:', error);
          toast({
            title: "Error",
            description: `Failed to create menu item: ${error.message || error}`,
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Success",
          description: "Menu item created successfully",
        });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      reset({
        is_active: true,
        is_gluten_free: false,
        is_vegan: false
      });
      setImageFile(null);
      setImagePreview(null);
      await fetchMenuItems(setMenuItems, toast);
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: `Failed to save menu item: ${error.message || error}`,
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
    setValue("meta_title", item.meta_title || "");
    setValue("meta_description", item.meta_description || "");
    setValue("meta_keywords", item.meta_keywords || "");
    setValue("is_active", item.is_active);
    setValue("is_gluten_free", item.is_gluten_free ?? false);
    setValue("is_vegan", item.is_vegan ?? false);
    setImageFile(null);
    setImagePreview(item.image_url || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', id);
        if (error) {
          console.error('Error deleting menu item:', error);
          toast({
            title: "Error",
            description: "Failed to delete menu item",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Success",
          description: "Menu item deleted successfully",
        });
        fetchMenuItems(setMenuItems, toast);
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
    console.log('handleNewItem called'); // DEBUG
    setEditingItem(null);
    reset({
      is_active: true,
      is_gluten_free: false,
      is_vegan: false,
      name: "",
      description: "",
      price: "",
      category_id: "",
      image_url: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: ""
    });
    setImageFile(null);
    setImagePreview(null);
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
                  <Select 
                    value={watch("category_id") || "none"}
                    onValueChange={(value) => setValue("category_id", value === "none" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="image_file">Image Upload</Label>
                  <Input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 max-h-32 rounded" />
                  )}
                </div>
              </div>

              {/* Gluten Free & Vegan Switches */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_gluten_free"
                    checked={watch("is_gluten_free")}
                    onCheckedChange={(checked) => setValue("is_gluten_free", checked)}
                  />
                  <Label htmlFor="is_gluten_free">Gluten Free</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_vegan"
                    checked={watch("is_vegan")}
                    onCheckedChange={(checked) => setValue("is_vegan", checked)}
                  />
                  <Label htmlFor="is_vegan">Vegan</Label>
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
                <TableHead>Gluten Free</TableHead>
                <TableHead>Vegan</TableHead>
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
                    {item.is_gluten_free ? <Badge variant="outline">GF</Badge> : null}
                  </TableCell>
                  <TableCell>
                    {item.is_vegan ? <Badge variant="outline">Vegan</Badge> : null}
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
