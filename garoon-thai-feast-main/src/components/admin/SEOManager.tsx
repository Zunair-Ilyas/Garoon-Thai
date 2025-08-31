import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Search, Globe, Code, Image } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const seoSchema = z.object({
  site_meta_title: z.string().optional(),
  site_meta_description: z.string().optional(),
  site_meta_keywords: z.string().optional(),
  og_image: z.string().optional(),
  custom_scripts: z.string().optional()
});

type SEOFormData = z.infer<typeof seoSchema>;

interface SEOSettings {
  id: string;
  site_meta_title?: string;
  site_meta_description?: string;
  site_meta_keywords?: string;
  og_image?: string;
  custom_scripts?: string;
  created_at: string;
  updated_at: string;
}

const SEOManager = () => {
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue } = useForm<SEOFormData>({
    resolver: zodResolver(seoSchema)
  });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSeoSettings(data);
        setValue("site_meta_title", data.site_meta_title || "");
        setValue("site_meta_description", data.site_meta_description || "");
        setValue("site_meta_keywords", data.site_meta_keywords || "");
        setValue("og_image", data.og_image || "");
        setValue("custom_scripts", data.custom_scripts || "");
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch SEO settings",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: SEOFormData) => {
    setLoading(true);
    try {
      if (seoSettings) {
        const { error } = await supabase
          .from('seo_settings')
          .update(data)
          .eq('id', seoSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('seo_settings')
          .insert([data]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "SEO settings updated successfully",
      });
      
      fetchSEOSettings();
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast({
        title: "Error",
        description: "Failed to save SEO settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-2xl font-bold text-foreground">SEO Settings</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Meta Tags */}
        <Card className="card-elegant border-thai-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-thai-gold" />
              Meta Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site_meta_title">Site Meta Title</Label>
              <Input 
                id="site_meta_title" 
                {...register("site_meta_title")} 
                placeholder="Garoon Thai Restaurant - Authentic Thai Cuisine"
                maxLength={60}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: 50-60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="site_meta_description">Site Meta Description</Label>
              <Textarea 
                id="site_meta_description" 
                {...register("site_meta_description")} 
                placeholder="Experience authentic Thai flavors at Garoon Thai. Traditional recipes, fresh ingredients, and warm hospitality since 1998."
                rows={3}
                maxLength={160}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: 150-160 characters
              </p>
            </div>

            <div>
              <Label htmlFor="site_meta_keywords">Meta Keywords</Label>
              <Input 
                id="site_meta_keywords" 
                {...register("site_meta_keywords")} 
                placeholder="thai restaurant, authentic thai food, pad thai, tom yum, thai curry"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate keywords with commas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Open Graph */}
        <Card className="card-elegant border-thai-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-thai-gold" />
              Open Graph & Social Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="og_image">Open Graph Image URL</Label>
              <Input 
                id="og_image" 
                {...register("og_image")} 
                placeholder="https://example.com/og-image.jpg"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recommended size: 1200x630 pixels. This image will be shown when your site is shared on social media.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Scripts */}
        <Card className="card-elegant border-thai-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-thai-gold" />
              Custom Scripts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="custom_scripts">Custom HTML/JavaScript</Label>
              <Textarea 
                id="custom_scripts" 
                {...register("custom_scripts")} 
                placeholder="<!-- Google Analytics, Facebook Pixel, or other tracking codes -->"
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Add custom HTML, CSS, or JavaScript code. This will be injected into the head section of your website.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO Tips */}
        <Card className="card-elegant border-thai-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-thai-gold" />
              SEO Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Title Tags</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Keep under 60 characters</li>
                  <li>• Include primary keywords</li>
                  <li>• Make it compelling for users</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Meta Descriptions</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Keep under 160 characters</li>
                  <li>• Include a call-to-action</li>
                  <li>• Summarize page content</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Keywords</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use relevant, specific terms</li>
                  <li>• Include location-based keywords</li>
                  <li>• Avoid keyword stuffing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Images</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use descriptive alt text</li>
                  <li>• Optimize file sizes</li>
                  <li>• Use relevant file names</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="hero" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save SEO Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SEOManager;