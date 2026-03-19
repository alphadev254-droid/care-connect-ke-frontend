import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Shield } from "lucide-react";
import { CLOUDINARY_IMAGES } from "@/config/images";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: "Find Caregivers", href: "/caregivers" },
      { label: "Book Appointment", href: "/dashboard" },
      { label: "Specialties", href: "/specialties" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
    legal: [
      { label: "Terms of Service", href: "/terms/patient/pdf", external: true },
    ],
  };

  return (
    <footer className="bg-foreground text-background border-t-4 border-primary">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-white/10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={CLOUDINARY_IMAGES.logo} alt="CareConnect" className="h-9 w-9 rounded" />
              <div className="flex flex-col leading-none">
                <span className="font-display text-base font-bold text-white">
                  Care<span className="text-primary">Connect</span>
                </span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Home Healthcare</span>
              </div>
            </Link>
            <p className="text-sm text-white/60 mb-5 max-w-xs leading-relaxed">
              Malawi's licensed platform connecting patients with verified home-based caregivers
              across all regions. Supportive care services — not medical treatment.
            </p>
            <div className="space-y-2">
              {[
                { icon: Phone, text: "+265 986 227 240" },
                { icon: Mail, text: "support@careconnectmalawi.com" },
                { icon: MapPin, text: "Area 58, Lilongwe, Central Region, Malawi" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-xs text-white/60">
                  <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Legal</h4>
            <ul className="space-y-2.5 mb-6">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${link.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="text-sm text-white/70 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-2 p-3 border border-white/10 rounded-sm bg-white/5">
              <Shield className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/50 leading-relaxed">
                Licensed & regulated home healthcare platform. All caregivers are professionally verified.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">
            © {currentYear} CareConnect. All rights reserved.
          </p>
          <p className="text-xs text-white/30 uppercase tracking-widest">
            Malawi Home Healthcare Platform
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
