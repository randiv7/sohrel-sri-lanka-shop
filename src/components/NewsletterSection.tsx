import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletters')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Successfully subscribed!",
          description: "Thank you for joining the SOHREL community.",
        });
        setEmail("");
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding bg-brand-black text-brand-white">
      <div className="container-sohrel">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-section-title mb-6 text-brand-white">
            STAY UPDATED
          </h2>
          <p className="text-lg text-brand-white/80 mb-8 font-accent">
            Be the first to know about new collections, exclusive drops, 
            and special events from SOHREL.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-brand-white text-brand-black border-brand-white placeholder:text-muted-foreground"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="btn-sohrel-secondary bg-transparent text-brand-white border-brand-white hover:bg-brand-white hover:text-brand-black sm:px-8"
            >
              {loading ? "SUBSCRIBING..." : "SUBSCRIBE"}
            </Button>
          </form>
          <p className="text-xs text-brand-white/60 mt-4">
            By subscribing, you agree to receive marketing emails from SOHREL.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;