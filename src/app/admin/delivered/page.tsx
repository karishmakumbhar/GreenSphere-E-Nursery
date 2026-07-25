"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Search, Eye, CheckCircle, Package } from "lucide-react";

export default function AdminDeliveredPage() {
  const { orders } = useApp() as any;
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchDbOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setDbOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbOrders();
  }, []);

  const allOrdersMap = new Map();
  orders.forEach((o: any) => allOrdersMap.set(o.id, o));
  dbOrders.forEach((o: any) => {
    if (allOrdersMap.has(o.id)) {
      const existing = allOrdersMap.get(o.id);
      allOrdersMap.set(o.id, { ...existing, ...o, items: o.items?.length ? o.items : existing.items });
    } else {
      allOrdersMap.set(o.id, o);
    }
  });

  const allOrders = Array.from(allOrdersMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ONLY SHOW "Delivered"
  const deliveredOrders = allOrders.filter(o => o.status === "Delivered");

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return deliveredOrders;
    return deliveredOrders.filter(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.address?.fullName && o.address.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [deliveredOrders, searchQuery]);

  if (loading) {
    return <div className="text-center py-10 text-xs text-txt-muted animate-pulse">Loading shipments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-txt-white tracking-tight">Delivered Orders</h2>
          <p className="text-xs text-txt-muted mt-1">Successfully fulfilled logistics transactions.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
          <input
            type="text"
            placeholder="Search by Order ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-deep border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-txt-white focus:border-accent-neon outline-none transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-border-subtle/50 text-txt-muted uppercase tracking-wider font-bold">
                <th className="pb-3 pl-2">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-bg-sec-light/30 transition-colors">
                  <td className="py-3 pl-2">
                    <p className="font-bold text-txt-white font-mono">{order.id}</p>
                  </td>
                  <td className="py-3">
                    <p className="font-bold text-txt-white">{order.address?.fullName || "Guest User"}</p>
                    <p className="text-[10px] text-txt-muted">{order.address?.city}</p>
                  </td>
                  <td className="py-3 text-txt-muted">
                    <p>{order.items?.length || 0} plants</p>
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelectedOrder(order)} title="View Details" className="p-1.5 rounded-lg bg-bg-deep hover:bg-bg-sec-light text-txt-white border border-border-subtle transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-txt-muted text-xs">No delivered orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-sec-dark border border-border-subtle rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-txt-muted hover:text-white p-1 bg-bg-deep rounded-full border border-border-subtle">
              <CheckCircle className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-txt-white mb-6 border-b border-border-subtle/50 pb-4">Order Details: <span className="text-accent-neon font-mono">{selectedOrder.id}</span></h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
              <div>
                <p className="font-bold text-txt-muted uppercase tracking-wider mb-2">Customer Info</p>
                <p className="text-txt-white font-bold">{selectedOrder.address?.fullName || "N/A"}</p>
                <p className="text-txt-muted">{selectedOrder.address?.email || "N/A"}</p>
                <p className="text-txt-muted">{selectedOrder.address?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="font-bold text-txt-muted uppercase tracking-wider mb-2">Shipping Address</p>
                <p className="text-txt-white">{selectedOrder.address?.street || "N/A"}</p>
                <p className="text-txt-white">{selectedOrder.address?.city || "N/A"}, {selectedOrder.address?.zipCode || "N/A"}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-bold text-txt-muted uppercase tracking-wider mb-3">Order Items</p>
              <div className="bg-bg-deep rounded-xl border border-border-subtle overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-sec-light/50 border-b border-border-subtle text-txt-muted">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="p-3 font-medium text-txt-white">{item.product_name || item.product?.name}</td>
                        <td className="p-3 text-txt-muted">{item.quantity}</td>
                        <td className="p-3 text-right text-accent-neon">₹{(item.price || item.product?.price)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
