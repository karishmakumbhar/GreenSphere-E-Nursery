"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Settings, ShoppingBag, Leaf, Search, Bell } from "lucide-react";

export default function Navbar() {
  const { user, cart, wishlist, notifications, logout, markNotificationsAsRead } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    router.push("/");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Garden", href: "/my-garden" },
    { name: "Care Guide", href: "/care-guide" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    ...(user?.role === "admin" ? [{ name: "Admin", href: "/admin" }] : [])
  ];

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4">
      <nav className="max-w-7xl mx-auto glass-nav rounded-2xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-sans text-2xl font-bold text-txt-white tracking-tight flex items-center gap-2">
            <Leaf className="w-6 h-6 text-accent-green" /> GreenSphere
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ transition: "all 0.3s ease" }}
                className={`relative px-[20px] py-[10px] font-medium text-sm rounded-[12px] cursor-pointer hover:scale-105 inline-block ${
                  isActive 
                    ? "bg-[#5E7D1F] text-white shadow-[0px_4px_12px_rgba(94,125,31,0.25)]" 
                    : "bg-transparent text-[#5E7D1F] hover:bg-[#d4edaa] hover:text-[#1a2e05]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>



        {/* Action icons */}
        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <Link
            href="/dashboard/wishlist"
            className="relative p-2 text-txt-muted hover:text-accent-neon transition-colors"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent-neon text-bg-deep text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(63,209,123,0.4)]">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/checkout"
            className="relative p-2 text-txt-muted hover:text-accent-neon transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent-neon text-bg-deep text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(63,209,123,0.4)]">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown);
                setShowUserDropdown(false);
                markNotificationsAsRead();
              }}
              className="p-2 text-txt-muted hover:text-accent-neon transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accent-neon shadow-[0_0_6px_rgba(63,209,123,0.4)] animate-pulse-subtle" />
              )}
            </button>

            {showNotificationDropdown && (
              <div className="absolute right-0 mt-3 w-80 rounded-xl bg-bg-deep/95 backdrop-blur-xl border border-border-subtle p-4 shadow-xl z-50 text-left">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-2">
                  <span className="font-semibold text-xs text-txt-white">Notifications</span>
                  <span className="text-[10px] text-accent-neon font-mono">Real-time telemetry</span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-[11px] text-txt-muted text-center py-4">No notifications received.</p>
                  ) : (
                    notifications.map((note) => (
                      <div key={note.id} className="text-xs border-b border-border-subtle pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className={`font-medium ${
                            note.type === "alert" ? "text-red-400" : note.type === "warning" ? "text-accent-lime" : "text-txt-white"
                          }`}>{note.title}</span>
                          <span className="text-[9px] text-txt-muted font-mono">{new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-txt-muted leading-relaxed">{note.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotificationDropdown(false);
                }}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-xl border border-border-subtle hover:border-accent-neon/30 transition-all bg-bg-sec-dark"
              >
                <span className="text-xs font-medium text-txt-gray hidden md:inline">{user.name}</span>
                <div className="w-7 h-7 rounded-lg bg-bg-sec-light border border-border-subtle flex items-center justify-center text-accent-neon font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl bg-bg-deep/95 backdrop-blur-xl border border-border-subtle p-2 shadow-xl z-50 text-left">
                  <div className="px-3 py-2 border-b border-border-subtle mb-1">
                    <p className="text-xs font-semibold text-txt-white">{user.name}</p>
                    <p className="text-[10px] text-txt-muted truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] bg-accent-neon/10 border border-accent-neon/20 text-accent-neon px-1.5 py-0.5 rounded font-mono uppercase">
                      {user.role} Nodes
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-txt-gray hover:text-accent-neon hover:bg-bg-sec-light rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Garden Hub
                  </Link>

                  <Link
                    href="/dashboard/orders"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-txt-gray hover:text-accent-neon hover:bg-bg-sec-light rounded-lg transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Telemetry Orders
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-txt-gray hover:text-accent-neon hover:bg-bg-sec-light rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Node Settings
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-accent-neon bg-accent-neon/5 hover:bg-accent-neon/10 rounded-lg transition-colors border border-accent-neon/10 mt-1"
                    >
                      <LayoutDashboard className="w-4 h-4 text-accent-neon" />
                      Admin Control
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-t border-border-subtle mt-2 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect Session
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs px-5 py-2.5 rounded-full font-bold bg-accent-green text-bg-deep hover:bg-accent-neon hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm"
            >
              Login / Register
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
