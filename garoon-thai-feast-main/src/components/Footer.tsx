import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, LucideFacebook, LucideInstagram, LucideTwitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BusinessHours {
  [day: string]: string;
}

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

interface ContactInfo {
  id: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  business_hours: BusinessHours;
  social_links: SocialLinks;
  maps_link: string | null;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('contact_info')
          .select('*')
          .maybeSingle();

        if (error || !data) {
          console.error('Error fetching contact info:', error);
          setContactInfo(null);
          toast({
            title: "Contact Info Unavailable",
            description: "Unable to load contact or business hours information from the database.",
            variant: "destructive",
          });
        } else {
          // Parse business_hours and social_links if they are strings (JSON) or null
          const parsedData = { ...data };
          // Ensure business_hours is always an object
          if (!parsedData.business_hours || typeof parsedData.business_hours === 'string') {
            try {
              parsedData.business_hours = parsedData.business_hours ? JSON.parse(parsedData.business_hours) : {};
            } catch {
              parsedData.business_hours = {};
            }
          }
          // Ensure social_links is always an object
          if (!parsedData.social_links || typeof parsedData.social_links === 'string') {
            try {
              parsedData.social_links = parsedData.social_links ? JSON.parse(parsedData.social_links) : {};
            } catch {
              parsedData.social_links = {};
            }
          }
          setContactInfo(parsedData as ContactInfo);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
        setContactInfo(null);
        toast({
          title: "Contact Info Unavailable",
          description: "Unable to load contact or business hours information from the database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, [toast]);

  if (loading) {
    return (
      <footer className="bg-thai-charcoal text-thai-beige-light">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thai-gold mx-auto mb-4"></div>
            <p className="text-thai-beige-dark">Loading contact information...</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-thai-charcoal text-thai-beige-light">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hero-gradient rounded-full flex items-center justify-center">
                <span className="text-thai-charcoal font-bold text-sm">G</span>
              </div>
              <span className="font-playfair text-xl font-bold text-thai-gold">
                Easy Go Thai
              </span>
            </div>
            <p className="text-sm text-thai-beige-dark leading-relaxed">
              Authentic Thai cuisine crafted with passion and tradition. Experience 
              the vibrant flavors of Thailand in every dish.
            </p>
            <div className="flex space-x-4">
              <a
                href={contactInfo?.social_links?.facebook || undefined}
                className="text-thai-beige-dark hover:text-thai-gold transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!contactInfo?.social_links?.facebook}
              >
                <LucideFacebook className="h-5 w-5" />
              </a>
              <a
                href={contactInfo?.social_links?.instagram || undefined}
                className="text-thai-beige-dark hover:text-thai-gold transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!contactInfo?.social_links?.instagram}
              >
                <LucideInstagram className="h-5 w-5" />
              </a>
              <a
                href={contactInfo?.social_links?.twitter || undefined}
                className="text-thai-beige-dark hover:text-thai-gold transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!contactInfo?.social_links?.twitter}
              >
                <LucideTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-thai-gold">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Menu", href: "/menu" },
                { name: "About Us", href: "/about" },
                { name: "News & Events", href: "/news" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-thai-beige-dark hover:text-thai-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-thai-gold">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 text-thai-gold flex-shrink-0" />
                <span className="text-sm text-thai-beige-dark">
                  {contactInfo?.address ? (
                    contactInfo.address.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < contactInfo.address.split('\n').length - 1 && <br />}
                      </span>
                    ))
                  ) : (
                    <span className="italic text-thai-beige-dark/60">Not available</span>
                  )}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-thai-gold flex-shrink-0" />
                <a
                  href={contactInfo?.phone ? `tel:${contactInfo.phone}` : undefined}
                  className="text-sm text-thai-beige-dark hover:text-thai-gold transition-colors"
                  aria-disabled={!contactInfo?.phone}
                >
                  {contactInfo?.phone || <span className="italic text-thai-beige-dark/60">Not available</span>}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-thai-gold flex-shrink-0" />
                <a
                  href={contactInfo?.email ? `mailto:${contactInfo.email}` : undefined}
                  className="text-sm text-thai-beige-dark hover:text-thai-gold transition-colors"
                  aria-disabled={!contactInfo?.email}
                >
                  {contactInfo?.email || <span className="italic text-thai-beige-dark/60">Not available</span>}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-thai-gold">Business Hours</h3>
            <div className="space-y-2">
              {contactInfo?.business_hours && Object.keys(contactInfo.business_hours).length > 0 ? (
                Object.entries(contactInfo.business_hours).map(([day, hours], index) => (
                  <div key={day} className={index === 0 ? "flex items-start space-x-3" : "text-sm text-thai-beige-dark ml-7"}>
                    {index === 0 && <Clock className="h-4 w-4 mt-1 text-thai-gold flex-shrink-0" />}
                    <div className="text-sm text-thai-beige-dark">
                      <div className="font-medium">{day}</div>
                      <div>{hours as string}</div>
                    </div>
                  </div>
                ))
              ) : (
                <span className="italic text-thai-beige-dark/60">Not available</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-thai-beige-dark/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-thai-beige-dark">
            © {currentYear} Easy Go Thai. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-thai-beige-dark hover:text-thai-gold transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-thai-beige-dark hover:text-thai-gold transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;