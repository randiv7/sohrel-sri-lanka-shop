import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight">
            LIORA
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Redefining casual wear through minimalist design, premium quality, and timeless style.
          </p>
        </div>

        {/* Story Section */}
        <div className="mb-20">
          <div className="prose prose-lg mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 tracking-tight">
              Our Story
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                Founded with a vision to create the perfect t-shirt, Liora began as a pursuit 
                of simplicity in a world of complexity. We believe that true style lies not in 
                excess, but in the careful curation of essential pieces.
              </p>
              <p className="text-lg">
                Every thread, every cut, every detail is considered with the understanding that 
                what you wear should enhance who you are, not overshadow it. We craft garments 
                that become better with time, like the confidence they inspire.
              </p>
              <p className="text-lg">
                Liora represents more than clothing—it's a philosophy of intentional living, 
                where quality supersedes quantity, and authenticity outweighs trends.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-foreground mb-16 tracking-tight">
            What Drives Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-background rounded-sm"></div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Simplicity</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We strip away the unnecessary to reveal what truly matters—clean lines, 
                  perfect fits, and timeless appeal.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-6 h-6 border border-foreground rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Premium materials and meticulous craftsmanship ensure each piece 
                  becomes a lasting part of your wardrobe.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-foreground rounded-sm flex items-center justify-center mx-auto mb-6">
                  <div className="w-4 h-4 bg-background"></div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Authenticity</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We create for individuals who value substance over spectacle, 
                  quality over quantity, and confidence over conformity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mb-20">
          <Card className="border-2 border-foreground bg-transparent">
            <CardContent className="p-12 text-center">
              <blockquote className="text-2xl md:text-3xl font-light text-foreground leading-relaxed">
                "To create clothing that empowers authentic self-expression through 
                the marriage of minimalist design and uncompromising quality."
              </blockquote>
              <div className="mt-8">
                <div className="w-12 h-0.5 bg-foreground mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-foreground mb-16 tracking-tight">
            Our Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">Design Philosophy</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Each design begins with a question: what can we remove while adding value? 
                Our process involves extensive research into fabric behavior, fit dynamics, 
                and the psychology of comfort.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We test extensively, refine relentlessly, and only release pieces that 
                meet our exacting standards for both aesthetic appeal and functional excellence.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-foreground rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Research & Ideation</h4>
                  <p className="text-sm text-muted-foreground">Understanding needs before creating solutions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-foreground rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Material Selection</h4>
                  <p className="text-sm text-muted-foreground">Sourcing the finest fabrics for comfort and durability</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-foreground rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Precision Crafting</h4>
                  <p className="text-sm text-muted-foreground">Meticulous attention to every stitch and seam</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-foreground rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Quality Assurance</h4>
                  <p className="text-sm text-muted-foreground">Rigorous testing ensures lasting quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability Section */}
        <div className="mb-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 tracking-tight">
              Conscious Creation
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Sustainability isn't an afterthought—it's integral to everything we do. From our choice 
              of organic materials to our zero-waste production methods, we're committed to creating 
              beautiful clothing without compromising our planet's future.
            </p>
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-foreground mb-2">100%</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">Organic Cotton</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-2">Zero</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">Waste Production</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-2">Carbon</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">Neutral Shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 tracking-tight">
            Join the Movement
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover clothing that reflects your values and enhances your authentic self. 
            Every piece tells a story—let yours be one of intention and style.
          </p>
          <Button asChild size="lg" className="px-12 py-6 text-lg">
            <Link to="/shop">
              Explore Collection
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;