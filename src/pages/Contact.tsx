import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { faqSchema } from "@/lib/structuredData";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  Globe
} from "lucide-react";
import { CLOUDINARY_IMAGES } from "@/config/images";

const Contact = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+265 986 227 240",
      availability: "24/7 Emergency Support"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us your questions or concerns",
      contact: "support@careconnectmalawi.com",
      availability: "Response within 2 hours"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Quick support via WhatsApp",
      contact: "+265 991 234 567",
      availability: "Mon-Fri, 8AM-6PM"
    },
    {
      icon: Globe,
      title: "Online Chat",
      description: "Live chat with our support team",
      contact: "Available on website",
      availability: "Mon-Sun, 6AM-10PM"
    }
  ];

  const offices = [
    {
      city: "Lilongwe",
      address: "Area 58, Lilongwe, Central Region, Malawi",
      phone: "+265 986 227 240",
      email: "support@careconnectmalawi.com"
    },
    {
      city: "Blantyre",
      address: "Limbe, Makata Road, Building 45",
      phone: "+265 986 227 240",
      email: "support@careconnectmalawi.com"
    },
    {
      city: "Mzuzu",
      address: "Mzimba Street, Near Central Hospital",
      phone: "+265 986 227 240",
      email: "support@careconnectmalawi.com"
    }
  ];

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "Simply register on our platform, browse available caregivers, and book your preferred time slot. You'll receive instant confirmation."
    },
    {
      question: "Are all caregivers verified?",
      answer: "Yes, all our caregivers undergo thorough background checks, license verification, and skills assessment before joining our platform."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept mobile money (Airtel Money, TNM Mpamba), bank transfers, and credit/debit cards through our secure Paychangu integration."
    },
    {
      question: "Do you provide emergency services?",
      answer: "While we don't replace emergency services, we offer 24/7 support and can help coordinate urgent care needs with appropriate medical facilities."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Us | CareConnect Malawi - 24/7 Support</title>
        <meta name="description" content="Contact CareConnect Malawi for home healthcare services. Call +265 986 227 240 or email support@careconnectmalawi.com. Offices in Lilongwe, Blantyre & Mzuzu." />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema(faqs))}
        </script>
      </Helmet>
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="py-6 lg:py-8 relative bg-cover bg-no-repeat overflow-hidden"
          style={{ backgroundImage: `url(${CLOUDINARY_IMAGES.contact})`, backgroundPosition: '0 45%' }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
                  Get in <span className="text-primary">Touch</span>
                </h1>
                <p className="text-lg text-white/90 mb-6">
                  We're here to help! Whether you have questions about our services, 
                  need technical support, or want to provide feedback, our team is ready to assist you.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="gap-2 bg-primary text-white hover:bg-primary/90">
                    <Phone className="h-5 w-5" />
                    Call Us Now
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 gap-2">
                    <Mail className="h-5 w-5" />
                    Email Us
                  </Button>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-3">
                {[
                  { icon: Phone, label: "Phone", value: "+265 986 227 240" },
                  { icon: Mail, label: "Email", value: "support@careconnectmalawi.com" },
                  { icon: MessageCircle, label: "WhatsApp", value: "+265 991 234 567" },
                  { icon: Clock, label: "Support", value: "24/7 Available" },
                ].map((item, i) => (
                  <div key={i} className="border border-white/20 rounded-sm p-4 bg-white/10 backdrop-blur-sm">
                    <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center mb-2">
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xs font-bold text-white">{item.value}</div>
                    <div className="text-xs text-white/70">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-10 lg:py-12">
          <div className="container">
            <div className="mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Multiple Ways to Reach Us</h2>
              <p className="text-muted-foreground max-w-2xl">
                Choose the contact method that works best for you.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactMethods.map((method, index) => (
                <Card key={index} className="border-l-[3px] border-primary/60 hover:shadow-md hover:border-primary/80 transition-shadow">
                  <CardContent className="p-5">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                      <method.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{method.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{method.description}</p>
                    <div className="text-primary font-medium text-xs mb-1">{method.contact}</div>
                    <div className="text-xs text-muted-foreground">{method.availability}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Office Locations */}
        <section className="py-10 lg:py-12 bg-muted/30">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Contact Form */}
              <Card className="border-t-2 border-primary/40">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-base mb-1">Send us a Message</h3>
                  <p className="text-xs text-muted-foreground mb-5">Fill out the form and we'll get back to you as soon as possible.</p>
                  <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-xs">First Name</Label>
                        <Input id="firstName" placeholder="Your first name" className="h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                        <Input id="lastName" placeholder="Your last name" className="h-9" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input id="email" type="email" placeholder="your.email@example.com" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                      <Input id="phone" placeholder="+265 991 234 567" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className="text-xs">Subject</Label>
                      <Input id="subject" placeholder="How can we help you?" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="text-xs">Message</Label>
                      <Textarea id="message" placeholder="Please describe your question or concern..." rows={4} />
                    </div>
                    <Button className="w-full gap-2 bg-primary text-white hover:bg-primary/90">
                      <Send className="h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Office Locations */}
              <div className="space-y-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-base mb-1">Our Offices</h3>
                  <p className="text-xs text-muted-foreground">Visit us at any of our locations across Malawi.</p>
                </div>
                {offices.map((office, index) => (
                  <Card key={index} className="border-l-[3px] border-primary/60 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2">{office.city}</h4>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span>{office.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{office.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span>{office.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-10 lg:py-12">
          <div className="container">
            <div className="mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl">Quick answers to common questions. Can't find what you're looking for? Contact us directly.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-l-[3px] border-primary/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm mb-2">{faq.question}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-10 lg:py-12 bg-muted/30">
          <div className="container">
            <div className="border border-border rounded-sm px-10 py-10">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-3">Emergency Support</h2>
                  <p className="text-base text-muted-foreground max-w-lg">
                    For urgent situations, call our 24/7 emergency hotline. Our team will help coordinate immediate care or direct you to appropriate emergency services.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                  <Button size="lg" className="gap-2 bg-red-600 text-white hover:bg-red-700">
                    <Phone className="h-5 w-5" />
                    Call +265 986 227 240
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Emergency
                  </Button>
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

export default Contact;