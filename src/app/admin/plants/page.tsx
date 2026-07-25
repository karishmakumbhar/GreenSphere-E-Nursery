"use client";

import React, { useState, useMemo } from "react";
import { useApp, Product } from "@/context/AppContext";
import { Plus, Search, Edit2, Trash2, X, Check } from "lucide-react";

export default function AdminPlantsPage() {
  const { products, addAdminProduct, updateAdminProduct, deleteAdminProduct } = useApp();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "", category: "Indoor Plants", price: 0, stock: 10,
    scientificName: "", description: "", details: "",
    sunlight: "Bright Indirect Light", water: "Every 7 Days", temperature: "18°C - 26°C",
    difficulty: "Medium", size: "Medium", imageUrl: "/images/monstera_albo.jpg",
    glowColor: "rgba(107, 142, 35, 0.4)", variants: ["Standard Pot"]
  });

  const filteredPlants = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleOpenModal = (plant?: Product) => {
    if (plant) {
      setEditingPlantId(plant.id);
      setFormData(plant);
    } else {
      setEditingPlantId(null);
      setFormData({
        name: "", category: "Indoor Plants", price: 0, stock: 10,
        scientificName: "", description: "", details: "",
        sunlight: "Bright Indirect Light", water: "Every 7 Days", temperature: "18°C - 26°C",
        difficulty: "Medium", size: "Medium", imageUrl: "/images/monstera_albo.jpg",
        glowColor: "rgba(107, 142, 35, 0.4)", variants: ["Standard Pot"]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlantId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlantId) {
      updateAdminProduct(editingPlantId, formData);
    } else {
      addAdminProduct(formData as Omit<Product, "id" | "rating" | "reviewsCount">);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-txt-white tracking-tight">Manage Plants</h2>
          <p className="text-xs text-txt-muted mt-1">Add, edit, or remove plants from the shop inventory.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-neon text-bg-deep font-bold text-xs hover:bg-accent-lime transition-all shadow-[0_0_15px_rgba(163,255,18,0.2)] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add New Plant
        </button>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-deep border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-txt-white focus:border-accent-neon outline-none transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle/50 text-txt-muted uppercase tracking-wider font-bold">
                <th className="pb-3 pl-2">Plant</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {filteredPlants.map((plant) => (
                <tr key={plant.id} className="hover:bg-bg-sec-light/30 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <img src={plant.imageUrl} alt={plant.name} className="w-10 h-10 rounded-lg object-cover border border-border-subtle/50" />
                      <div>
                        <p className="font-bold text-txt-white">{plant.name}</p>
                        <p className="text-[10px] text-txt-muted truncate max-w-[150px]">{plant.scientificName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-txt-muted">{plant.category}</td>
                  <td className="py-3 font-mono text-accent-neon">₹{plant.price.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${plant.stock > 0 ? 'bg-accent-green/10 text-accent-green' : 'bg-red-500/10 text-red-400'}`}>
                      {plant.stock > 0 ? `${plant.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(plant)} className="p-1.5 rounded-lg bg-bg-deep hover:bg-bg-sec-light text-blue-400 transition-colors border border-border-subtle">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => {
                        if (confirm(`Are you sure you want to delete ${plant.name}?`)) {
                          deleteAdminProduct(plant.id);
                        }
                      }} className="p-1.5 rounded-lg bg-bg-deep hover:bg-bg-sec-light text-red-400 transition-colors border border-border-subtle">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlants.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-txt-muted text-xs">No plants found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-sec-dark border border-border-subtle rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-bg-sec-dark/95 backdrop-blur z-10 p-5 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-lg font-bold text-txt-white">{editingPlantId ? "Edit Plant" : "Add New Plant"}</h3>
              <button onClick={handleCloseModal} className="text-txt-muted hover:text-white p-1 bg-bg-deep rounded-full border border-border-subtle">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Plant Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Scientific Name</label>
                  <input type="text" value={formData.scientificName} onChange={e => setFormData({...formData, scientificName: e.target.value})} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Category</label>
                  <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Price (₹)</label>
                    <input type="number" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Stock</label>
                    <input type="number" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Short Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Care Details / Instructions</label>
                <textarea required value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} rows={3} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Sunlight</label>
                  <input type="text" value={formData.sunlight} onChange={e => setFormData({...formData, sunlight: e.target.value})} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Water</label>
                  <input type="text" value={formData.water} onChange={e => setFormData({...formData, water: e.target.value})} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Temperature</label>
                  <input type="text" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Image URL</label>
                <input type="text" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="/images/your_image.png" className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2 text-xs text-txt-white focus:border-accent-neon outline-none font-mono" />
              </div>

              <div className="sticky bottom-0 bg-bg-sec-dark/95 backdrop-blur pt-4 pb-2 border-t border-border-subtle/50 flex justify-end gap-3 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-xs font-bold text-txt-muted hover:text-white bg-bg-deep border border-border-subtle rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 text-xs font-bold text-bg-deep bg-accent-neon hover:bg-accent-lime rounded-xl transition-all shadow-[0_0_15px_rgba(163,255,18,0.2)] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" /> {editingPlantId ? "Save Changes" : "Publish Plant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
