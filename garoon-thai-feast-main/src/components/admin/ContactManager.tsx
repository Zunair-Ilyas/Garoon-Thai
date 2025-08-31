import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  maps_link: z.string().optional(),
  business_hours: z.string().optional()
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactInfo {
  id: string;
  address?: string;
  email?: string;
  phone?: string;
  maps_link?: string;
  business_hours?: any;
  social_links?: any;
  created_at: string;
  updated_at: string;
}

const ContactManager = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setContactInfo(data);
        setValue("address", data.address || "");
        setValue("email", data.email || "");
        setValue("phone", data.phone || "");
        setValue("maps_link", data.maps_link || "");
        setValue("business_hours", JSON.stringify(data.business_hours || {}, null, 2));
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contact information",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      let businessHours = {};
      try {
        if (data.business_hours) {
          businessHours = JSON.parse(data.business_hours);
        }
      } catch (e) {
        // If JSON parsing fails, treat as plain text
        businessHours = { text: data.business_hours };
      }

      const contactData = {
        address: data.address,
        email: data.email,
        phone: data.phone,
        maps_link: data.maps_link,
        business_hours: businessHours
      };

      if (contactInfo) {
        const { error } = await supabase
          .from('contact_info')
          .update(contactData)
          .eq('id', contactInfo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_info')
          .insert([contactData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Contact information updated successfully",
      });
      
      fetchContactInfo();
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast({
        title: "Error",
        description: "Failed to save contact information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-2xl font-bold text-foreground">Contact Information</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <Card className="card-elegant border-thai-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-thai-gold" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea 
                    id="address" 
                    {...register("address")} 
                    placeholder="123 Thai Street, Flavor District, Food City, FC 12345"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="maps_link">Google Maps Link</Label>
                  <Input 
                    id="maps_link" 
                    {...register("maps_link")} 
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="card-elegant border-thai-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-thai-gold" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    {...register("phone")} 
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    {...register("email")} 
                    type="email"
                    placeholder="hello@garoonthai.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Hours */}
        <Card className="card-elegant border-thai-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-thai-gold" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="business_hours">Hours (JSON format or plain text)</Label>
              <Textarea 
                id="business_hours" 
                {...register("business_hours")} 
                placeholder='{"monday": "11:00 AM - 10:00 PM", "tuesday": "11:00 AM - 10:00 PM"} or plain text'
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-1">
                You can enter plain text or JSON format for structured data
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="hero" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactManager;