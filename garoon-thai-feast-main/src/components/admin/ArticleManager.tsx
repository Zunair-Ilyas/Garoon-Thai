import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Calendar, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().optional(),
  featured_image: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  status: z.enum(["draft", "published"])
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface Article {
  id: string;
  title: string;
  content: string;
  category?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: "draft" | "published" | "scheduled";
  published_at?: string;
  created_at: string;
  updated_at: string;
}

const ArticleManager = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      status: "draft"
    }
  });

  const status = watch("status");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ArticleFormData) => {
    setLoading(true);
    try {
      const articleData = {
        ...data,
        published_at: data.status === "published" ? new Date().toISOString() : null
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Article updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Article created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingArticle(null);
      reset();
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: "Failed to save article",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setValue("title", article.title);
    setValue("content", article.content);
    setValue("category", article.category || "");
    setValue("featured_image", article.featured_image || "");
    setValue("meta_title", article.meta_title || "");
    setValue("meta_description", article.meta_description || "");
    setValue("meta_keywords", article.meta_keywords || "");
    setValue("status", article.status === "scheduled" ? "draft" : article.status);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        const { error } = await supabase
          .from('articles')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Article deleted successfully",
        });
        fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        toast({
          title: "Error",
          description: "Failed to delete article",
          variant: "destructive",
        });
      }
    }
  };

  const handleNewArticle = () => {
    setEditingArticle(null);
    reset();
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-playfair text-2xl font-bold text-foreground">Article Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={handleNewArticle}>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit Article" : "Create New Article"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Article Title *</Label>
                  <Input 
                    id="title" 
                    {...register("title")} 
                    placeholder="Enter article title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    {...register("category")} 
                    placeholder="e.g., News, Events, Updates"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input 
                  id="featured_image" 
                  {...register("featured_image")} 
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="content">Article Content *</Label>
                <Textarea 
                  id="content" 
                  {...register("content")} 
                  placeholder="Write your article content here..."
                  rows={10}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Publication Status</Label>
                <Select value={status} onValueChange={(value: "draft" | "published") => setValue("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
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
                      placeholder="SEO title for this article"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea 
                      id="meta_description" 
                      {...register("meta_description")} 
                      placeholder="SEO description for this article"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                    <Input 
                      id="meta_keywords" 
                      {...register("meta_keywords")} 
                      placeholder="thai restaurant, news, events"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? "Saving..." : editingArticle ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-elegant border-thai-gold/20">
        <CardHeader>
          <CardTitle>Articles ({articles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {article.content.substring(0, 100)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {article.category && (
                      <Badge variant="outline">{article.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={article.status === "published" ? "default" : "secondary"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {article.status === "published" ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(article.id)}
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
          
          {articles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No articles found. Create your first article to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleManager;