
import React from "react";
import Link from "next/link";
import { BusFront, ExternalLink } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <BusFront className="h-6 w-6 mr-2 text-primary" />
            <span className="text-lg font-bold">SmartBus Connect</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm mb-4 md:mb-0">
            <Link href="/" className="hover:text-primary transition-colors">Live Map</Link>
            <Link href="/routes" className="hover:text-primary transition-colors">Routes</Link>
            <Link href="/trip-planner" className="hover:text-primary transition-colors">Trip Planner</Link>
            <Link href="/map-search" className="hover:text-primary transition-colors">Map Search</Link>
            <Link href="https://www.google.com/search?q=official+state+road+transport+corporation+websites" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center">
              Official Schedules <ExternalLink className="ml-1.5 h-4 w-4" />
            </Link>
          </nav>
          <div className="text-sm text-muted-foreground">
            &copy; {year} SmartBus Connect. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
