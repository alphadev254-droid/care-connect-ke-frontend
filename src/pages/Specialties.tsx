import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { usePublicStats } from "@/hooks/usePublicStats";
import { CLOUDINARY_IMAGES } from "@/config/images";
import {
  Heart, Baby, Users, Brain, Activity, Stethoscope,
  Pill, Shield, ArrowRight, CheckCircle, Eye, Bone, Loader2
} from "lucide-react";

const iconMap: Record<string, any> = {
  "Nursing Care": Stethoscope,
  "Geriatric Care": Heart,
  "Pediatric Care": Baby,
  "Physiotherapy": Activity,
  "Mental Health": Brain,
  "Palliative Care": Pill,
  "Vision Care": Eye,
  "Orthopedic Care": Bone,
  "General Care": Stethoscope,
  "Elderly Care": Users,
  "Physical Therapy": Activity,
  "Medication Management": Pill,
  "Post-operative Care": Shield,
};

const benefits = [
  "All caregivers are professionally verified and licensed",
  "Personalized care plans tailored to your specific needs",
  "24/7 emergency support and monitoring available",
  "Comprehensive care reports after each session",
  "Flexible scheduling to fit your lifestyle",
  "Secure and confidential healthcare delivery",
];

const Specialties = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: specialtiesData, isLoading } = useQuery({
    queryKey: ["specialties-page"],
    queryFn: async () => {
      const response = await api.get("/public/specialties");
      return response.data || {};
    },
  });

  const specialties = specialtiesData?.specialties || [];
  const { data: platformStats } = usePublicStats();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Healthcare Specialties & Home Care Services | CareConnect Malawi</title>
        <meta name="description" content="Comprehensive home healthcare services: Medication management, wound care, health education, chronic disease management, elderly care, palliative care, post-surgery care, diabetes management. Available across all Malawi regions." />
        <meta name="keywords" content="healthcare services Malawi, medication management, wound care, health education, chronic disease care, elderly care, palliative care, post-surgery care, diabetes management, specialized nursing care" />
      </Helmet>
      <Header />

      <main>
        {/* ── Hero ── */}
        <section
          className="py-6 lg:py-8 relative bg-cover bg-no-repeat overflow-hidden"
          style={{ backgroundImage: `url(${CLOUDINARY_IMAGES.specialities})`, backgroundPosition: "0 45%" }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">
                  Our Services
                </span>
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-white">
                  Healthcare <span className="text-primary">Specialties</span>
                </h1>
                <p className="text-sm text-white/80 mb-6 max-w-lg leading-relaxed">
                  Our verified caregivers provide supportive care services — not medical treatment.
                  All patients must have a physician for diagnosis and prescriptions.
                </p>
                <noscript>
                  <div className="bg-white/90 p-4 rounded-lg text-gray-900 mb-4">
                    <p className="font-semibold mb-2">Our Specialties Include:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Elderly Care</li><li>General Care</li>
                      <li>Health Education & Promotion</li><li>Medication Management</li>
                      <li>Mental Health</li><li>Nursing Care</li>
                      <li>Pediatric Care</li><li>Personal Care</li>
                      <li>Physiotherapy</li><li>Psychosocial Support</li>
                      <li>Wound Management and Basic Care</li>
                    </ul>
                  </div>
                </noscript>
                <div className="flex flex-wrap gap-3">
                  <Link to="/register">
                    <Button size="sm" className="gap-2 bg-primary text-white hover:bg-primary/90 font-semibold">
                      Find a Caregiver <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button size="sm" variant="outline" className="gap-2 border-white/40 text-white bg-white/10">
                      How It Works
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Specialties Grid ── */}
        <section className="py-10 lg:py-12 bg-[hsl(210_40%_98%)]">
          <div className="container">

            {/* Section header */}
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-border">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Specialties</p>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Available Care Services
                </h2>
              </div>
              {!isLoading && (
                <span className="text-xs text-muted-foreground hidden md:block">
                  {specialties.length} specialties available
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {specialties.map((specialty: any) => {
                  const IconComponent = iconMap[specialty.name] || Stethoscope;
                  const isExpanded = expandedId === specialty.id;
                  return (
                    <div
                      key={specialty.id}
                      className="bg-white border border-border rounded-xl p-5 flex flex-col hover:shadow-md hover:border-primary/30 transition-shadow duration-200"
                    >
                      {/* Icon + title with left border accent */}
                      <div className="flex items-start gap-3 mb-3 border-l-[3px] border-primary/60 pl-3">
                        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-4.5 w-4.5 text-primary h-[18px] w-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-sm font-bold text-foreground leading-tight">
                            {specialty.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {specialty.caregiverCount || 0} caregivers
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className={`text-xs text-muted-foreground leading-relaxed flex-grow mb-3 ${isExpanded ? "" : "line-clamp-3"}`}>
                        {specialty.description}
                      </p>

                      {specialty.description?.length > 100 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : specialty.id)}
                          className="text-xs font-medium text-primary hover:text-primary/80 mb-3 text-left flex items-center gap-1"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                          {!isExpanded && <ArrowRight className="h-3 w-3" />}
                        </button>
                      )}

                      {/* Footer */}
                      <Link
                        to={`/caregivers?specialty=${specialty.name.toLowerCase().replace(" ", "-")}`}
                        className="mt-auto pt-3 border-t border-border flex items-center justify-between group"
                      >
                        <span className="text-xs font-semibold text-primary group-hover:underline">
                          Find Caregivers
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Why Choose + Stats ── */}
        <section className="py-10 lg:py-12 bg-white border-t border-border">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-start">

              {/* Benefits list */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Why Us</p>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                  Why Choose Our Specialized Care?
                </h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Our professionals are specialists in their fields, ensuring you receive
                  the most appropriate care for your specific condition.
                </p>
                <div className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats — 2×2 clinical data grid */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted/40">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform Metrics</p>
                </div>
                <div className="grid grid-cols-2">
                {[
                  { value: platformStats ? `${platformStats.caregivers}+` : "0+", label: "Verified Caregivers", sub: "Licensed professionals" },
                  { value: platformStats ? `${platformStats.averageRating}/5` : "4.9/5", label: "Average Rating", sub: "Patient satisfaction" },
                  { value: "24/7", label: "Support Available", sub: "Round the clock" },
                  { value: `${specialties.length}`, label: "Specialties", sub: "Care categories" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`p-6 flex flex-col gap-1 bg-white hover:bg-muted/30 transition-colors
                      ${i % 2 === 0 ? "border-r border-border" : ""}
                      ${i < 2 ? "border-b border-border" : ""}
                    `}
                  >
                    <span className="text-2xl font-bold text-primary font-display">{s.value}</span>
                    <span className="text-xs font-semibold text-foreground">{s.label}</span>
                    <span className="text-xs text-muted-foreground">{s.sub}</span>
                  </div>
                ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-8 bg-[hsl(210_40%_98%)] border-t border-border">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-border rounded-xl px-10 py-10">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Ready to Find Your Specialist?
                </h2>
                <p className="text-base text-muted-foreground max-w-lg">
                  Connect with qualified caregivers in your area, delivered with compassion and expertise.
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Link to="/register">
                  <Button size="sm" className="gap-2 bg-primary text-white hover:bg-primary/90 font-semibold">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/caregivers">
                  <Button size="sm" variant="outline" className="font-semibold">
                    Browse Caregivers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Specialties;
