"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Users, 
  BarChart3, Megaphone, ShieldAlert, LogOut, ArrowLeft, UserCheck, MessageSquare, PackageCheck, Leaf, CheckCircle
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, login } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // If user is not logged in OR is not an admin, block access with a quick admin autofill demo button
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="rounded-3xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-8 shadow-2xl space-y-6">
          <div className="w-14 h-14 rounded-full bg-accent-neon/10 border border-accent-neon/20 flex items-center justify-center text-accent-neon mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-txt-white">Admin Credentials Required</h2>
            <p className="text-xs text-txt-muted leading-relaxed">
              This node panel requires admin encryption tokens. Your current node credentials do not have access authorization.
            </p>
          </div>

          <button
            onClick={() => login("admin@greensphere.ai", "default")}
            className="w-full py-3 text-xs font-bold rounded-xl bg-accent-neon text-bg-deep hover:bg-accent-lime transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(163,255,18,0.2)]"
          >
            <UserCheck className="w-4 h-4" /> Autofill Admin Account
          </button>
          
          <div className="flex justify-between items-center pt-2">
            <Link href="/" className="text-xs text-txt-muted hover:text-accent-neon flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link href="/login" className="text-xs text-txt-muted hover:text-accent-neon">
              Access Login Gateway
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Plants", href: "/admin/plants", icon: Leaf },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Ready To Ship", href: "/admin/ready-to-ship", icon: PackageCheck },
    { name: "Delivered", href: "/admin/delivered", icon: CheckCircle },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Admin Sidebar Navigation */}
      <aside className="lg:col-span-3 rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-4 space-y-6 text-left">
        <div className="px-3 py-2 border-b border-border-subtle/50 pb-4 mb-2 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent-neon/15 border border-accent-neon/20 flex items-center justify-center text-accent-neon font-bold text-sm">
            🛡️
          </div>
          <div>
            <h4 className="text-xs font-bold text-txt-white truncate max-w-[150px]">{user.name}</h4>
            <p className="text-[10px] text-accent-neon font-mono truncate max-w-[150px]">Admin Node</p>
          </div>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? "bg-accent-neon text-bg-deep shadow-[0_0_12px_rgba(163,255,18,0.15)]"
                    : "text-txt-muted hover:text-txt-white hover:bg-bg-sec-light"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-subtle/50 pt-4 mt-2 md:mt-4 flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide">
          <Link
            href="/"
            className="flex items-center justify-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-txt-muted hover:text-accent-neon rounded-xl transition-colors cursor-pointer flex-1 whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span>Return to Boutique</span>
          </Link>
          <button
            onClick={() => {
              // logout logic usually handled in AppContext, but we can do localStorage cleanup and redirect
              localStorage.removeItem("gs_user");
              window.location.href = "/login";
            }}
            className="flex items-center justify-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 rounded-xl transition-colors cursor-pointer flex-1 whitespace-nowrap"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="lg:col-span-9 space-y-6">
        {children}
      </main>
    </div>
  );
}
