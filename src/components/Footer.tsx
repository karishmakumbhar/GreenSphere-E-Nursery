"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Leaf, ArrowRight, Terminal, Send, Camera, Globe } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { usePathname } from "next/navigation";

export default function Footer() {
  const { addNotification } = useApp();
  const [email, setEmail] = useState("");
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      addNotification(
        "Telemetry Subscribed",
        `Subscribed ${email} to weekly rare cultivation dispatches!`,
        "success"
      );
      setEmail("");
    }
  };

  return (
    <footer className="bg-bg-deep border-t border-border-subtle pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        {/* Branding Column */}
        <div className="lg:col-span-2 space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-neon flex items-center justify-center shadow-[0_0_15px_rgba(163,255,18,0.25)]">
              <Leaf className="w-4.5 h-4.5 text-bg-deep fill-bg-deep" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-txt-white to-accent-neon bg-clip-text text-transparent">
              GreenSphere
            </span>
          </Link>
          
          <p className="text-xs text-txt-muted leading-relaxed max-w-sm">
            Merging biological design with quantum monitoring. GreenSphere offers engineered flora specimens and ambient monitoring technologies for the modern high-density architectural space.
          </p>

          {/* Newsletter subscription inside footer */}
          <form onSubmit={handleSubscribe} className="space-y-2 max-w-sm">
            <label className="text-[10px] uppercase font-semibold text-accent-neon tracking-wider font-mono">
              Join Botanical Grid Telemetry
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter node email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-grow pl-3 pr-2 py-2 text-xs rounded-xl glass-input"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-accent-neon text-bg-deep hover:bg-accent-lime hover:scale-[1.03] transition-all flex items-center gap-1 cursor-pointer"
              >
                Sync <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-semibold text-txt-white tracking-wider font-mono">Catalog Nodes</h4>
          <ul className="space-y-2 text-xs text-txt-muted">
            <li><Link href="/products?category=Rare%20Plants" className="hover:text-accent-neon transition-colors">Rare Cultivars</Link></li>
            <li><Link href="/products?category=Bonsai" className="hover:text-accent-neon transition-colors">Magnetic Bonsai</Link></li>
            <li><Link href="/products?category=Air%20Purifying" className="hover:text-accent-neon transition-colors">Air Sanitizers</Link></li>
            <li><Link href="/products?category=Succulents" className="hover:text-accent-neon transition-colors">Quantum Succulents</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-semibold text-txt-white tracking-wider font-mono">Telemetry Portal</h4>
          <ul className="space-y-2 text-xs text-txt-muted">
            <li><Link href="/dashboard" className="hover:text-accent-neon transition-colors">Digital Garden</Link></li>
            <li><Link href="/dashboard/orders" className="hover:text-accent-neon transition-colors">Logistics Registry</Link></li>
            <li><Link href="/dashboard/settings" className="hover:text-accent-neon transition-colors">Module Settings</Link></li>
            <li><Link href="/login" className="hover:text-accent-neon transition-colors">Gateway Authentication</Link></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-semibold text-txt-white tracking-wider font-mono">Ecosystem</h4>
          <ul className="space-y-2 text-xs text-txt-muted">
            <li className="hover:text-accent-neon transition-colors cursor-pointer">Neural Bio-Core API</li>
            <li className="hover:text-accent-neon transition-colors cursor-pointer">Vercel Fleet</li>
            <li className="hover:text-accent-neon transition-colors cursor-pointer">Environmental Ledger</li>
            <li className="hover:text-accent-neon transition-colors cursor-pointer">Decarbonization Registry</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[10px] text-txt-muted font-mono">
          © {new Date().getFullYear()} GreenSphere Project Inc. Specimen Telemetry Node.
        </span>

        {/* Social Icons */}
        <div className="flex gap-4">
          <a href="#" className="p-2 rounded-lg bg-bg-sec-dark hover:bg-bg-sec-light border border-border-subtle text-txt-muted hover:text-accent-neon transition-all hover:scale-115">
            <Send className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 rounded-lg bg-bg-sec-dark hover:bg-bg-sec-light border border-border-subtle text-txt-muted hover:text-accent-neon transition-all hover:scale-115">
            <Camera className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 rounded-lg bg-bg-sec-dark hover:bg-bg-sec-light border border-border-subtle text-txt-muted hover:text-accent-neon transition-all hover:scale-115">
            <Terminal className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 rounded-lg bg-bg-sec-dark hover:bg-bg-sec-light border border-border-subtle text-txt-muted hover:text-accent-neon transition-all hover:scale-115">
            <Globe className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
