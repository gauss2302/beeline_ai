"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

function CrosshairIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  );
}

const BRANDS = [
  { name: "Vortex", letter: "V" },
  { name: "Nimbus", letter: "N" },
  { name: "Prysma", letter: "P" },
  { name: "Cirrus", letter: "C" },
  { name: "Kynder", letter: "K" },
  { name: "Halcyn", letter: "H" }
];

export default function LandingTwoPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundColor: "hsl(var(--lt-bg))",
        color: "hsl(var(--lt-foreground))"
      }}
    >
      {/* Full-screen background video */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260309_042944_4a2205b7-b061-490a-852b-92d9e9955ce9.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen">
        {/* Navbar */}
        <nav className="w-full flex justify-center pt-6 px-4">
          <div className="liquid-glass rounded-3xl max-w-[850px] w-full flex items-center justify-between gap-4 px-6 py-3">
            <Link href="/landing_two" className="flex items-center gap-3 shrink-0">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--lt-primary)) 0%, hsl(121 95% 60%) 100%)"
                }}
              >
                <CrosshairIcon className="w-4 h-4 text-[hsl(var(--lt-primary-foreground))]" />
              </div>
              <span className="text-xl font-semibold">APEX</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <button
                type="button"
                className="flex items-center gap-1 text-base opacity-90 hover:opacity-100 transition-opacity"
              >
                Features
                <ChevronDown className="w-4 h-4" />
              </button>
              <Link
                href="#"
                className="text-base opacity-90 hover:opacity-100 transition-opacity"
              >
                Solutions
              </Link>
              <Link
                href="#"
                className="text-base opacity-90 hover:opacity-100 transition-opacity"
              >
                Plans
              </Link>
              <button
                type="button"
                className="flex items-center gap-1 text-base opacity-90 hover:opacity-100 transition-opacity"
              >
                Learning
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: "hsl(var(--lt-primary))",
                color: "hsl(var(--lt-primary-foreground))"
              }}
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* Announcement Badge */}
        <div className="mt-8">
          <div className="liquid-glass rounded-full px-4 py-2 flex items-center gap-3">
            <span className="text-sm font-medium">Nova+ Launched!</span>
            <span className="rounded-full bg-white/5 px-3 py-1 flex items-center gap-1.5 text-sm">
              Explore
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Hero Heading */}
        <h1
          className="mt-12 px-4 text-center text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] max-w-5xl"
          style={{ color: "hsl(var(--lt-hero-heading))" }}
        >
          Accelerate Your
          <br />
          Revenue Growth Now
        </h1>

        {/* Subheading */}
        <p
          className="mt-6 text-lg max-w-md text-center opacity-80 px-4"
          style={{ color: "hsl(var(--lt-hero-sub))" }}
        >
          Drive your funnel forward with clever workflows, analytics, and
          seamless lead management.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 px-4">
          <button
            type="button"
            className="rounded-full px-6 py-3 text-base font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: "hsl(var(--lt-primary))",
              color: "hsl(var(--lt-primary-foreground))"
            }}
          >
            Start Free Right Now
          </button>
          <button
            type="button"
            className="liquid-glass rounded-full px-6 py-3 text-base font-normal transition-colors hover:bg-white/5"
            style={{ color: "hsl(var(--lt-foreground))" }}
          >
            Schedule a Consult
          </button>
        </div>

        {/* Social Proof Marquee */}
        <div className="mt-24 w-full flex flex-col items-center gap-6 pb-16">
          <div className="w-full max-w-4xl px-4 flex items-center gap-6">
            <p
              className="text-sm shrink-0 opacity-50"
              style={{ color: "hsl(var(--lt-foreground))" }}
            >
              Relied on by brands across the globe
            </p>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div
                className="flex gap-8 animate-marquee-scroll"
                style={{ width: "max-content" }}
              >
                {[...BRANDS, ...BRANDS].map((brand, i) => (
                  <div
                    key={`${brand.name}-${i}`}
                    className="flex items-center gap-3 shrink-0"
                  >
                    <div className="liquid-glass w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-base font-semibold">
                        {brand.letter}
                      </span>
                    </div>
                    <span className="text-base font-semibold">{brand.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
