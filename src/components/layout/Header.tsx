import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, Clock, MapPin, ChevronRight } from "lucide-react";
import { CLOUDINARY_IMAGES } from "@/config/images";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/specialties", label: "Specialties" },
    { href: "/caregivers", label: "Find Caregivers" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Clinical Top Bar */}
      <div className="w-full bg-primary text-white text-xs py-1.5 border-b border-primary/80">
        <div className="container flex items-center justify-between">
          <div className="flex items-center divide-x divide-white/20">
            <span className="flex items-center gap-1.5 pr-4">
              <Phone className="h-3 w-3" /> +265 986 227 240
            </span>
            <span className="flex items-center gap-1.5 px-4">
              <Clock className="h-3 w-3" /> Mon–Fri: 8AM–6PM
            </span>
            <span className="hidden md:flex items-center gap-1.5 pl-4">
              <MapPin className="h-3 w-3" /> Serving All Regions of Malawi
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-white/80">
            <span className="font-medium tracking-wide uppercase text-[10px]">
              Licensed Home Healthcare Platform
            </span>
          </div>
        </div>
      </div>

      {/* Main Header — white, sharp, clinical */}
      <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-primary shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={CLOUDINARY_IMAGES.logo} alt="CareConnect" className="h-10 w-10 rounded" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold text-foreground tracking-tight">
                Care<span className="text-primary">Connect</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                Home Healthcare
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-5 text-sm font-medium border-b-2 transition-colors ${
                  isActive(link.href)
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gap-1.5 bg-primary text-white hover:bg-primary/90 rounded font-medium">
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 text-sm font-medium border-l-2 transition-colors ${
                      isActive(link.href)
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-primary text-white hover:bg-primary/90">Get Started</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
};

export default Header;
