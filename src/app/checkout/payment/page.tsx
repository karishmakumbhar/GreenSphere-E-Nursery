"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { CreditCard, IndianRupee, Wallet, ShieldAlert, Check, Gift } from "lucide-react";
import Link from "next/link";

export default function CheckoutPaymentPage() {
  const { cart, placeOrder } = useApp();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [address, setAddress] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponStatus, setCouponStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Read address from localStorage
    const saved = localStorage.getItem("gs_temp_address");
    if (saved) {
      setAddress(JSON.parse(saved));
    } else {
      router.push("/checkout");
    }
  }, [router]);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = (subtotal * discountPercent) / 100;
  const shipping = subtotal > 1500 ? 0 : 75;
  const totalCost = subtotal - discount + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponStatus("");
    if (couponCode.toUpperCase() === "BIOSPHERE10" || couponCode.toUpperCase() === "GREENSPHERE") {
      setDiscountPercent(10);
      setCouponStatus("Coupon applied successfully! 10% Decarbonization Discount synced.");
    } else {
      setCouponStatus("Invalid token signature. Access denied.");
    }
  };

  const handlePay = async () => {
    if (!address || cart.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Generate Order via Context (which creates GS-2026-XXXX format, adds plants to Garden, clears Cart)
      const newOrder = await placeOrder(address, paymentMethod, totalCost);
      const orderId = newOrder.id;

      if (paymentMethod === "cod") {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: "COD",
            razorpay_signature: "COD",
            orderData: { address, paymentMethod: "COD", totalCost, cart, user: null },
            mockMode: true
          }),
        });

        if (verifyRes.ok) {
          localStorage.setItem("gs_latest_order_id", orderId);
          localStorage.removeItem("gs_temp_address");
          router.push("/checkout/confirmation");
        } else {
          alert("Failed to confirm COD order.");
        }
        setIsProcessing(false);
        return;
      }

      // Simulated Online Payment Flow (Mocking Razorpay)
      setTimeout(async () => {
        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: orderId,
              razorpay_payment_id: "pay_mock_" + Date.now(),
              razorpay_signature: "mock_signature_bypass",
              orderData: { address, paymentMethod, totalCost, cart, user: null },
              mockMode: true
            }),
          });

          if (verifyRes.ok) {
            localStorage.setItem("gs_latest_order_id", orderId);
            localStorage.removeItem("gs_temp_address");
            router.push("/checkout/confirmation");
          } else {
            const verifyData = await verifyRes.json();
            alert("Mock Payment verification failed. " + verifyData.error);
          }
        } catch (e) {
          console.error(e);
          alert("An error occurred during simulated online checkout.");
        } finally {
          setIsProcessing(false);
        }
      }, 1500);
      
    } catch (e) {
      alert("An error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  if (!address) {
    return <div className="text-center py-24 text-xs font-mono text-txt-muted">Syncing Logistics Ledger...</div>;
  }

  const paymentOptions = [
    { id: "razorpay", name: "Pay Online", desc: "UPI, Cards, Wallets, NetBanking via Razorpay", icon: CreditCard },
    { id: "cod", name: "Cash on Delivery", desc: "Pay with cash upon arrival", icon: IndianRupee }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
      {/* Title */}
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-extrabold text-txt-white tracking-tight">Payment Portal</h1>
        <p className="text-xs text-txt-muted">Select secure quantum bio-funds gateway and authorize transaction.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Payment Options */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-5 space-y-6 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-txt-white pb-3 border-b border-border-subtle">
              Secure Funding Nodes
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {paymentOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = paymentMethod.startsWith(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`rounded-xl border transition-all ${
                      isSelected
                        ? "border-accent-neon bg-accent-neon/5 shadow-[0_0_15px_rgba(163,255,18,0.1)]"
                        : "border-border-subtle bg-bg-sec-dark hover:border-accent-neon/30"
                    }`}
                  >
                    <button
                      onClick={() => setPaymentMethod(opt.id)}
                      className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex gap-4 items-center">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-accent-neon text-bg-deep" : "bg-bg-sec-light text-txt-muted"}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-txt-white">{opt.name}</h4>
                          <p className="text-[10px] text-txt-muted">{opt.desc}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-accent-neon bg-accent-neon text-bg-deep" : "border-border-subtle"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>

                    {opt.id === "razorpay" && isSelected && (
                      <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-1 space-y-4">
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg text-xs text-txt-white focus:outline-none focus:border-accent-neon cursor-pointer appearance-none"
                        >
                          <option value="razorpay">Select Specific Method (Optional)</option>
                          <option value="razorpay_upi">UPI (GPay, PhonePe, Paytm)</option>
                          <option value="razorpay_card">Credit / Debit Card</option>
                          <option value="razorpay_netbanking">Net Banking</option>
                          <option value="razorpay_wallet">Digital Wallets</option>
                        </select>

                        {/* QR Code Display */}
                        {(paymentMethod === "razorpay" || paymentMethod === "razorpay_upi") && (
                          <div className="bg-bg-deep border border-border-subtle rounded-lg p-4 text-center space-y-3 flex flex-col items-center">
                            <p className="text-[10px] text-txt-muted uppercase tracking-wider font-bold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-accent-neon animate-pulse" /> 
                              Scan to Pay via UPI
                            </p>
                            <div className="w-36 h-36 bg-white rounded-xl p-2 flex items-center justify-center border border-border-subtle shadow-[0_0_15px_rgba(163,255,18,0.05)] overflow-hidden">
                              <img src="/images/payment_qr.jpg" alt="Payment QR Code" className="w-full h-full object-contain" />
                            </div>
                            <p className="text-[9px] text-txt-gray max-w-[200px] leading-relaxed">
                              Scan this QR with PhonePe, GPay, or Paytm. Once paid, click "Authorize Acquisition" to verify.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Back & Pay */}
            <div className="flex gap-4 pt-2 justify-between">
              <Link
                href="/checkout"
                className="px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-sec-dark hover:bg-bg-sec-light text-xs font-semibold text-txt-white transition-all flex items-center gap-1.5"
              >
                Modify Shipping
              </Link>
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="px-8 py-3 text-xs font-bold rounded-xl bg-accent-neon text-bg-deep hover:bg-accent-lime transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(163,255,18,0.25)] disabled:opacity-50"
              >
                {isProcessing ? "Authorizing Bio-Funds..." : "Authorize Acquisition"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Coupon & Order total summary */}
        <div className="lg:col-span-4 space-y-6 text-left">
          {/* Coupon */}
          <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-txt-white pb-3 border-b border-border-subtle flex items-center gap-2">
              <Gift className="w-4 h-4 text-accent-neon" /> Promo Node Code
            </h3>
            
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="BIOSPHERE10"
                className="flex-grow pl-3 pr-2 py-2 text-xs rounded-xl glass-input font-mono uppercase tracking-wider"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-bg-sec-light border border-border-subtle hover:border-accent-neon text-txt-white cursor-pointer"
              >
                Sync
              </button>
            </form>
            {couponStatus && (
              <p className={`text-[10px] ${couponStatus.includes("applied") ? "text-accent-green" : "text-red-400"} font-medium`}>
                {couponStatus}
              </p>
            )}
          </div>

          {/* Checkout review */}
          <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/40 glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-txt-white pb-3 border-b border-border-subtle">
              Telemetry Settlement
            </h3>

            <div className="space-y-3 font-mono text-xs text-txt-gray">
              <div className="flex justify-between">
                <span className="text-txt-muted">Specimen Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-accent-green">
                  <span>Decarbonization (10%)</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-txt-muted">Pod Transport</span>
                <span>{shipping === 0 ? "FREE" : `₹${shipping.toLocaleString("en-IN")}`}</span>
              </div>
              <div className="border-t border-border-subtle/50 pt-3 flex justify-between text-sm font-bold text-txt-white">
                <span>Settlement Cost</span>
                <span className="text-accent-neon">₹{totalCost.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-bg-deep border border-border-subtle/80 text-[10px] leading-relaxed text-txt-muted flex items-start gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-accent-neon flex-shrink-0 mt-0.5" />
              <span>By clicking Authorize, you sync your node profile address coordinates with the shipping carrier.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
