
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BusFront, Menu, MapPin, ExternalLink, ChevronDown, Route as RouteIcon, Bot, Map, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { stateTransportLinks } from "@/lib/state-transport-links";
import { Separator } from "../ui/separator";

const navLinks = [
  { href: "/", label: "Home", icon: <Home className="h-4 w-4"/> },
  { href: "/nearby-stops", label: "Nearby Stops", icon: <MapPin className="h-4 w-4"/> },
  { href: "/routes", label: "Routes", icon: <RouteIcon className="h-4 w-4"/> },
  { href: "/trip-planner", label: "Trip Planner", icon: <Bot className="h-4 w-4"/> },
  { href: "/map-search", label: "Map Search", icon: <Map className="h-4 w-4"/> },
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
              className={cn(
                "transition-colors text-primary-foreground/80 hover:text-primary-foreground",
                pathname === link.href && "text-primary-foreground font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 focus-visible:bg-white/20 px-3 py-2 flex items-center gap-1 -ml-2">
                  State Schedules <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <ScrollArea className="h-72">
                  {stateTransportLinks.map((link) => (
                    <DropdownMenuItem key={link.name} asChild>
                      <Link
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-between w-full"
                      >
                        {link.name}
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <SheetContent side="left" className="p-0 pr-0 bg-background text-foreground border-border">
                <div className="px-6 py-4">
                  <Link
                    href="/"
                    className="mr-6 flex items-center space-x-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    <BusFront className="h-6 w-6 text-primary" />
                    <span className="font-bold">SmartBus Connect</span>
                  </Link>
                </div>
                <div className="h-[calc(100vh-6rem)] pb-10">
                   <ScrollArea className="h-full">
                      <div className="flex flex-col space-y-3 px-6">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "transition-colors hover:text-primary flex items-center gap-2",
                              pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                          >
                            {link.icon}
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <div className="px-6 mb-2 text-sm font-semibold text-foreground">State Schedules</div>
                      <div className="flex flex-col space-y-3 px-6">
                        {stateTransportLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMenuOpen(false)}
                            className="transition-colors hover:text-primary flex items-center justify-between text-muted-foreground"
                          >
                            <span>{link.name}</span>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        ))}
                      </div>
                   </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
