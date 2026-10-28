import React, { useState } from 'react';
import { Check, Plus, RotateCcw, Save, Trash2, Upload, X } from 'lucide-react';
import {
  BusinessInfo,
  CategoryName,
  Chandelier3DArchetype,
  CustomerInquiry,
  Product,
} from '../types/lighting';
import { PRODUCT_CATEGORIES } from '../data/productsData';
import { formatPKR } from '../utils/catalogLogic';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  onResetDefaultCatalog: () => void;
  businessInfo: BusinessInfo;
  onUpdateBusinessInfo: (info: BusinessInfo) => void;
  inquiries: CustomerInquiry[];
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  onResetDefaultCatalog,
  businessInfo,
  onUpdateBusinessInfo,
  inquiries,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'add-product' | 'business' | 'inquiries'>(
    'inventory',
  );
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newUrduName, setNewUrduName] = useState('');
  const [newSku, setNewSku] = useState(`NEF-CF-${121 + products.length}`);
  const [newCategory, setNewCategory] = useState<CategoryName>('Ceiling Fanus');
  const [newPrice, setNewPrice] = useState('14500');
  const [newOldPrice, setNewOldPrice] = useState('17000');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newArchetype, setNewArchetype] = useState<Chandelier3DArchetype>('imperial-crystal');
  const [newDimensions, setNewDimensions] = useState('Diameter: 60 cm × Height: 35 cm');
  const [newMaterial, setNewMaterial] = useState('Brushed Brass & K9 Optical Crystal');
  const [newLightType, setNewLightType] = useState('3-Color Dimmable LED (Warm / Neutral / White)');
  const [newFeatured, setNewFeatured] = useState(true);

  // Business Form State
  const [bizForm, setBizForm] = useState<BusinessInfo>(businessInfo);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleInlinePriceChange = (id: string, field: 'price' | 'oldPrice', rawValue: string) => {
    const num = Math.max(0, parseInt(rawValue.replace(/[^0-9]/g, ''), 10) || 0);
    const updated = products.map((p) => (p.id === id ? { ...p, [field]: num } : p));
    onUpdateProducts(updated);
  };

  const handleToggleFlag = (
    id: string,
    field: 'featured' | 'bestSeller' | 'newArrival',
  ) => {
    const updated = products.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p));
    onUpdateProducts(updated);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    onUpdateProducts(products.filter((p) => p.id !== id));
    notify(`Removed "${name}" from catalog.`);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      notify('Please enter a Product Name.');
      return;
    }
    const priceNum = Math.max(100, parseInt(newPrice, 10) || 8500);
    const oldPriceNum = parseInt(newOldPrice, 10) || undefined;

    const images = newImageUrl.trim()
      ? [
          newImageUrl.trim(),
          `studio:${newArchetype}:warm`,
          `studio:${newArchetype}:detail`,
          `studio:${newArchetype}:room`,
        ]
      : [
          `studio:${newArchetype}:front`,
          `studio:${newArchetype}:warm`,
          `studio:${newArchetype}:detail`,
          `studio:${newArchetype}:room`,
        ];

    const created: Product = {
      id: `prod-${Date.now()}`,
      sku: newSku.trim() || `NEF-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      urduName: newUrduName.trim() || undefined,
      category: newCategory,
      price: priceNum,
      oldPrice: oldPriceNum,
      shortDescription:
        newShortDesc.trim() ||
        `Premium ${newCategory} crafted with ${newMaterial} and warm LED illumination.`,
      description:
        newDesc.trim() ||
        `Hand-inspected ${newName.trim()} designed for Pakistani homes. Features ${newMaterial}, ${newLightType}, and complete mounting hardware.`,
      images,
      sizes: ['20 Inch Medium', '24 Inch Large'],
      colors: ['Champagne Gold', 'Antique Bronze'],
      material: newMaterial,
      lightType: newLightType,
      bulbInfo: 'Integrated High-Lumen LED Module Included',
      dimensions: newDimensions,
      installationInfo: 'Standard ceiling plate and mounting screws included.',
      availability: 'In Stock',
      featured: newFeatured,
      bestSeller: false,
      newArrival: true,
      recentlyAdded: true,
      archetype3D: newArchetype,
      defaultFinish: 'champagne-gold',
    };

    onUpdateProducts([created, ...products]);
    setNewName('');
    setNewUrduName('');
    setNewShortDesc('');
    setNewDesc('');
    setNewImageUrl('');
    setActiveTab('inventory');
    notify(`Added "${created.name}" (${formatPKR(created.price)}) to live catalog!`);
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBusinessInfo(bizForm);
    notify('Business contact details & WhatsApp ordering number updated!');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div className="relative my-auto flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#C69C47]/40 bg-[#FAF7F2] shadow-2xl">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E5DEC9] bg-[#181615] px-6 py-4 text-[#FAF7F2]">
          <div>
            <h2 id="admin-modal-title" className="font-display text-2xl font-bold text-[#FAF7F2]">
              Showroom Catalog &amp; PKR Price Manager
            </h2>
            <p className="text-xs text-[#E5DEC9]/80">
              Update Fanus prices in PKR, add new products, or change your WhatsApp ordering number.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Catalog Manager"
            className="rounded-lg border border-white/15 p-2 text-[#E5DEC9] hover:border-[#D4AF37] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9] bg-white px-6 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-[#181615] text-[#FAF7F2]'
                  : 'bg-[#FAF7F2] text-[#5C554E] hover:text-[#181615]'
              }`}
            >
              Products &amp; PKR Prices ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add-product')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'add-product'
                  ? 'bg-[#C69C47] text-[#181615]'
                  : 'bg-[#FAF7F2] text-[#5C554E] hover:text-[#181615]'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Fanus</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'business'
                  ? 'bg-[#181615] text-[#FAF7F2]'
                  : 'bg-[#FAF7F2] text-[#5C554E] hover:text-[#181615]'
              }`}
            >
              Showroom &amp; WhatsApp Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inquiries')}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'inquiries'
                  ? 'bg-[#181615] text-[#FAF7F2]'
                  : 'bg-[#FAF7F2] text-[#5C554E] hover:text-[#181615]'
              }`}
            >
              Customer Inquiries ({inquiries.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onResetDefaultCatalog();
              notify('Restored default 20 Fanus products & showroom settings.');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CBB8] px-3 py-1.5 text-xs font-medium text-[#5C554E] hover:border-[#181615] hover:text-[#181615]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Sample Data</span>
          </button>
        </div>

        {statusBanner && (
          <div className="flex items-center gap-2 bg-[#1F6E43] px-6 py-2.5 text-xs font-medium text-white">
            <Check className="h-4 w-4" />
            <span>{statusBanner}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'inventory' && (
            <div className="overflow-x-auto rounded-xl border border-[#E5DEC9] bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5DEC9] bg-[#FAF7F2] text-[#5C554E]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product Name &amp; SKU</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Price (PKR)</th>
                    <th className="px-4 py-3 font-semibold">Old Price (PKR)</th>
                    <th className="px-4 py-3 font-semibold">Showroom Highlights</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAE0]">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#181615]">{prod.name}</div>
                        <div className="text-[11px] text-[#787067]">{prod.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-[#4A443E]">{prod.category}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          aria-label={`Price in PKR for ${prod.name}`}
                          value={prod.price}
                          onChange={(e) =>
                            handleInlinePriceChange(prod.id, 'price', e.target.value)
                          }
                          className="font-tabular w-28 rounded border border-[#D5CBB8] bg-[#FAF7F2] px-2.5 py-1.5 text-xs font-semibold text-[#181615] focus:border-[#C69C47] focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          aria-label={`Old Price in PKR for ${prod.name}`}
                          value={prod.oldPrice || 0}
                          onChange={(e) =>
                            handleInlinePriceChange(prod.id, 'oldPrice', e.target.value)
                          }
                          className="font-tabular w-28 rounded border border-[#D5CBB8] bg-white px-2.5 py-1.5 text-xs text-[#6E655C] focus:border-[#C69C47] focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleFlag(prod.id, 'featured')}
                            className={`rounded px-2 py-1 text-[11px] font-medium ${
                              prod.featured
                                ? 'bg-[#181615] text-[#D4AF37]'
                                : 'bg-[#EFEAE0] text-[#6E655C]'
                            }`}
                          >
                            Featured
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFlag(prod.id, 'bestSeller')}
                            className={`rounded px-2 py-1 text-[11px] font-medium ${
                              prod.bestSeller
                                ? 'bg-[#C69C47]/25 text-[#181615] font-semibold'
                                : 'bg-[#EFEAE0] text-[#6E655C]'
                            }`}
                          >
                            Best Seller
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFlag(prod.id, 'newArrival')}
                            className={`rounded px-2 py-1 text-[11px] font-medium ${
                              prod.newArrival
                                ? 'bg-[#1F6E43]/15 text-[#1F6E43] font-semibold'
                                : 'bg-[#EFEAE0] text-[#6E655C]'
                            }`}
                          >
                            New
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          aria-label={`Remove ${prod.name}`}
                          className="inline-flex items-center gap-1 rounded border border-red-200 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'add-product' && (
            <form
              onSubmit={handleAddProductSubmit}
              className="mx-auto max-w-2xl space-y-4 rounded-xl border border-[#E5DEC9] bg-white p-6"
            >
              <h3 className="font-display text-xl font-bold text-[#181615]">
                Add New Fanus / Lighting Product
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="new-prod-name" className="block text-xs font-semibold text-[#181615]">
                    Product Name *
                  </label>
                  <input
                    id="new-prod-name"
                    type="text"
                    required
                    placeholder="e.g. Royal Emerald Crystal Fanus"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs text-[#181615]"
                  />
                </div>

                <div>
                  <label htmlFor="new-prod-urdu" className="block text-xs font-semibold text-[#181615]">
                    Urdu Name (Optional)
                  </label>
                  <input
                    id="new-prod-urdu"
                    type="text"
                    placeholder="رائل کرسٹل فانوس"
                    value={newUrduName}
                    onChange={(e) => setNewUrduName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs text-[#181615]"
                  />
                </div>

                <div>
                  <label htmlFor="new-prod-cat" className="block text-xs font-semibold text-[#181615]">
                    Category *
                  </label>
                  <select
                    id="new-prod-cat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryName)}
                    className="mt-1 w-full rounded-lg border border-[#D5CBB8] bg-white px-3 py-2 text-xs text-[#181615]"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="new-prod-3d" className="block text-xs font-semibold text-[#181615]">
                    3D Model Style
                  </label>
                  <select
                    id="new-prod-3d"
                    value={newArchetype}
                    onChange={(e) => setNewArchetype(e.target.value as Chandelier3DArchetype)}
                    className="mt-1 w-full rounded-lg border border-[#D5CBB8] bg-white px-3 py-2 text-xs text-[#181615]"
                  >
                    <option value="imperial-crystal">Imperial Tiered Crystal</option>
                    <option value="golden-rings">Modern Golden Rings</option>
                    <option value="mughal-lantern">Mughal Filigree Lantern</option>
                    <option value="cascade-cluster">Cascade Glass Globes</option>
                    <option value="wall-sconce">Decorative Wall Sconce</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="new-prod-price" className="block text-xs font-semibold text-[#181615]">
                    Price in PKR *
                  </label>
                  <input
                    id="new-prod-price"
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="font-tabular mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs font-semibold text-[#181615]"
                  />
                </div>

                <div>
                  <label htmlFor="new-prod-oldprice" className="block text-xs font-semibold text-[#181615]">
                    Old Price in PKR (For Discount)
                  </label>
                  <input
                    id="new-prod-oldprice"
                    type="number"
                    value={newOldPrice}
                    onChange={(e) => setNewOldPrice(e.target.value)}
                    className="font-tabular mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs text-[#181615]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new-prod-short" className="block text-xs font-semibold text-[#181615]">
                  Short Summary
                </label>
                <input
                  id="new-prod-short"
                  type="text"
                  placeholder="One-line description shown on product card..."
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs text-[#181615]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="new-prod-img" className="block text-xs font-semibold text-[#181615]">
                    Custom Photo URL (or Leave Blank for Studio Render)
                  </label>
                  <input
                    id="new-prod-img"
                    type="text"
                    placeholder="https://... or upload photo ->"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs text-[#181615]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#181615]">
                    Or Upload Product Photo from Device
                  </label>
                  <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#C69C47] bg-[#FAF7F2] px-3 py-2 text-xs font-medium text-[#181615] hover:bg-[#EFE9DD]">
                    <Upload className="h-3.5 w-3.5 text-[#8C6618]" />
                    <span>Choose Photo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="new-prod-sku" className="block text-xs font-semibold text-[#181615]">
                    SKU Code
                  </label>
                  <input
                    id="new-prod-sku"
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="new-prod-dim" className="block text-xs font-semibold text-[#181615]">
                    Dimensions
                  </label>
                  <input
                    id="new-prod-dim"
                    type="text"
                    value={newDimensions}
                    onChange={(e) => setNewDimensions(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#181615]">
                    <input
                      type="checkbox"
                      checked={newFeatured}
                      onChange={(e) => setNewFeatured(e.target.checked)}
                      className="h-4 w-4 accent-[#181615]"
                    />
                    <span>Show in Featured Fanus</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#181615] px-5 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-[#2E2823]"
              >
                <Plus className="h-4 w-4 text-[#D4AF37]" />
                <span>Publish Product to Catalog</span>
              </button>
            </form>
          )}

          {activeTab === 'business' && (
            <form
              onSubmit={handleSaveBusiness}
              className="mx-auto max-w-2xl space-y-4 rounded-xl border border-[#E5DEC9] bg-white p-6"
            >
              <h3 className="font-display text-xl font-bold text-[#181615]">
                Editable Showroom &amp; WhatsApp Contact Details
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="biz-name" className="block text-xs font-semibold text-[#181615]">
                    Business Name
                  </label>
                  <input
                    id="biz-name"
                    type="text"
                    value={bizForm.name}
                    onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="biz-whatsapp" className="block text-xs font-semibold text-[#181615]">
                    WhatsApp Number (International Format e.g. 923008459210)
                  </label>
                  <input
                    id="biz-whatsapp"
                    type="text"
                    value={bizForm.whatsapp}
                    onChange={(e) => setBizForm({ ...bizForm, whatsapp: e.target.value })}
                    className="font-tabular mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label htmlFor="biz-phone" className="block text-xs font-semibold text-[#181615]">
                    Display Phone Number
                  </label>
                  <input
                    id="biz-phone"
                    type="text"
                    value={bizForm.phone}
                    onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                    className="font-tabular mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="biz-email" className="block text-xs font-semibold text-[#181615]">
                    Email Address
                  </label>
                  <input
                    id="biz-email"
                    type="email"
                    value={bizForm.email}
                    onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="biz-address" className="block text-xs font-semibold text-[#181615]">
                  Showroom Street Address
                </label>
                <input
                  id="biz-address"
                  type="text"
                  value={bizForm.address}
                  onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label htmlFor="biz-hours" className="block text-xs font-semibold text-[#181615]">
                  Opening Hours
                </label>
                <input
                  id="biz-hours"
                  type="text"
                  value={bizForm.openingHours}
                  onChange={(e) => setBizForm({ ...bizForm, openingHours: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D5CBB8] px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="biz-delivery"
                  type="checkbox"
                  checked={bizForm.homeDeliveryEnabled}
                  onChange={(e) =>
                    setBizForm({ ...bizForm, homeDeliveryEnabled: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#181615]"
                />
                <label htmlFor="biz-delivery" className="text-xs font-medium text-[#181615]">
                  Enable Nationwide Home Delivery Section in About Us &amp; Product Pages
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#181615] px-5 py-2.5 text-xs font-semibold text-[#FAF7F2] hover:bg-[#2E2823]"
              >
                <Save className="h-4 w-4 text-[#D4AF37]" />
                <span>Save Showroom Settings</span>
              </button>
            </form>
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="rounded-xl border border-[#E5DEC9] bg-white p-8 text-center text-xs text-[#6E655C]">
                  No customer inquiries submitted yet. Inquiries sent via the Contact page appear here.
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="rounded-xl border border-[#E5DEC9] bg-white p-4 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFEAE0] pb-2">
                      <span className="font-semibold text-[#181615]">
                        {inq.name} · <span className="font-tabular">{inq.phone}</span>
                      </span>
                      <span className="text-[#787067]">{inq.createdAt}</span>
                    </div>
                    <p className="mt-2 font-semibold text-[#8C6618]">
                      Product / Subject: {inq.subject}
                    </p>
                    <p className="mt-1 text-[#4A443E]">{inq.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
