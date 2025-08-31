import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Star, Clock, Users, Award, ArrowRight, Utensils, Heart, Globe } from "lucide-react";
import heroImage from "@/assets/hero-thai-dishes.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";

const Index = () => {
  const features = [
    {
      icon: Utensils,
      title: "Authentic Recipes",
      description: "Traditional Thai dishes passed down through generations"
    },
    {
      icon: Heart,
      title: "Fresh Ingredients",
      description: "Daily sourced premium ingredients for the perfect taste"
    },
    {
      icon: Globe,
      title: "Thai Culture",
      description: "Experience the warmth of Thai hospitality and tradition"
    }
  ];

  const stats = [
    { icon: Star, value: "4.9", label: "Rating" },
    { icon: Clock, value: "25+", label: "Years Experience" },
    { icon: Users, value: "10K+", label: "Happy Customers" },
    { icon: Award, value: "15+", label: "Awards Won" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      text: "The best Thai food I've ever had! The pad thai is absolutely incredible."
    },
    {
      name: "Michael Chen",
      rating: 5,
      text: "Authentic flavors and amazing service. This place feels like Thailand!"
    },
    {
      name: "Emma Davis",
      rating: 5,
      text: "Every dish is a masterpiece. The atmosphere is so warm and welcoming."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-thai-charcoal/60"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="text-thai-gold">Garoon Thai</span>
            </h1>
            <p className="text-xl md:text-2xl text-thai-beige-light mb-8 leading-relaxed">
              Experience the authentic flavors of Thailand with our traditional recipes,
              fresh ingredients, and warm hospitality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/menu">
                  View Our Menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="elegant" size="xl">
                Order for Delivery
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-thai-gold/20 rounded-full animate-float"></div>
        <div className="absolute bottom-32 right-16 w-12 h-12 bg-thai-red/30 rounded-full animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-16 w-8 h-8 bg-thai-green/40 rounded-full animate-float" style={{ animationDelay: "2s" }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-thai-gold">Garoon Thai</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We bring you the authentic taste of Thailand with every dish crafted to perfection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-elegant border-thai-gold/20 animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-hero-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-thai-charcoal" />
                  </div>
                  <h3 className="font-playfair text-xl font-semibold mb-4 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-thai-charcoal">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-12 h-12 bg-hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-thai-charcoal" />
                </div>
                <div className="text-3xl font-bold text-thai-gold mb-2">{stat.value}</div>
                <div className="text-thai-beige-light text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
                Our <span className="text-thai-gold">Story</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                For over 25 years, Garoon Thai has been bringing authentic Thai flavors to our community. 
                Our journey began with a simple mission: to share the rich culinary heritage of Thailand 
                through traditional recipes passed down through generations.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Every dish is prepared with love, using the finest ingredients and time-honored techniques 
                that capture the essence of Thai cuisine.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="animate-scale-in">
              <img 
                src={restaurantInterior} 
                alt="Garoon Thai Restaurant Interior" 
                className="rounded-lg shadow-elegant w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-thai-beige-light/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              What Our <span className="text-thai-gold">Customers Say</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-elegant border-thai-gold/20 animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-thai-gold fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="font-semibold text-foreground">
                    - {testimonial.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-thai-charcoal mb-6">
              Ready to Experience Thai Excellence?
            </h2>
            <p className="text-xl text-thai-charcoal/80 mb-8">
              Visit us today or order online for an authentic Thai dining experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="elegant" size="xl">
                Reserve a Table
              </Button>
              <Button variant="accent" size="xl">
                Order for Pickup
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;