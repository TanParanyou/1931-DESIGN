'use client';

import React from 'react';
import Link from 'next/link';

export const LineStickyButton = () => {
    return (
        <Link
            href="https://lin.ee/ISQXqn6"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#06C755] rounded-full shadow-lg hover:scale-110 transition-transform duration-300 group"
            aria-label="Contact us on LINE"
        >
            {/* LINE Logo SVG */}
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
            >
                <path
                    d="M21.5 10.1C21.5 6.4 17.2 3.4 12 3.4C6.8 3.4 2.5 6.4 2.5 10.1C2.5 13.2 5.2 15.8 9.1 16.5L8.3 19.3C8.1 19.8 8.6 20.2 9 19.9L13.8 16.6C18.2 16.3 21.5 13.5 21.5 10.1Z"
                    fill="currentColor"
                />
            </svg>

            {/* Tooltip/Label (Optional - can be removed if just icon is preferred) */}
            <span className="absolute right-full mr-3 bg-white text-black text-xs font-medium py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                Contact us
            </span>
        </Link>
    );
};
