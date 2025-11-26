import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map, Route, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const features = [
  {
    icon: <Map className="h-10 w-10 text-accent" />,
    title: "Live Bus Tracking",
    description: "See exactly where your bus is on an interactive map. No more guessing, no more waiting in the dark.",
    href: "/live-tracking",
  },
  {
    icon: <Route className="h-10 w-10 text-accent" />,
    title: "Routes & Schedules",
    description: "Browse all available routes, check bus timings, and see all the stops on your journey.",
    href: "/routes",
  },
  {
    icon: <Bot className="h-10 w-10 text-accent" />,
    title: "AI Trip Planner",
    description: "Let our smart assistant plan the best route for you. Get to your destination faster and easier.",
    href: "/trip-planner",
  },
];

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-bus');

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
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-headline">
            Welcome to SmartBus Connect
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
            Your city's transit, simplified. Real-time tracking, ETAs, and trip planning at your fingertips.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/live-tracking">
                Find My Bus <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Rethink Your Commute</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
              SmartBus Connect offers powerful tools to make your public transit experience seamless and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="items-center text-center">
                  <div className="p-3 bg-accent/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow text-center">
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
                <div className="p-6 pt-0 text-center">
                   <Button asChild variant="link" className="text-accent-foreground group">
                      <Link href={feature.href}>
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                      </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Get Started?</h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
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
