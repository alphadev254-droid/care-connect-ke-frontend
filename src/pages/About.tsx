import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Shield, 
  Users, 
  Award,
  ArrowRight,
  Star,
  Clock
} from "lucide-react";
import { CLOUDINARY_IMAGES } from "@/config/images";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We believe supportive healthcare should be delivered with empathy, understanding, and genuine care for every patient's wellbeing."
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Patient safety is our top priority. All our caregivers are thoroughly vetted, verified, and continuously monitored."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Quality supportive healthcare should be accessible to everyone, regardless of location, mobility, or economic circumstances."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards of supportive care through continuous training and quality assurance programs."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Patients Served", icon: Users },
    { number: "250+", label: "Verified Caregivers", icon: Shield },
    { number: "4.9/5", label: "Average Rating", icon: Star },
    { number: "24/7", label: "Support Available", icon: Clock }
  ];

  const milestones = [
    {
      year: "2020",
      title: "CareConnect Founded",
      description: "Started with a vision to make quality healthcare accessible at home."
    },
    {
      year: "2021",
      title: "First 1,000 Patients",
      description: "Reached our first milestone of serving 1,000 patients across Malawi."
    },
    {
      year: "2022",
      title: "Telehealth Integration",
      description: "Launched secure video consultations and remote monitoring capabilities."
    },
    {
      year: "2023",
      title: "Mobile Money Integration",
      description: "Partnered with Paychangu to enable seamless mobile money payments."
    },
    {
      year: "2024",
      title: "10,000+ Patients",
      description: "Celebrating over 10,000 patients served with 250+ verified caregivers."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About CareConnect - Quality Home Healthcare Services Across Malawi</title>
        <meta name="description" content="CareConnect connects patients with verified healthcare professionals across all regions of Malawi. Our mission: accessible, affordable, quality healthcare at home. Serving Northern, Central, and Southern regions." />
        <meta name="keywords" content="about CareConnect, healthcare platform Malawi, home care mission, verified caregivers nationwide, accessible healthcare" />
      </Helmet>
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="py-6 lg:py-8 relative bg-cover bg-top bg-no-repeat overflow-hidden"
          style={{ backgroundImage: `url(${CLOUDINARY_IMAGES.aboutUs})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
                  About <span className="text-primary">CareConnect</span>
                </h1>
                <p className="text-lg text-white/90 mb-6">
                  We connect patients with professional home-based caregivers for quality supportive health 
                  services in the comfort of home. Our verified caregivers provide compassionate assistance 
                  and monitoring services that complement your physician's medical care.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button size="lg" className="gap-2 bg-primary text-white hover:bg-primary/90">
                      Join Our Community <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button size="lg" variant="outline" className="border-white  hover:bg-white hover:text-black">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                  <div key={index} className="border border-white/20 rounded-sm p-4 bg-white/10 backdrop-blur-sm">
                    <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center mb-2">
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-white">{stat.number}</div>
                    <div className="text-xs text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-10 lg:py-12 bg-muted/30">
          <div className="container">
            <div className="mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Our Core Values</h2>
              <p className="text-muted-foreground max-w-2xl">
                These principles guide everything we do and shape how we deliver 
                supportive healthcare services to our community in partnership with physicians.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {values.map((value, index) => (
                <Card key={index} className="border-l-[3px] border-primary/60 hover:shadow-md hover:border-primary/80 transition-shadow">
                  <CardContent className="p-5">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-10 lg:py-12 bg-background">
          <div className="container">
            <div className="mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Our Journey</h2>
              <p className="text-muted-foreground max-w-2xl">
                From a simple idea to transforming healthcare delivery across Malawi.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 w-px bg-border h-full"></div>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                    <div className="flex-1">
                      <Card className="border-l-[3px] border-primary/60 hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide">{milestone.year}</span>
                          <h3 className="font-semibold text-sm mt-1 mb-1">{milestone.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="flex-shrink-0 relative z-10">
                      <div className="h-8 w-8 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 lg:py-12">
          <div className="container">
            <div className="border border-border rounded-sm px-10 py-10">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-3">Ready to Transform Healthcare Together?</h2>
                  <p className="text-base text-muted-foreground max-w-lg">
                    Join thousands of patients and caregivers who are revolutionizing healthcare delivery in Malawi.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                  <Link to="/register">
                    <Button size="lg" className="gap-2 bg-primary text-white hover:bg-primary/90">
                      Get Started <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/caregivers">
                    <Button size="lg" variant="outline">Find Caregivers</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;