
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BusFront, Menu, MapPin, MapSearch } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/routes", label: "Routes" },
  { href: "/trip-planner", label: "Trip Planner" },
  { href: "https://www.google.com/maps/search/?api=1&query=bus+stand", label: "Nearby Stops", target: "_blank" },
  { href: "/map-search", label: "Map Search" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 bg-primary/90 shadow-md backdrop-blur-sm"
    )}>
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BusFront className="h-6 w-6 text-primary-foreground" />
          <span className="font-bold sm:inline-block text-primary-foreground">
            SmartBus Connect
          </span>
        </Link>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.target}
              className={cn(
                "transition-colors text-primary-foreground/80 hover:text-primary-foreground",
                pathname === link.href && "text-primary-foreground font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-2 text-base text-primary-foreground hover:bg-white/20 focus-visible:bg-white/20"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0 bg-background text-foreground border-border">
                <Link
                  href="/"
                  className="mr-6 flex items-center space-x-2 px-6"
                  onClick={() => setMenuOpen(false)}
                >
                  <BusFront className="h-6 w-6 text-primary" />
                  <span className="font-bold">SmartBus Connect</span>
                </Link>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10">
                  <div className="flex flex-col space-y-3 px-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        target={link.target}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "transition-colors hover:text-primary",
                          pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
