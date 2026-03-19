import { Video, Shield, Clock, FileText, CreditCard, Bell, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Caregivers",
    description: "Every caregiver undergoes thorough background checks, license verification, and credential validation.",
    tag: "Trust & Safety",
  },
  {
    icon: Video,
    title: "Teleconference Sessions",
    description: "Connect with caregivers via secure video calls for consultations, follow-ups, and remote monitoring.",
    tag: "Telehealth",
  },
  {
    icon: FileText,
    title: "Detailed Care Reports",
    description: "Receive comprehensive reports after each session including vitals, observations, and recommendations.",
    tag: "Documentation",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Book appointments any time of day. Emergency care coordination available around the clock.",
    tag: "Availability",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Multiple payment options including mobile money and bank transfers. Fully transparent pricing.",
    tag: "Payments",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated reminders for appointments, medication schedules, and important health updates.",
    tag: "Alerts",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description: "Our support team is always ready to assist with any questions or concerns you may have.",
    tag: "Support",
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-white border-b border-border py-14">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Platform</p>
            <h2 className="text-2xl font-bold text-foreground font-display">Platform Capabilities</h2>
          </div>
          <span className="text-xs text-muted-foreground hidden md:block">{features.length} core features</span>
        </div>

        {/* Feature grid — clinical table style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border border border-border">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white p-6 flex flex-col gap-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-sm bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-4.5 w-4.5 text-primary h-[18px] w-[18px]" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground font-display">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
          {/* Filler cell to complete the grid visually */}
          <div className="bg-muted/20 hidden xl:block" />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
