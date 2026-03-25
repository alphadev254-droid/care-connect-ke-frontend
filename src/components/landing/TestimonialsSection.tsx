import { Star } from "lucide-react";
import { usePublicStats } from "@/hooks/usePublicStats";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    rating: 5,
    content:
      "TunzaConnect has been a blessing for our family. The caregiver assigned to my mother is incredibly professional and caring. The detailed reports keep us informed every step of the way.",
  },
  {
    name: "Grace Okonkwo",
    role: "Caregiver",
    rating: 5,
    content:
      "Being a caregiver on TunzaConnect has been rewarding. The platform is user-friendly, payments are prompt, and I can manage my schedule flexibly while helping patients.",
  },
  {
    name: "James Muthoni",
    role: "Patient",
    rating: 5,
    content:
      "After my surgery, I needed physiotherapy at home. TunzaConnect matched me with an excellent therapist. The teleconference feature made follow-ups so convenient.",
  },
  {
    name: "Mary Banda",
    role: "Caregiver",
    rating: 5,
    content:
      "Working through TunzaConnect has allowed me to help families in my community while earning a good income. The support from the platform team is excellent.",
  },
];

const TestimonialsSection = () => {
  const { data } = usePublicStats();
  const averageRating = data?.averageRating || "4.9";
  return (
    <section className="bg-muted/30 border-b border-border py-14">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Reviews</p>
            <h2 className="text-2xl font-bold text-foreground font-display">Patient & Caregiver Feedback</h2>
          </div>
          <span className="text-xs text-muted-foreground hidden md:block">{averageRating}/5 average · {testimonials.length} verified reviews</span>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white p-6 flex flex-col gap-4">
              {/* Rating row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                  {t.role}
                </span>
              </div>

              {/* Quote */}
              <p className="text-sm text-foreground leading-relaxed flex-grow">
                "{t.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-foreground">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
