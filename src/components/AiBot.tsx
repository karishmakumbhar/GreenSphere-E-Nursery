"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, AlertCircle, Droplet, Sun, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { usePathname } from "next/navigation";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  suggestions?: { text: string; link: string }[];
}

export default function AiBot() {
  const { products } = useApp();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Neural Botany Core active. I can analyze plant telemetry, diagnose diseases, recommend biological specimens, or adjust watering frequencies. How may I assist your garden?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const presetPrompts = [
    {
      label: "Diagnose Plant",
      text: "My plant leaves are turning yellow with brown spots. Can you diagnose?",
      icon: ShieldAlert
    },
    {
      label: "Low-Light Recommendations",
      text: "Which plants are recommended for a low-light workspace?",
      icon: Sun
    },
    {
      label: "Watering Guidelines",
      text: "How often do I need to water my Verdant Nexus?",
      icon: Droplet
    }
  ];

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "I have analyzed your query in our botanical database. ";
      let suggestions: ChatMessage["suggestions"] = [];
      const query = textToSend.toLowerCase();

      if (query.includes("yellow") || query.includes("brown") || query.includes("diagnose")) {
        botResponse = "ANALYSIS COMPLETE: Chlorosis (leaf yellowing) detected. This is typically caused by overwatering leading to root oxygen deprivation, or nutrient lockout. I recommend reducing watering cycles and ensuring your container has adequate drainage.";
        suggestions = [
          { text: "View Care Accessories", link: "/products" },
          { text: "My Garden Status", link: "/dashboard" }
        ];
      } else if (query.includes("low") || query.includes("light") || query.includes("fern")) {
        const fern = products.find(p => p.id === "p3") || products[2] || products[0];
        if (fern) {
          botResponse = `RECOMMENDATION: The **${fern.name}** (${fern.scientificName}) is engineered specifically for sub-optimal lighting. Its phototrophic protein layers capture screen glare and convert it to plant energy.`;
          suggestions = [
            { text: `View ${fern.name} (₹${fern.price.toLocaleString("en-IN")})`, link: `/products/${fern.id}` },
            { text: "Browse All Products", link: "/products" }
          ];
        } else {
          botResponse = "RECOMMENDATION: I currently couldn't find any low-light fern specimens in our biological registry database. Please browse all available products.";
          suggestions = [
            { text: "Browse All Products", link: "/products" }
          ];
        }
      } else if (query.includes("water") || query.includes("verdant") || query.includes("nexus")) {
        const nexus = products.find(p => p.id === "p1") || products[0];
        if (nexus) {
          botResponse = `WATER TELEMETRY: The **${nexus.name}** has optimized water micro-pockets. Spray a gentle mist every 8 hours or perform a standard root hydration every 7 days. Make sure to monitor soil humidity via your GreenSphere dashboard.`;
          suggestions = [
            { text: `View ${nexus.name}`, link: `/products/${nexus.id}` },
            { text: "Open Watering Dashboard", link: "/dashboard/my-garden" }
          ];
        } else {
          botResponse = "WATER TELEMETRY: I currently couldn't locate details for the Verdant Nexus specimen in our registry. Please check your watering dashboard or browse other strains.";
          suggestions = [
            { text: "Open Watering Dashboard", link: "/dashboard/my-garden" },
            { text: "Browse All Products", link: "/products" }
          ];
        }
      } else {
        botResponse = "Botanical Core processed your inquiry. Based on current system metrics, we suggest cultivating low-maintenance succulents or air-purifying ferns. Would you like me to filter the catalog for Easy care specimens?";
        suggestions = [
          { text: "View Easy Care Catalog", link: "/products?difficulty=Easy" }
        ];
      }

      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: botResponse,
          timestamp: new Date(),
          suggestions
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bot Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-accent-neon hover:bg-accent-lime text-bg-deep flex items-center justify-center glow-accent hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl cursor-pointer relative group"
        >
          <MessageSquare className="w-6 h-6" />
          <Sparkles className="w-3.5 h-3.5 text-accent-neon absolute -top-1 -right-1 bg-bg-deep border border-accent-neon rounded-full p-0.5" />
          
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-bg-sec-dark text-txt-white border border-border-subtle text-xs px-3 py-1.5 rounded-xl transition-all shadow-md duration-300 pointer-events-none whitespace-nowrap">
            Consult Botanical AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-2xl glass-card border border-border-subtle shadow-2xl flex flex-col overflow-hidden animate-float-medium">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-sec-dark">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-neon/15 border border-accent-neon/20 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-accent-neon" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-txt-white flex items-center gap-1.5">
                  AI Botany Core 
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                </h4>
                <p className="text-[9px] text-txt-muted font-mono uppercase tracking-wider">Telemetry Diagnostics v2.4</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-bg-sec-light text-txt-muted hover:text-txt-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="w-6.5 h-6.5 rounded-md bg-bg-sec-light border border-border-subtle flex items-center justify-center text-accent-neon flex-shrink-0 text-[10px]">
                    🤖
                  </div>
                )}
                <div className="space-y-2">
                  <div
                    className={`rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-accent-neon text-bg-deep font-medium rounded-tr-none"
                        : "bg-bg-sec-dark border border-border-subtle text-txt-gray rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Recommendations */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, sIdx) => (
                        <Link
                          key={sIdx}
                          href={sug.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] px-2.5 py-1 rounded-lg border border-accent-neon/20 bg-accent-neon/5 hover:bg-accent-neon/15 text-accent-neon hover:border-accent-neon transition-all"
                        >
                          {sug.text}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 max-w-[80%]">
                <div className="w-6.5 h-6.5 rounded-md bg-bg-sec-light border border-border-subtle flex items-center justify-center text-accent-neon flex-shrink-0 text-[10px]">
                  🤖
                </div>
                <div className="bg-bg-sec-dark border border-border-subtle rounded-2xl rounded-tl-none p-3 text-xs text-txt-muted flex items-center gap-1">
                  Typing
                  <span className="w-1 h-1 rounded-full bg-accent-neon animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 rounded-full bg-accent-neon animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 rounded-full bg-accent-neon animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Prompts */}
          {messages.length === 1 && !isTyping && (
            <div className="px-4 pb-2 pt-1 border-t border-border-subtle/50 bg-bg-deep">
              <p className="text-[9px] uppercase tracking-wider text-txt-muted font-mono mb-2">Simulate Diagnostics</p>
              <div className="flex flex-col gap-1.5">
                {presetPrompts.map((p, pIdx) => {
                  const IconComponent = p.icon;
                  return (
                    <button
                      key={pIdx}
                      onClick={() => handleSend(p.text)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-xl border border-border-subtle bg-bg-sec-dark hover:border-accent-neon/40 hover:bg-bg-sec-light transition-all text-xs text-txt-gray cursor-pointer"
                    >
                      <IconComponent className="w-3.5 h-3.5 text-accent-neon flex-shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-border-subtle bg-bg-sec-dark flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI Core..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow px-3 py-2 text-xs rounded-xl glass-input"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-xl bg-accent-neon hover:bg-accent-lime text-bg-deep flex items-center justify-center shadow-[0_0_8px_#A3FF12] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
