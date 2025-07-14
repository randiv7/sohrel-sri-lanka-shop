import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/shop" },
      { name: "New Arrivals", href: "/shop?filter=new" },
      { name: "Best Sellers", href: "/shop?filter=bestsellers" },
      { name: "Sale", href: "/shop?filter=sale" },
    ],
    collections: [
      { name: "Graphic Tees", href: "/category/graphic-tees" },
      { name: "Minimalist", href: "/category/minimalist" },
      { name: "Typography", href: "/category/typography" },
      { name: "Oversized", href: "/category/oversized" },
    ],
    help: [
      { name: "Size Guide", href: "/size-guide" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns", href: "/returns" },
      { name: "FAQ", href: "/faq" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/sohrel", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/sohrel", label: "Facebook" },
    { icon: Youtube, href: "https://youtube.com/sohrel", label: "YouTube" },
  ];

  const paymentMethods = [
    "PayHere",
    "Visa",
    "Mastercard",
    "American Express",
  ];

  return (
    <footer className="bg-brand-black text-brand-white">
      <div className="container-sohrel">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-bold font-heading">SOHREL</h2>
            </Link>
            <p className="text-brand-white/80 max-w-md">
              Premium minimalist t-shirts crafted for the modern soul. 
              Discover the beauty of simplicity with SOHREL.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-brand-white/60" />
                <span>Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-brand-white/60" />
                <span>+94 77 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-brand-white/60" />
                <span>hello@sohrel.lk</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-brand-white/20 hover:border-brand-white/40 transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h3 className="font-semibold mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-brand-white/80 hover:text-brand-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 uppercase tracking-wider">Collections</h3>
            <ul className="space-y-2">
              {footerLinks.collections.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-brand-white/80 hover:text-brand-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 uppercase tracking-wider">Help</h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-brand-white/80 hover:text-brand-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h3 className="font-semibold mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-brand-white/80 hover:text-brand-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-brand-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-brand-white/60">
              © {currentYear} SOHREL. All rights reserved.
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-brand-white/60">We accept:</span>
              <div className="flex space-x-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method}
                    className="px-2 py-1 bg-brand-white/10 text-xs font-medium"
                  >
                    {method}
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