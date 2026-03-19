import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import {
  Stethoscope, Brain, Baby, Activity, Heart, Pill, Eye, Bone, ArrowRight, Loader2, Users,
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
};

const SpecialtiesSection = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: specialtiesData, isLoading } = useQuery({
    queryKey: ["specialties-with-counts"],
    queryFn: async () => {
      const response = await api.get("/public/specialties");
      return response.data.specialties || [];
    },
  });

  const specialties = specialtiesData || [];

  return (
    <section className="bg-muted/30 border-b border-border py-14">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Services</p>
            <h2 className="text-2xl font-bold text-foreground font-display">Healthcare Specialties</h2>
          </div>
          <Link to="/specialties" className="hidden md:flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border">
              {specialties.map((specialty: any) => {
                const IconComponent = iconMap[specialty.name] || Stethoscope;
                const isExpanded = expandedId === specialty.id;
                return (
                  <div
                    key={specialty.id}
                    className="bg-white p-6 flex flex-col hover:bg-primary/5 transition-colors group"
                  >
                    {/* Icon + name row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-8 w-8 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground leading-tight pt-1">{specialty.name}</h3>
                    </div>

                    {/* Description */}
                    <p className={`text-xs text-muted-foreground leading-relaxed flex-grow mb-3 ${isExpanded ? "" : "line-clamp-3"}`}>
                      {specialty.description}
                    </p>

                    {specialty.description?.length > 100 && (
                      <button
                        onClick={(e) => { e.preventDefault(); setExpandedId(isExpanded ? null : specialty.id); }}
                        className="text-[10px] text-primary font-semibold uppercase tracking-wide mb-3 text-left"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}

                    {/* Footer row */}
                    <Link
                      to={`/caregivers?specialty=${specialty.name.toLowerCase().replace(" ", "-")}`}
                      className="flex items-center justify-between pt-3 border-t border-border mt-auto"
                    >
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {specialty.caregiverCount || 0} caregivers
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center md:hidden">
              <Link to="/specialties">
                <Button variant="outline" size="sm" className="gap-2 rounded-sm">
                  View All Specialties <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SpecialtiesSection;
