import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CLOUDINARY_IMAGES } from "@/config/images";
import { ArrowRight, Shield, Clock, Users, Star, CheckCircle, Activity } from "lucide-react";
import { usePublicStats } from "@/hooks/usePublicStats";

const HeroSection = () => {
  const { data } = usePublicStats();

  const metrics = [
    { value: data ? `${data.patients.toLocaleString()}+` : "500+", label: "Families Served", icon: Users },
    { value: data ? `${data.averageRating}/5` : "4.9/5", label: "Patient Rating", icon: Star },
    { value: "24/7", label: "Support Available", icon: Clock },
    { value: data ? `${data.caregivers}+` : "0+", label: "Verified Caregivers", icon: Shield },
  ];

  return (
    <section className="bg-white border-b border-border">
      <div className="container">
        <div className="grid lg:grid-cols-2 min-h-[520px]">

          {/* Left — Content Panel */}
          <div className="flex flex-col justify-center py-12 pr-0 lg:pr-12 border-r-0 lg:border-r border-border">
            <div className="flex items-center gap-2 mb-6">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-secondary border border-secondary/30 bg-secondary/5 px-3 py-1 rounded-sm">
                <Activity className="h-3 w-3" /> Platform Active
              </span>
              <span className="text-xs text-muted-foreground">Malawi's #1 Home Care Network</span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-[2.6rem] font-bold leading-tight text-foreground mb-4">
              Professional Home Healthcare,{" "}
              <span className="text-primary">Delivered to Your Door</span>
            </h1>

            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed mb-8 border-l-2 border-primary/30 pl-4">
              CareConnect is a licensed platform connecting patients with verified home-based
              caregivers across all regions of Malawi. We provide supportive care services —
              not medical treatment. All patients must have a physician for diagnosis and prescriptions.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/register">
                <Button size="default" className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-sm font-semibold">
                  Register as Patient <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/caregivers">
                <Button size="default" variant="outline" className="gap-2 rounded-sm font-semibold border-border">
                  Browse Caregivers
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-border">
              {["Licensed & Regulated", "Verified Professionals", "Secure Payments"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-secondary" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Metrics + Image Panel */}
          <div className="hidden lg:flex flex-col">
            <div className="grid grid-cols-2 border-b border-border">
              {metrics.map((m, i) => (
                <div
                  key={m.label}
                  className={`p-6 flex flex-col gap-1 ${i % 2 === 0 ? "border-r border-border" : ""} ${i < 2 ? "border-b border-border" : ""}`}
                >
                  <m.icon className="h-4 w-4 text-primary mb-1" />
                  <span className="text-2xl font-bold text-foreground font-display">{m.value}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              <img
                src={CLOUDINARY_IMAGES.landing2}
                alt="CareConnect Healthcare Professional"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
