import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  display_order: z.string().optional(),
  is_active: z.boolean()
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      is_active: true
    }
  });

  const isActive = watch("is_active");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const categoryData = {
        ...data,
        display_order: parseInt(data.display_order || "0")
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('menu_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('menu_categories')
          .insert([categoryData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      reset();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setValue("name", category.name);
    setValue("description", category.description || "");
    setValue("display_order", category.display_order.toString());
    setValue("is_active", category.is_active);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const { error } = await supabase
          .from('menu_categories')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-playfair text-2xl font-bold text-foreground">Category Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={handleNewCategory}>
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Create New Category"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input 
                  id="name" 
                  {...register("name")} 
                  placeholder="e.g., Appetizers, Main Dishes"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  {...register("description")} 
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input 
                  id="display_order" 
                  type="number"
                  {...register("display_order")} 
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? "Saving..." : editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-elegant border-thai-gold/20">
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-thai-gold" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {category.description || "No description"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{category.display_order}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      category.is_active 
                        ? 'bg-thai-green/20 text-thai-green' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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
          
          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. Create your first category to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;