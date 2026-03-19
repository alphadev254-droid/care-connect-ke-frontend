import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Heart, ChevronRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="bg-white border-b border-border py-14">
      <div className="container">
        <div className="border border-border">
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">

            {/* Left — For Patients */}
            <div className="p-10 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">For Patients</p>
                  <h3 className="text-lg font-bold text-foreground font-display">Find a Caregiver Today</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse verified healthcare professionals in your area. Filter by specialty,
                location, and availability. Book appointments instantly and receive care at home.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Link to="/register">
                  <Button size="sm" className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-sm font-semibold">
                    Register as Patient <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link to="/caregivers">
                  <Button size="sm" variant="outline" className="gap-2 rounded-sm font-semibold">
                    Browse Caregivers <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — For Caregivers */}
            <div className="p-10 flex flex-col gap-6 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-sm bg-secondary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">For Caregivers</p>
                  <h3 className="text-lg font-bold text-foreground font-display">Join Our Network</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you a licensed healthcare professional? Join CareConnect to connect with
                patients who need your expertise. Manage your schedule, earn securely, and
                make a difference in your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Link to="/register">
                  <Button size="sm" className="gap-2 bg-secondary text-white hover:bg-secondary/90 rounded-sm font-semibold">
                    Register as Caregiver <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="sm" variant="outline" className="gap-2 rounded-sm font-semibold">
                    How It Works <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
