import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you within 24 hours.",
    });
    
    reset();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-brand-black to-gray-900 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We'd love to hear from you. 
              Reach out and we'll get back to you within 24 hours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
          {/* Enhanced Contact Information - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Cards with improved styling */}
            <div className="space-y-4">
              <Card className="group hover:shadow-lg transition-all duration-300 border-brand-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-brand-black text-brand-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Email Us</h3>
                      <div className="space-y-1">
                        <a href="mailto:hello@liora.lk" className="text-muted-foreground hover:text-foreground transition-colors block">
                          hello@liora.lk
                        </a>
                        <a href="mailto:support@liora.lk" className="text-muted-foreground hover:text-foreground transition-colors block">
                          support@liora.lk
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Response within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-brand-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-brand-black text-brand-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Call Us</h3>
                      <div className="space-y-1">
                        <a href="tel:+94112345678" className="text-muted-foreground hover:text-foreground transition-colors block">
                          +94 11 234 5678
                        </a>
                        <a href="tel:+94771234567" className="text-muted-foreground hover:text-foreground transition-colors block">
                          +94 77 123 4567
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Mon-Fri 9AM-6PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-brand-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-brand-black text-brand-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Visit Us</h3>
                      <address className="text-muted-foreground not-italic leading-relaxed">
                        123 Galle Road<br />
                        Colombo 03<br />
                        Sri Lanka
                      </address>
                      <p className="text-sm text-muted-foreground mt-2">Open Mon-Sat 10AM-8PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-brand-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-brand-black text-brand-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Business Hours</h3>
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Monday - Friday</span>
                          <span>9AM - 6PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday</span>
                          <span>10AM - 4PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday</span>
                          <span>Closed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form - 3 columns */}
          <div className="lg:col-span-3">
            <Card className="border-brand-border">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Send us a message</h2>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        {...register("name")}
                        className="border-brand-border focus:border-brand-black"
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="border-brand-border focus:border-brand-black"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      {...register("subject")}
                      className="border-brand-border focus:border-brand-black"
                      placeholder="What's this about?"
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      rows={6}
                      className="border-brand-border focus:border-brand-black resize-none"
                      placeholder="Tell us what's on your mind..."
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-black hover:bg-gray-800 text-brand-white py-3 h-auto font-medium tracking-wide transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find quick answers to common questions, or contact us for personalized support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-left border-brand-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Order Support</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Questions about your order, shipping, or returns? We're here to help.
                </p>
                <a href="mailto:support@liora.lk" className="text-sm font-medium text-brand-black hover:underline">
                  Contact Order Support →
                </a>
              </CardContent>
            </Card>

            <Card className="text-left border-brand-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Product Information</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Need details about sizing, materials, or care instructions?
                </p>
                <a href="mailto:hello@liora.lk" className="text-sm font-medium text-brand-black hover:underline">
                  Ask About Products →
                </a>
              </CardContent>
            </Card>

            <Card className="text-left border-brand-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Partnerships</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Interested in collaborating or wholesale opportunities?
                </p>
                <a href="mailto:hello@liora.lk" className="text-sm font-medium text-brand-black hover:underline">
                  Discuss Partnership →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;