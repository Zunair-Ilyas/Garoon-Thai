import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContactInfo {
  id: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  business_hours: any;
  social_links: any;
  maps_link: string | null;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching contact info:', error);
        // Use default values if database fetch fails
        setContactInfo({
          id: 'default',
          address: "123 Thai Street, Flavor District\nFood City, FC 12345",
          phone: "(555) 123-4567",
          email: "hello@garoonthai.com",
          business_hours: {
            "Mon - Thu": "11:00 AM - 10:00 PM",
            "Fri - Sat": "11:00 AM - 11:00 PM",
            "Sunday": "12:00 PM - 9:00 PM"
          },
          social_links: {
            facebook: "#",
            instagram: "#",
            twitter: "#"
          },
          maps_link: null
        });
      } else {
        setContactInfo(data || {
          id: 'default',
          address: "123 Thai Street, Flavor District\nFood City, FC 12345",
          phone: "(555) 123-4567",
          email: "hello@garoonthai.com",
          business_hours: {
            "Mon - Thu": "11:00 AM - 10:00 PM",
            "Fri - Sat": "11:00 AM - 11:00 PM",
            "Sunday": "12:00 PM - 9:00 PM"
          },
          social_links: {
            facebook: "#",
            instagram: "#",
            twitter: "#"
          },
          maps_link: null
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Use default values on error
      setContactInfo({
        id: 'default',
        address: "123 Thai Street, Flavor District\nFood City, FC 12345",
        phone: "(555) 123-4567",
        email: "hello@garoonthai.com",
        business_hours: {
          "Mon - Thu": "11:00 AM - 10:00 PM",
          "Fri - Sat": "11:00 AM - 11:00 PM",
          "Sunday": "12:00 PM - 9:00 PM"
        },
        social_links: {
          facebook: "#",
          instagram: "#",
          twitter: "#"
        },
        maps_link: null
      });
    } finally {
      setLoading(false);
    }
  };

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
                Garoon Thai
              </span>
            </div>
            <p className="text-sm text-thai-beige-dark leading-relaxed">
              Authentic Thai cuisine crafted with passion and tradition. Experience 
              the vibrant flavors of Thailand in every dish.
            </p>
            <div className="flex space-x-4">
              <a 
                href={contactInfo?.social_links?.facebook || "#"} 
                className="text-thai-beige-dark hover:text-thai-gold transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href={contactInfo?.social_links?.instagram || "#"} 
                className="text-thai-beige-dark hover:text-thai-gold transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href={contactInfo?.social_links?.twitter || "#"} 
                className="text-thai-beige-dark hover:text-thai-gold transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
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
                    <>
                      123 Thai Street, Flavor District<br />
                      Food City, FC 12345
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-thai-gold flex-shrink-0" />
                <a 
                  href={`tel:${contactInfo?.phone || "(555) 123-4567"}`}
                  className="text-sm text-thai-beige-dark hover:text-thai-gold transition-colors"
                >
                  {contactInfo?.phone || "(555) 123-4567"}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-thai-gold flex-shrink-0" />
                <a 
                  href={`mailto:${contactInfo?.email || "hello@garoonthai.com"}`}
                  className="text-sm text-thai-beige-dark hover:text-thai-gold transition-colors"
                >
                  {contactInfo?.email || "hello@garoonthai.com"}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-thai-gold">Business Hours</h3>
            <div className="space-y-2">
              {contactInfo?.business_hours ? (
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
                <>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 mt-1 text-thai-gold flex-shrink-0" />
                    <div className="text-sm text-thai-beige-dark">
                      <div className="font-medium">Mon - Thu</div>
                      <div>11:00 AM - 10:00 PM</div>
                    </div>
                  </div>
                  <div className="text-sm text-thai-beige-dark ml-7">
                    <div className="font-medium">Fri - Sat</div>
                    <div>11:00 AM - 11:00 PM</div>
                  </div>
                  <div className="text-sm text-thai-beige-dark ml-7">
                    <div className="font-medium">Sunday</div>
                    <div>12:00 PM - 9:00 PM</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-thai-beige-dark/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-thai-beige-dark">
            © {currentYear} Garoon Thai. All rights reserved.
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