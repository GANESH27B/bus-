'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Map, Search } from 'lucide-react';

export default function MapSearchPage() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        query
      )}`;
      window.open(searchUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-muted p-4 rounded-full w-fit mb-4">
            <Map className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle>Map Search</CardTitle>
          <CardDescription>
            Enter a location, landmark, or address to find it on Google Maps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Search Location</Label>
              <Input
                id="search-query"
                placeholder="e.g., 'Main Street Park' or '123 Fake St'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={!query.trim()}>
              <Search className="mr-2 h-4 w-4" />
              Search on Google Maps
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
