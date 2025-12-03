'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
            <h2 className="text-4xl font-light mb-4">404 - Not Found</h2>
            <p className="mb-8 text-gray-500">Could not find requested resource</p>
            <Link
                href="/"
                className="border-b border-black pb-1 hover:opacity-50 transition-opacity"
            >
                Return Home
            </Link>
        </div>
    );
}
