import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "All Products", href: "/shop" },
    { name: "New Arrivals", href: "/shop?filter=new" },
    { name: "Best Sellers", href: "/shop?filter=bestsellers" },
    { name: "Graphic Tees", href: "/category/graphic-tees" },
    { name: "Minimalist", href: "/category/minimalist" },
    { name: "Sale", href: "/shop?filter=sale" },
  ];

  const supportLinks = [
    { name: "Size Guide", href: "/size-guide" },
    { name: "Shipping Info", href: "/shipping" },
    { name: "Returns & Exchanges", href: "/returns" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
    { name: "Track Your Order", href: "/orders" },
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Careers", href: "/careers" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/liora", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/liora", label: "Facebook" },
    { icon: Youtube, href: "https://youtube.com/liora", label: "YouTube" },
  ];

  const paymentMethods = [
    { name: "PayHere", logo: "💳" },
    { name: "Visa", logo: "💳" },
    { name: "Mastercard", logo: "💳" },
    { name: "American Express", logo: "💳" },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="space-y-6">
              <Link to="/" className="inline-block">
                <h2 className="text-2xl lg:text-3xl font-bold font-heading tracking-ultra-wide">LIORA</h2>
              </Link>
              <p className="text-gray-300 leading-relaxed max-w-sm">
                Premium minimalist essentials crafted for the mindful soul. 
                Discover the beauty of conscious simplicity.
              </p>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Company</h3>
                <div className="space-y-2">
                  {companyLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="block text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Shop</h3>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Support Links */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Support</h3>
              <div className="space-y-2">
                {supportLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact & Social */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Get in Touch</h3>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300">Colombo, Sri Lanka</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a href="tel:+94771234567" className="text-gray-300 hover:text-white transition-colors">
                    +94 77 123 4567
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a href="mailto:hello@liora.lk" className="text-gray-300 hover:text-white transition-colors">
                    hello@liora.lk
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Follow Us</h4>
                <div className="flex space-x-3">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            
            {/* Copyright */}
            <div className="text-sm text-gray-400 text-center lg:text-left tracking-wide-plus">
              © {currentYear} LIORA. All rights reserved.
            </div>
            
            {/* Payment Methods */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Secure Payments</span>
              <div className="flex items-center space-x-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs font-medium tracking-wide border border-gray-700"
                    title={method.name}
                  >
                    {method.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;