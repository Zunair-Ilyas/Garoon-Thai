import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { MapPin, Phone, Mail, Clock, Users, Award, Heart, Utensils } from "lucide-react";
import chefPortrait from "../assets/Chef.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Passion",
      description: "Every dish is prepared with love and dedication to authentic Thai flavors"
    },
    {
      icon: Users,
      title: "Community",
      description: "We believe food brings people together and creates lasting memories"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for perfection in every aspect of our service and cuisine"
    },
    {
      icon: Utensils,
      title: "Tradition",
      description: "Honoring authentic Thai cooking methods passed down through generations"
    }
  ];

  const timeline = [
    {
      year: "1998",
      title: "The Beginning",
      description: "Founded by Chef Somchai with a dream to share authentic Thai cuisine"
    },
    {
      year: "2005",
      title: "Recognition",
      description: "Awarded 'Best Thai Restaurant' by the local culinary association"
    },
    {
      year: "2012",
      title: "Expansion",
      description: "Renovated and expanded to accommodate our growing family of guests"
    },
    {
      year: "2020",
      title: "Innovation",
      description: "Launched online ordering and delivery to serve our community safely"
    },
    {
      year: "2023",
      title: "25 Years Strong",
      description: "Celebrating 25 years of bringing Thailand to your table"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-thai-charcoal mb-4">
            About Garoon Thai
          </h1>
          <p className="text-xl text-thai-charcoal/80 max-w-2xl mx-auto">
            A journey of 25 years bringing authentic Thai flavors to your table
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
                Our <span className="text-thai-gold">Journey</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Since 2018 Mai (service) and Gong (kitchen) have been the main-stay of EasyGo Thai.
                In February 2023 they bought EasyGo Thai and started working on refreshing and improving
                every aspect of the restaurant
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                As a team they are unbeatable; Mai with her years of experience as customer service superstar both in NZ and Thailand,
                and Gong with 18 years of consistent high standards as chef / head chef in several well-known B.O.P. Asian restaurants ….
                Both are passionate about what they do, are skilled at their jobs, and are certainly not scared to face the hard work and
                long hours demanded to be successful in the hospitality industry – and both describe themselves as “perfectionists”.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                EasyGo Thai restaurant will benefit from their efforts, we invite you to come and join the journey
                and encourage you to give feedback on your experience.
              </p>
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

      {/* Values Section */}
      <section className="py-20 bg-thai-beige-light/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our <span className="text-thai-gold">Values</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at Garoon Thai
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="card-elegant border-thai-gold/20 text-center animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-thai-charcoal" />
                  </div>
                  <h3 className="font-playfair text-xl font-semibold mb-3 text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Chef Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-scale-in">
              <img 
                src={chefPortrait} 
                alt="Chef Somchai - Head Chef at Garoon Thai" 
                className="rounded-lg shadow-elegant w-full h-auto"
              />
            </div>
            <div className="animate-fade-in-up">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
                Meet Chef <span className="text-thai-gold">Somchai</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Chef Somchai brings over 30 years of culinary expertise to Garoon Thai. Born and raised 
                in Bangkok, he learned the art of Thai cooking from his grandmother, who ran a small 
                street food stall in the bustling markets of Thailand.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                His passion for authentic flavors and dedication to traditional cooking methods has earned 
                him recognition throughout the culinary community. Chef Somchai personally oversees every 
                dish that leaves our kitchen, ensuring it meets the highest standards of taste and presentation.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-thai-gold/10 px-4 py-2 rounded-lg">
                  <span className="text-thai-gold font-semibold">30+ Years Experience</span>
                </div>
                <div className="bg-thai-red/10 px-4 py-2 rounded-lg">
                  <span className="text-thai-red font-semibold">Bangkok Native</span>
                </div>
                <div className="bg-thai-green/10 px-4 py-2 rounded-lg">
                  <span className="text-thai-green font-semibold">Award Winner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-thai-charcoal">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-thai-gold mb-4">
              Our Timeline
            </h2>
            <p className="text-lg text-thai-beige-light max-w-2xl mx-auto">
              25 years of growth, tradition, and community
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center mb-8 animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex-shrink-0 w-24 text-right mr-8">
                  <span className="text-2xl font-bold text-thai-gold">{item.year}</span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-thai-gold rounded-full mr-8"></div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-thai-beige-light mb-2">{item.title}</h3>
                  <p className="text-thai-beige-dark">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="animate-fade-in-up">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-8">
                Get in <span className="text-thai-gold">Touch</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-thai-gold mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Location</h3>
                    <p className="text-muted-foreground">
                      123 Thai Street, Flavor District<br />
                      Food City, FC 12345
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-thai-gold mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">(555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-thai-gold mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">hello@garoonthai.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-thai-gold mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Hours</h3>
                    <div className="text-muted-foreground">
                      <p>Monday - Thursday: 11:00 AM - 10:00 PM</p>
                      <p>Friday - Saturday: 11:00 AM - 11:00 PM</p>
                      <p>Sunday: 12:00 PM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="card-elegant border-thai-gold/20 animate-scale-in">
              <CardContent className="p-8">
                <h3 className="font-playfair text-2xl font-semibold text-foreground mb-6">
                  Send us a Message
                </h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first-name">First Name</Label>
                      <Input id="first-name" placeholder="Your first name" />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" placeholder="Your last name" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What's this about?" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us how we can help you..."
                      rows={4}
                    />
                  </div>
                  <Button variant="hero" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;