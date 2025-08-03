import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              GET IN TOUCH
            </h1>
            <div className="w-24 h-0.5 bg-brand-black mx-auto mb-6"></div>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Have a question, feedback, or just want to say hello? We'd love to hear from you. 
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
                        <a href="mailto:hello@sohrel.com" className="text-muted-foreground hover:text-foreground transition-colors block">
                          hello@sohrel.com
                        </a>
                        <a href="mailto:support@sohrel.com" className="text-muted-foreground hover:text-foreground transition-colors block">
                          support@sohrel.com
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
                        <a href="tel:+94701234567" className="text-muted-foreground hover:text-foreground transition-colors block">
                          +94 70 123 4567
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Mon-Fri, 9AM-6PM</p>
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
                      <div className="text-muted-foreground space-y-1">
                        <p>123 Main Street</p>
                        <p>Colombo 00100</p>
                        <p>Western Province, Sri Lanka</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">By appointment only</p>
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
                      <div className="text-muted-foreground space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Monday - Friday</span>
                          <span>9:00 AM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday</span>
                          <span>10:00 AM - 4:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday</span>
                          <span>Closed</span>
                        </div>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">Currently Open</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Contact Form - 3 columns */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-brand-border">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="w-6 h-6 text-brand-black" />
                    <h2 className="text-2xl font-semibold text-foreground">Send us a Message</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className="h-12 border-brand-border focus:border-brand-black transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        required
                        className="h-12 border-brand-border focus:border-brand-black transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-foreground font-medium">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this regarding?"
                      required
                      className="h-12 border-brand-border focus:border-brand-black transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      required
                      rows={6}
                      className="border-brand-border focus:border-brand-black transition-colors resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.message.length}/500 characters
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto bg-brand-black text-brand-white border-2 border-brand-black px-8 py-3 h-12 font-medium uppercase tracking-wider transition-all duration-300 hover:bg-transparent hover:text-brand-black disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          SENDING...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          SEND MESSAGE
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-brand-border">
                  <p className="text-sm text-muted-foreground text-center">
                    By submitting this form, you agree to our Privacy Policy and Terms of Service.
                  </p>
                </div>
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
                <a href="mailto:support@sohrel.com" className="text-sm font-medium text-brand-black hover:underline">
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
                <a href="mailto:hello@sohrel.com" className="text-sm font-medium text-brand-black hover:underline">
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
                <a href="mailto:hello@sohrel.com" className="text-sm font-medium text-brand-black hover:underline">
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