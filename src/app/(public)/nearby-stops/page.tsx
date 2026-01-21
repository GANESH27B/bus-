
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated and redirects to the homepage which now contains the nearby stops map.
export default function NearbyStopsPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/');
    }, [router]);

    return null;
}
