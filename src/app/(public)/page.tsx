
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Route, Bot, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const features = [
  {
    icon: <Route className="h-8 w-8 text-primary" />,
    title: "Routes & Schedules",
    description: "Browse all available routes, check bus timings, and see all the stops on your journey.",
    href: "/routes",
    buttonText: "Learn More",
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "AI Trip Planner",
    description: "Let our smart assistant plan the best route for you. Get to your destination faster and easier.",
    href: "/trip-planner",
    buttonText: "Learn More",
  },
  {
    icon: <MapPin className="h-8 w-8 text-primary" />,
    title: "Nearby Stops",
    description: "See all bus stops and find your nearest one on an interactive map.",
    href: "/nearby-stops",
    buttonText: "Learn More",
  },
  {
    icon: <ExternalLink className="h-8 w-8 text-primary" />,
    title: "Official State Schedules",
    description: "Find official bus schedules and book tickets directly from state transport websites.",
    href: "https://www.google.com/search?q=list+of+state+road+transport+corporation+websites+in+india",
    buttonText: "Search Sites",
  }
];

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-bus');
  const ctaImage = PlaceHolderImages.find(p => p.id === 'cta-background');

  return (
    <div className="flex-1">
      <section className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] flex items-center justify-center text-center text-white">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-headline">
            Welcome to SmartBus Connect
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/90">
            Your city's transit, simplified. Real-time tracking, ETAs, and trip planning at your fingertips.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/routes">
                Explore Routes <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Your Complete Transit Toolkit</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to navigate the city's bus network with ease.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card text-card-foreground border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col text-center">
                  <CardContent className="p-8 flex-grow flex flex-col items-center">
                    <div className="mb-4 p-4 bg-primary/10 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground flex-grow">{feature.description}</p>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Link href={feature.href} target={feature.href.startsWith('http') ? '_blank' : undefined}>
                            {feature.buttonText}
                            <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                  </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-secondary py-20 md:py-28 text-white">
        {ctaImage && (
            <Image
                src={ctaImage.imageUrl}
                alt={ctaImage.description}
                fill
                className="object-cover"
                data-ai-hint={ctaImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Get Started?</h2>
          <p className="mt-2 text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Plan your next trip or find your bus right now.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/trip-planner">
                Plan a Trip <Bot className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
