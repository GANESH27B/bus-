
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Route, Bot, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const features = [
  {
    icon: <MapPin className="w-8 h-8" />,
    title: "Nearby Stops",
    description: "Find bus stops near your current location with a single tap.",
    link: "/nearby-stops",
    cta: "Find Stops",
  },
  {
    icon: <Route className="w-8 h-8" />,
    title: "Routes & Tracking",
    description: "Search for bus routes, schedules, and track your bus in real-time.",
    link: "/routes",
    cta: "Search Routes",
  },
  {
    icon: <Bot className="w-8 h-8" />,
    title: "AI Trip Planner",
    description: "Let our AI assistant plan the most efficient journey for you.",
    link: "/trip-planner",
    cta: "Plan Trip",
  },
  {
    icon: <ExternalLink className="w-8 h-8" />,
    title: "Official State Schedules",
    description: "Find official schedules and book tickets from state transport sites.",
    link: "https://www.google.com/search?q=official+state+road+transport+corporation+websites",
    cta: "Find Schedules",
  },
];

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bus');

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 bg-black/50 z-10" />
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                style={{ objectFit: 'cover' }}
                priority
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="relative z-20 p-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
            SmartBus Connect
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Your partner in smart urban transit. Real-time tracking, route planning, and more.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/routes">
              Get Started <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need for your commute
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col">
                <CardHeader className="items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-2">
                        {feature.icon}
                    </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col text-center">
                  <p className="text-muted-foreground flex-grow">
                    {feature.description}
                  </p>
                  <Button asChild className="mt-6" variant="secondary">
                     <Link href={feature.link} target={feature.link.startsWith('http') ? '_blank' : undefined}>
                      {feature.cta} <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
