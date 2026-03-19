import { Search, Calendar, Heart } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Find Your Caregiver",
    description:
      "Browse our network of verified caregivers filtered by specialty, location, availability, and ratings. View detailed profiles and credentials.",
    tag: "Discovery",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Book an Appointment",
    description:
      "Select your preferred date and time. Our flexible scheduling works around your needs. Get instant confirmation and automated reminders.",
    tag: "Scheduling",
  },
  {
    icon: Heart,
    step: "03",
    title: "Receive Quality Care",
    description:
      "Your caregiver arrives at your home. Track progress through detailed care reports after every session and stay connected with your care team.",
    tag: "Care Delivery",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="bg-white border-b border-border py-14">
      <div className="container">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Process</p>
            <h2 className="text-2xl font-bold text-foreground font-display">How CareConnect Works</h2>
          </div>
          <span className="text-xs text-muted-foreground hidden md:block">3-step care delivery process</span>
        </div>

        {/* Steps — horizontal table-like layout */}
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border border-border rounded-sm overflow-hidden">
          {steps.map((item, index) => (
            <div key={item.step} className="p-8 bg-white hover:bg-muted/30 transition-colors">
              {/* Step number + tag */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-primary/15 font-display leading-none">{item.step}</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                  {item.tag}
                </span>
              </div>

              {/* Icon */}
              <div className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-foreground mb-2 font-display">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
