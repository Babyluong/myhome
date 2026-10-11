import React from 'react';

export function StaticHeroFallback(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none flex items-center justify-center -z-10"
    >
      <div className="absolute w-[36rem] h-[36rem] rounded-full bg-sky-500/[0.08] blur-3xl animate-pulse-subtle" />
      <div className="absolute w-[28rem] h-[28rem] rounded-full bg-teal-500/[0.06] blur-2xl translate-x-20 -translate-y-10" />
      <svg
        className="w-full h-full opacity-[0.06] dark:opacity-[0.1]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
    </div>
  );
}

export default StaticHeroFallback;
