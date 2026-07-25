"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { 
  FolderOpen, ArrowUpRight, Compass,
  PackageSearch, Truck, CheckCircle, XCircle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

export default function AdminDashboardPage() {
  const { orders: localOrders, products } = useApp();
  const [dbOrders, setDbOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => setDbOrders(data))
      .catch(console.error);
  }, []);

  const allOrders = useMemo(() => {
    const map = new Map();
    localOrders.forEach((o: any) => map.set(o.id, o));
    dbOrders.forEach((o: any) => {
      if (map.has(o.id)) {
        map.set(o.id, { ...map.get(o.id), ...o, items: o.items?.length ? o.items : map.get(o.id).items });
      } else {
        map.set(o.id, o);
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [localOrders, dbOrders]);

  // Metrics Calculations
  const totalInventoryStock = products.reduce((acc, p) => acc + p.stock, 0);
  const receivedCount = allOrders.length;
  const shippedCount = allOrders.filter(o => o.status === "Shipped" || o.status === "Ready To Ship").length;
  const deliveredCount = allOrders.filter(o => o.status === "Delivered").length;
  const cancelledCount = allOrders.filter(o => o.status === "Cancelled").length;  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-border-subtle/50 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-txt-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-txt-muted font-mono uppercase tracking-wider text-accent-neon">GreenSphere Telemetry Ledger</p>
        </div>
        <span className="text-xs text-txt-muted font-mono bg-bg-sec-dark px-3 py-1.5 rounded-xl border border-border-subtle">
          Real-time Sync Node
        </span>
      </div>

      {/* Grid of metrics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Inventory */}
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-sec-dark flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-txt-muted font-mono tracking-wider">Inventory Stock</span>
            <FolderOpen className="w-4 h-4 text-accent-neon" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-txt-white font-mono">{totalInventoryStock} Units</h3>
            <span className="text-[9px] text-accent-lime font-mono">Total available</span>
          </div>
        </div>

        {/* Received */}
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-sec-dark flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-txt-muted font-mono tracking-wider">Orders Received</span>
            <PackageSearch className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-txt-white font-mono">{receivedCount} Orders</h3>
            <span className="text-[9px] text-blue-400/80 font-mono">Total orders placed</span>
          </div>
        </div>

        {/* Shipped */}
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-sec-dark flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-txt-muted font-mono tracking-wider">Orders Shipped</span>
            <Truck className="w-4 h-4 text-orange-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-txt-white font-mono">{shippedCount} Orders</h3>
            <span className="text-[9px] text-orange-400/80 font-mono">In transit</span>
          </div>
        </div>

        {/* Delivered */}
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-sec-dark flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-txt-muted font-mono tracking-wider">Orders Delivered</span>
            <CheckCircle className="w-4 h-4 text-accent-green" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-txt-white font-mono">{deliveredCount} Orders</h3>
            <span className="text-[9px] text-accent-green font-mono">Successfully fulfilled</span>
          </div>
        </div>

        {/* Cancelled */}
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-sec-dark flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-txt-muted font-mono tracking-wider">Orders Cancelled</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-txt-white font-mono">{cancelledCount} Orders</h3>
            <span className="text-[9px] text-red-400/80 font-mono">Terminated</span>
          </div>
        </div>

      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Overview */}
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-sec-dark space-y-4 flex-1">
          <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
            <h3 className="text-xs font-bold text-txt-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-accent-neon" /> Recent Logistics Transactions
            </h3>
            <Link href="/admin/orders" className="text-[10px] text-accent-neon hover:text-accent-lime font-bold flex items-center gap-0.5">
              Review Shipments <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-border-subtle text-txt-muted uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Registry ID</th>
                  <th className="py-2.5">Cultivator Name</th>
                  <th className="py-2.5 text-right">Settlement Total</th>
                  <th className="py-2.5 text-right">Logistics Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-txt-gray">
                {allOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-txt-muted italic">No active order records found.</td>
                  </tr>
                ) : (
                  allOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-bg-sec-dark/50">
                      <td className="py-3 text-txt-white font-bold truncate max-w-[80px]">{order.id}</td>
                      <td className="py-3 truncate max-w-[100px]">{order.address.fullName}</td>
                      <td className="py-3 text-right text-accent-neon font-bold">₹{order.total.toLocaleString("en-IN")}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                          order.status === "Processing" 
                            ? "bg-blue-500/10 border border-blue-400/20 text-blue-400"
                            : order.status === "Delivered"
                            ? "bg-accent-green/15 border border-accent-green/30 text-accent-green"
                            : "bg-orange-400/15 border border-orange-400/30 text-orange-400"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Available Inventory Overview */}
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-sec-dark space-y-4 flex-1">
          <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
            <h3 className="text-xs font-bold text-txt-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-4.5 h-4.5 text-accent-neon" /> Available Inventory
            </h3>
            <Link href="/admin/plants" className="text-[10px] text-accent-neon hover:text-accent-lime font-bold flex items-center gap-0.5">
              Manage Catalog <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-border-subtle text-txt-muted uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Cultivar Name</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-right">Current Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-txt-gray">
                {products.filter(p => p.stock > 0).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-txt-muted italic">Inventory is completely depleted.</td>
                  </tr>
                ) : (
                  products
                    .filter(p => p.stock > 0)
                    .sort((a, b) => a.stock - b.stock) // Show lowest stock first
                    .slice(0, 5)
                    .map((product) => (
                    <tr key={product.id} className="hover:bg-bg-sec-dark/50">
                      <td className="py-3 text-txt-white font-bold truncate max-w-[120px]" title={product.name}>{product.name}</td>
                      <td className="py-3 text-txt-muted truncate max-w-[100px]">{product.category}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-accent-neon/15 border border-accent-neon/30 text-accent-neon font-bold">
                          {product.stock} Units
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
