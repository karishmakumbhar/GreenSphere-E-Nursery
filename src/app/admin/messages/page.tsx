"use client";

import React, { useEffect, useState } from "react";
import { Search, Mail, Trash2, CheckCircle, Clock, MoreVertical, X } from "lucide-react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE'
      });
      if (selectedMessage?.id === id) setSelectedMessage(null);
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center text-txt-muted animate-pulse">Loading inquiries...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-accent-neon" /> Inquiry Inbox
          </h1>
          <p className="text-sm text-txt-gray mt-1">Manage customer support and contact messages.</p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-bg-sec-dark border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-txt-white focus:outline-none focus:border-accent-neon"
          />
          <Search className="w-4 h-4 text-txt-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Messages List */}
        <div className="lg:col-span-1 bg-bg-sec-dark/50 border border-border-subtle rounded-2xl overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 border-b border-border-subtle bg-bg-sec-dark/80">
            <h3 className="text-sm font-bold text-txt-white">All Messages ({filteredMessages.length})</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filteredMessages.length === 0 ? (
              <p className="text-center text-sm text-txt-muted mt-8">No messages found.</p>
            ) : (
              filteredMessages.map(msg => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedMessage?.id === msg.id 
                      ? 'bg-accent-neon/10 border-accent-neon/30' 
                      : 'bg-bg-deep border-border-subtle hover:border-accent-neon/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm text-txt-white truncate pr-2">{msg.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      msg.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                      msg.status === 'Replied' ? 'bg-accent-green/20 text-accent-neon' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-xs text-txt-gray truncate">{msg.subject}</p>
                  <p className="text-[10px] text-txt-muted mt-2">{new Date(msg.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Viewer */}
        <div className="lg:col-span-2 bg-bg-sec-dark/50 border border-border-subtle rounded-2xl overflow-hidden h-[600px] flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-border-subtle flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-txt-white mb-2">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-accent-neon">{selectedMessage.name}</span>
                    <span className="text-txt-muted">({selectedMessage.email})</span>
                  </div>
                  <p className="text-xs text-txt-muted mt-1">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedMessage.status !== 'Replied' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'Replied')}
                      className="px-3 py-1.5 bg-accent-green text-white text-xs font-bold rounded-lg hover:bg-accent-lime transition-colors"
                    >
                      Mark Replied
                    </button>
                  )}
                  {selectedMessage.status === 'New' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'Read')}
                      className="px-3 py-1.5 bg-bg-deep border border-border-subtle text-txt-white text-xs font-bold rounded-lg hover:border-accent-neon transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="bg-bg-deep p-6 rounded-2xl border border-border-subtle">
                  <p className="text-sm text-txt-white whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-txt-muted">
              <Mail className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
