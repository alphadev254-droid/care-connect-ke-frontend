import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Search,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Users,
  Shield,
  Clock,
} from "lucide-react";
import { CLOUDINARY_IMAGES } from "@/config/images";

const steps = [
  {
    icon: Search,
    title: "Find Your Caregiver",
    description:
      "Browse our verified caregivers by specialty, location, and availability. Read reviews and compare profiles to find the right fit for your needs.",
    image: CLOUDINARY_IMAGES.findCaregiver,
    details: [
      "Search by medical specialty",
      "Filter by location & availability",
      "View caregiver credentials",
      "Read patient reviews",
    ],
    color: "bg-blue-50 border-blue-100",
    nodeColor: "bg-primary",
  },
  {
    icon: Calendar,
    title: "Book an Appointment",
    description:
      "Schedule your care session at your convenience. Choose between in-person visits or teleconference sessions and get instant confirmation.",
    image: CLOUDINARY_IMAGES.bookAppointment,
    details: [
      "Flexible scheduling",
      "In-person or virtual care",
      "Instant confirmation",
      "Automated reminders",
    ],
    color: "bg-green-50 border-green-100",
    nodeColor: "bg-secondary",
  },
  {
    icon: Users,
    title: "Receive Care at Home",
    description:
      "Your verified caregiver arrives at your home fully prepared. Receive professional, compassionate supportive care in a familiar environment.",
    image: CLOUDINARY_IMAGES.findCaregiver,
    details: [
      "Professional home care",
      "Patient-centered support",
      "Real-time assistance",
      "Emergency care available",
    ],
    color: "bg-orange-50 border-orange-100",
    nodeColor: "bg-accent",
  },
  {
    icon: FileText,
    title: "Receive Your Care Report",
    description:
      "After every session, receive a detailed care report with observations, health updates, and recommendations for your physician.",
    image: CLOUDINARY_IMAGES.careReport,
    details: [
      "Session summaries",
      "Health observations",
      "Care recommendations",
      "Progress tracking",
    ],
    color: "bg-blue-50 border-blue-100",
    nodeColor: "bg-primary",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description:
      "Pay securely through our platform using multiple payment options. Every transaction is encrypted and a digital receipt is issued instantly.",
    image: CLOUDINARY_IMAGES.payment,
    details: [
      "Mobile money support",
      "Card & wallet payments",
      "Secure transactions",
      "Digital receipts",
    ],
    color: "bg-green-50 border-green-100",
    nodeColor: "bg-secondary",
  },
];

