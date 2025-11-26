"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BusFront, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/live-tracking", label: "Live Tracking" },
  { href: "/routes", label: "Routes" },
  { href: "/trip-planner", label: "Trip Planner" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BusFront className="h-6 w-6" />
          <span className="font-bold sm:inline-block">SmartBus Connect</span>
        </Link>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary-foreground/80",
                pathname === link.href ? "text-primary-foreground" : "text-primary-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end md:hidden">
          {isMounted ? (
            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-2 text-base hover:bg-primary/80 focus-visible:bg-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0 bg-primary text-primary-foreground border-primary-foreground/20">
                <Link
                  href="/"
                  className="mr-6 flex items-center space-x-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <BusFront className="h-6 w-6" />
                  <span className="font-bold">SmartBus Connect</span>
                </Link>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                  <div className="flex flex-col space-y-3">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "transition-colors hover:text-primary-foreground/80",
                          pathname === link.href ? "text-primary-foreground font-semibold" : "text-primary-foreground/60"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : <div className="h-9 w-9" />}
        </div>
      </div>
    </header>
  );
}
