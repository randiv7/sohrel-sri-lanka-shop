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
        if (error.code === '23505') {
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
    <section className="py-24 md:py-32 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 font-heading uppercase">
            Stay Updated
          </h2>
          <div className="w-24 h-px bg-white mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            Be the first to know about new collections, exclusive drops, 
            and special events from SOHREL.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent border-white text-white placeholder:text-white/60 focus:border-white focus:ring-white h-12 px-4"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-white text-black hover:bg-gray-100 text-sm font-medium uppercase tracking-widest px-8 py-3 h-12 transition-all duration-300 whitespace-nowrap"
            >
              {loading ? "SUBSCRIBING..." : "SUBSCRIBE"}
            </Button>
          </div>
        </form>
        
        <p className="text-xs text-white/60 mt-8 max-w-md mx-auto leading-relaxed">
          By subscribing, you agree to receive marketing emails from SOHREL. 
          You can unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;