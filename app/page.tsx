"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCheck,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

const glassCard =
  "rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.15] backdrop-saturate-[1.8]";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white font-sans">
      {/* Fixed background video */}
      <div className="fixed inset-0 -z-20">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.7]"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_141646_a5156969-0608-4d43-9e34-90f4716d1f32.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="relative z-10">
        {/* Section 1 — Navigation */}
        <nav className="flex items-center justify-between px-8 md:px-16 py-6">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-white"
          >
            VINCENT
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="#"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="#"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Products
            </Link>
            <Link
              href="#"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Contacts
            </Link>
          </div>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </nav>

        {/* Section 2 — Hero */}
        <section className="text-center px-8 md:px-16 pt-[15vh] pb-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/60 font-light"
          >
            Intelligence at the source
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.85] tracking-tighter uppercase mt-4"
          >
            VINCENT
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-white/60 mt-6 max-w-md mx-auto font-light"
          >
            Premium BI analytics powered by AI. Transform raw data into
            actionable insights from source to dashboard.
          </motion.p>
        </section>

        {/* Section 3 — Two Info Cards */}
        <section className="px-8 md:px-16 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className={`${glassCard} min-h-[220px] p-8 flex flex-col justify-between`}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-black"
                  />
                ))}
              </div>
              <div>
                <p className="font-display text-3xl font-bold">15K+</p>
                <p className="text-sm text-white/60 mt-1">
                  Teams trusting our AI analytics
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs">Trusted by enterprises</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`${glassCard} min-h-[220px] p-8 flex flex-col justify-between`}
            >
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-medium">
                  Precision / AI analytics
                </h3>
                <p className="text-sm text-white/60 mt-2">(0.4%) Error rate</p>
              </div>
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-sm hover:text-white transition-colors text-white/80"
              >
                Learn how it works
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Section 4 — Simple Smart Analytics */}
        <section className="py-24 md:py-32 relative overflow-hidden px-8 md:px-16">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(3rem,10vw,9rem)] font-display font-bold leading-[0.85] tracking-tighter uppercase mb-20 md:mb-28"
          >
            Simple / Smart /{" "}
            <span className="text-primary">Analytics</span>
          </motion.h2>

          <div className="flex flex-col md:flex-row gap-8 md:gap-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`${glassCard} md:w-[280px] p-8 flex flex-col gap-6`}
            >
              <p className="text-sm text-white/60">
                Increased data accuracy
              </p>
              <p className="text-6xl md:text-7xl font-bold">25%</p>
              <button
                type="button"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
              >
                Learn more
              </button>
            </motion.div>

            <div className="hidden md:block md:flex-1" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col gap-4"
            >
              {[
                { label: "Connect", active: false },
                { label: "AI Analyze", active: true },
                { label: "Share", active: false },
                { label: "Track", active: false },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3"
                >
                  {item.active && (
                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                      <CheckCheck className="w-3 h-3 text-black" />
                    </span>
                  )}
                  <span
                    className={
                      item.active
                        ? "font-bold text-white"
                        : "text-white/60"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 mt-16 md:mt-24"
          >
            <p className="text-sm text-white/60 text-center md:text-left">
              Start your trial and get a free analytics starter kit.
            </p>
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition-colors shrink-0"
              aria-label="Get started"
            >
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="absolute top-24 right-8 md:right-16 w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium text-center px-2"
          >
            BI Awards
          </motion.div>
        </section>

        {/* Section 5 — The Process */}
        <section className="py-24 px-8 md:px-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-white/60 mb-4"
          >
            The Process
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-display font-bold mb-16"
          >
            From raw data /{" "}
            <span className="text-primary">to insights</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Connect",
                desc: "Integrate your data sources. Connect databases, APIs, and spreadsheets in minutes.",
              },
              {
                step: "02",
                title: "Analyze",
                desc: "AI-powered analysis identifies patterns, anomalies, and opportunities automatically.",
              },
              {
                step: "03",
                title: "Share",
                desc: "Generate and distribute reports. Dashboards update in real time across your org.",
              },
              {
                step: "04",
                title: "Act",
                desc: "Turn insights into action. Recommendations and alerts keep you ahead of the curve.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`${glassCard} p-8 group hover:border-white/30 transition-colors relative overflow-hidden`}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <p className="font-mono text-sm text-white/60 mb-4">
                  {item.step}
                </p>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 6 — Stats */}
        <section className="py-24 px-8 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "Accuracy rate" },
              { value: "24h", label: "Average analysis time" },
              { value: "2M+", label: "Reports generated" },
              { value: "0.04%", label: "Error rate" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p className="font-display text-5xl md:text-7xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-white/60 mt-3">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 7 — CTA */}
        <section className="py-32 text-center px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-4">
              Ready to start?
            </p>
            <h2 className="text-5xl md:text-[8rem] font-display font-bold leading-[0.85] tracking-tighter uppercase mb-12">
              Let&apos;s transform /{" "}
              <span className="text-primary">your data</span>
            </h2>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-12 py-5 font-semibold rounded-lg hover:bg-white/90 transition-colors group"
            >
              Get started
              <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </Link>
          </motion.div>
        </section>

        {/* Section 8 — Footer */}
        <footer className="py-16 px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <p className="font-display text-xl font-bold tracking-tight mb-4">
                VINCENT
              </p>
              <p className="text-sm text-white/70 max-w-xs">
                Redefining analytics through AI-powered intelligence.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-6">
                Product
              </p>
              <div className="flex flex-col gap-3">
                {["Features", "Pricing", "Case Studies", "API"].map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-6">
                Company
              </p>
              <div className="flex flex-col gap-3">
                {["About", "Careers", "Press", "Blog"].map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-6">
                Support
              </p>
              <div className="flex flex-col gap-3">
                {["Help Center", "Contact", "Status", "Documentation"].map(
                  (link) => (
                    <Link
                      key={link}
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
            <p className="text-sm text-white/60">
              © 2026 Vincent. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Twitter", "LinkedIn", "Instagram"].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  {social}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
