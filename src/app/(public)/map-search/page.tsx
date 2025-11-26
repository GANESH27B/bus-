'use client';

import { useState, useEffect } from 'react';
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
import { Map, Search, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// A global variable to hold the SpeechRecognition instance, so it can be accessed across renders.
let speechRecognition: SpeechRecognition | null = null;


export default function MapSearchPage() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      speechRecognition = new SpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.lang = 'en-US';
      speechRecognition.interimResults = false;

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      speechRecognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      speechRecognition.onend = () => {
        setIsListening(false);
      };
    } else {
        setHasSpeechSupport(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        query
      )}`;
      window.open(searchUrl, '_blank');
    }
  };

  const handleMicClick = () => {
    if (!speechRecognition) return;

    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      speechRecognition.start();
      setIsListening(true);
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
              <div className="relative">
                <Input
                  id="search-query"
                  placeholder="e.g., 'Main Street Park' or '123 Fake St'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={cn(hasSpeechSupport && 'pr-12')}
                />
                 {hasSpeechSupport && (
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost" 
                    onClick={handleMicClick}
                    className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary h-8 w-8",
                        isListening && "text-destructive animate-pulse"
                    )}
                    aria-label={isListening ? "Stop listening" : "Start listening"}
                    >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                )}
              </div>
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
