import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
              <a href="#" className="text-thai-beige-dark hover:text-thai-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-thai-beige-dark hover:text-thai-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-thai-beige-dark hover:text-thai-gold transition-colors">
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
                  123 Thai Street, Flavor District<br />
                  Food City, FC 12345
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-thai-gold flex-shrink-0" />
                <span className="text-sm text-thai-beige-dark">(555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-thai-gold flex-shrink-0" />
                <span className="text-sm text-thai-beige-dark">hello@garoonthai.com</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-thai-gold">Business Hours</h3>
            <div className="space-y-2">
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