const benefits = [
  {
    icon: Users,
    title: "Verified Caregivers",
    description: "All caregivers are professionally verified and background-checked for your safety.",
    bg: "bg-blue-50",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Your health data is protected with end-to-end encryption and strict privacy standards.",
    bg: "bg-green-50",
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our support team is available around the clock to assist you whenever you need help.",
    bg: "bg-orange-50",
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>How CareConnect Works - Book Home Healthcare Services in 3 Easy Steps</title>
        <meta name="description" content="Easy 3-step process: Find a caregiver in your region, book appointment, receive quality care at home. Secure payments, verified professionals, quality home healthcare across all Malawi regions." />
        <meta name="keywords" content="book healthcare Malawi, how to book caregiver, home healthcare booking, find caregiver near me, healthcare appointment booking" />
      </Helmet>
      <Header />

      <main>
        {/* ── Hero ── */}
        <section
          className="py-6 lg:py-8 relative bg-cover bg-center overflow-hidden rounded-b-3xl"
          style={{ backgroundImage: `url(${CLOUDINARY_IMAGES.howItWorks})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="container relative z-10">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-white/70 mb-3">
                Care Process
              </span>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                How <span className="text-primary">CareConnect</span> Works
              </h1>
              <p className="text-white/80 text-base mb-8 max-w-lg leading-relaxed">
                A simple, transparent 5-step process — from finding your caregiver
                to receiving care and your detailed health report.
              </p>
              <Link to="/register">
                <Button className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-md font-semibold">
                  Get Started Today <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="py-16 lg:py-24 bg-[hsl(210_40%_98%)]">
          <div className="container">

            {/* Section label */}
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Step by Step</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Your Care Journey
              </h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                Follow these five steps to connect with a verified caregiver and receive quality home care.
              </p>
            </div>

            {/* Timeline wrapper */}
            <div className="relative">

              {/* Center vertical line — hidden on mobile, visible md+ */}
              <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-12 md:space-y-4">
                {steps.map((step, index) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <div key={index} className="relative md:grid md:grid-cols-2 md:gap-8 md:items-center md:min-h-[260px]">

                      {/* ── Timeline node (center) ── */}
                      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 flex-col items-center">
                        <div className={`h-12 w-12 rounded-full ${step.nodeColor} text-white flex items-center justify-center shadow-md border-4 border-white`}>
                          <span className="text-sm font-bold">{String(index + 1).padStart(2, "0")}</span>
                        </div>
                      </div>

                      {/* ── Left slot ── */}
                      <div className={`${isLeft ? "md:pr-12" : "md:order-2 md:pl-12"}`}>
                        {isLeft ? (
                          <StepCard step={step} index={index} />
                        ) : (
                          <StepImage step={step} />
                        )}
                      </div>

                      {/* ── Right slot ── */}
                      <div className={`mt-4 md:mt-0 ${isLeft ? "md:pl-12" : "md:order-1 md:pr-12"}`}>
                        {isLeft ? (
                          <StepImage step={step} />
                        ) : (
                          <StepCard step={step} index={index} />
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-14 lg:py-20 bg-white border-t border-border">
          <div className="container">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Why Us</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Why Choose CareConnect?
              </h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                Built for trust, safety, and the human touch.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white border border-border rounded-xl p-8 flex flex-col items-center text-center gap-4">
                  <div className={`h-14 w-14 rounded-full ${b.iconBg} flex items-center justify-center`}>
                    <b.icon className={`h-7 w-7 ${b.iconColor}`} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-14 bg-[hsl(210_40%_98%)] border-t border-border">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                Join thousands of patients who trust CareConnect for their home healthcare needs.
                Register today and connect with a verified caregiver near you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register">
                  <Button className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-md font-semibold px-8">
                    Register Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/caregivers">
                  <Button variant="outline" className="gap-2 rounded-md font-semibold px-8">
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

/* ── Sub-components ── */

const StepCard = ({ step, index }: { step: typeof steps[0]; index: number }) => (
  <div className={`rounded-xl border ${step.color} p-6 shadow-sm`}>
    {/* Mobile step number */}
    <div className="flex items-center gap-3 mb-4 md:hidden">
      <div className={`h-9 w-9 rounded-full ${step.nodeColor} text-white flex items-center justify-center text-sm font-bold shadow`}>
        {String(index + 1).padStart(2, "0")}
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step {index + 1}</span>
    </div>

    {/* Icon + title */}
    <div className="flex items-start gap-3 mb-3">
      <div className="h-10 w-10 rounded-lg bg-white border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
        <step.icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <span className="hidden md:block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
          Step {index + 1}
        </span>
        <h3 className="font-display text-lg font-bold text-foreground leading-tight">{step.title}</h3>
      </div>
    </div>

    {/* Description */}
    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>

    {/* Checklist */}
    <ul className="space-y-2">
      {step.details.map((d, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
          {d}
        </li>
      ))}
    </ul>
  </div>
);

const StepImage = ({ step }: { step: typeof steps[0] }) => (
  <div className="rounded-xl overflow-hidden border border-border shadow-sm">
    <img
      src={step.image}
      alt={step.title}
      className="w-full h-56 md:h-64 object-cover"
      loading="lazy"
    />
  </div>
);

export default HowItWorks;
