import React, { useState, useRef } from 'react';
import { Denomination } from '../types';
import { FellowshipLogo } from './FellowshipLogo';
import {
  Plus, Edit, Trash2, X, Save,
  Image as ImageIcon, Search, Upload, RotateCcw
} from 'lucide-react';

interface DenominationManagementProps {
  denominations: Denomination[];
  studentCounts: Record<string, number>;
  onCreate: (denom: Partial<Denomination>) => Promise<void>;
  onUpdate: (denomId: string, updates: Partial<Denomination>) => Promise<void>;
  onDelete: (denomId: string) => Promise<void>;
}

interface FormData {
  name: string;
  campusFellowship: string;
  shortCode: string;
  color: string;
  accent: string;
  logoText: string;
  description: string;
  logoImage: string | null;
}

const emptyForm: FormData = {
  name: '', campusFellowship: '', shortCode: '',
  color: '#2E7D32', accent: '#66BB6A', logoText: '', description: '',
  logoImage: null
};

export const DenominationManagement: React.FC<DenominationManagementProps> = ({
  denominations,
  studentCounts,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = denominations.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) ||
           d.shortCode.toLowerCase().includes(q) ||
           d.campusFellowship.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (denom: Denomination) => {
    setEditingId(denom.id);
    setForm({
      name: denom.name,
      campusFellowship: denom.campusFellowship,
      shortCode: denom.shortCode,
      color: denom.color,
      accent: denom.accent,
      logoText: denom.logoText,
      description: denom.description,
      logoImage: denom.logoImage || null,
    });
    setIsFormOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logoImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, logoImage: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.shortCode.trim()) return;

    if (editingId) {
      await onUpdate(editingId, form);
    } else {
      await onCreate(form);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setDeleteConfirm(null);
  };

  const previewDenom: Denomination = {
    id: 'preview',
    name: form.name,
    campusFellowship: form.campusFellowship,
    shortCode: form.shortCode,
    color: form.color,
    accent: form.accent,
    logoText: form.logoText,
    logoImage: form.logoImage,
    description: form.description,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl font-bold text-[#141414]">Denominations</h2>
          <p className="text-sm text-[#61615b]">
            Manage campus fellowships, logos, and colors. {denominations.length} total.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#141414] hover:bg-[#050505] rounded-xl shadow-sanctuary-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#f5e11d]" />
          <span>Add New Denomination</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#61615b]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fellowships..."
          className="w-full h-10 pl-10 pr-4 text-xs bg-white border border-[#dbdbd4] rounded-xl focus:outline-none focus:border-[#141414]"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((denom) => (
          <div
            key={denom.id}
            className="bg-white border border-[#e6e6e0] rounded-xl p-5 shadow-sanctuary-sm space-y-4 hover:shadow-sanctuary-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <FellowshipLogo denomination={denom} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#141414] truncate">{denom.name}</div>
                <div className="text-[11px] text-[#61615b] truncate">{denom.campusFellowship}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: denom.color }} />
                  <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: denom.accent }} />
                  <span className="text-[10px] font-mono text-[#9b9b93]">{denom.logoText}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#61615b] leading-relaxed line-clamp-2">{denom.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-[#f0f0ea]">
              <span className="text-[11px] font-semibold text-[#141414] bg-[#f8f8f2] px-2 py-0.5 rounded-full">
                {studentCounts[denom.id] || 0} students
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(denom)}
                  className="p-2 text-[#61615b] hover:text-[#141414] hover:bg-[#f4f4ee] rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(denom.id)}
                  className="p-2 text-[#9b9b93] hover:text-[#BA1A1A] hover:bg-[#FDF3F3] rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm === denom.id && (
              <div className="bg-[#FDF3F3] border border-[#F5D6D6] rounded-lg p-3 space-y-2">
                <p className="text-xs text-[#BA1A1A]">
                  Delete {denom.shortCode}? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(denom.id)}
                    className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#BA1A1A] rounded-lg hover:bg-[#8C1D1D]"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-[11px] font-semibold text-[#61615b] bg-white border border-[#dbdbd4] rounded-lg hover:bg-[#f4f4ee]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-xs text-[#61615b]">
          No fellowships match your search.
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-[#141414]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e6e6e0] rounded-2xl max-w-lg w-full p-6 shadow-sanctuary-lg space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0f0ea] pb-3">
              <h3 className="font-heading text-xl font-semibold text-[#141414]">
                {editingId ? 'Edit Denomination' : 'Add New Denomination'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-[#61615b] hover:text-[#141414]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview */}
            <div className="flex items-center gap-4 p-4 bg-[#fbfbf9] rounded-xl border border-[#e6e6e0]">
              <FellowshipLogo denomination={previewDenom} size="lg" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#61615b] font-semibold">Live Preview</div>
                <div className="font-heading text-lg font-semibold text-[#141414]">{form.shortCode || '-'}</div>
                <div className="text-xs text-[#61615b]">{form.name || 'Fellowship name'}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#141414]">Church Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs focus:outline-none focus:border-[#141414]"
                    placeholder="e.g. Assemblies of God"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#141414]">Short Code *</label>
                  <input
                    type="text"
                    value={form.shortCode}
                    onChange={(e) => setForm({ ...form, shortCode: e.target.value })}
                    className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs font-mono focus:outline-none focus:border-[#141414]"
                    placeholder="e.g. AGCM"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#141414]">Campus Fellowship (Full Name)</label>
                <input
                  type="text"
                  value={form.campusFellowship}
                  onChange={(e) => setForm({ ...form, campusFellowship: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs focus:outline-none focus:border-[#141414]"
                  placeholder="e.g. AGCM (Assemblies of God Campus Ministry)"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#141414] flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Fellowship Logo Image
                </label>
                <div className="flex items-center gap-3">
                  {form.logoImage ? (
                    <div className="relative">
                      <img
                        src={form.logoImage}
                        alt="Logo preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#141414]"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-[#BA1A1A] text-white rounded-full flex items-center justify-center hover:bg-[#8C1D1D] transition-colors"
                        title="Remove logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#f4f4ee] border-2 border-dashed border-[#dbdbd4] flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-[#9b9b93]" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 text-[11px] font-semibold text-[#141414] bg-[#f8f8f2] hover:bg-[#f6eb6e]/60 rounded-lg border border-[#f6eb6e] transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{form.logoImage ? 'Change Logo' : 'Upload Logo Image'}</span>
                    </button>
                    <p className="text-[10px] text-[#9b9b93]">
                      PNG, JPG, or SVG. Max 2MB. Shows instead of letter badge.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#141414] flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Logo Letters (fallback if no image)
                  </label>
                  <input
                    type="text"
                    value={form.logoText}
                    onChange={(e) => setForm({ ...form, logoText: e.target.value.slice(0, 3).toUpperCase() })}
                    maxLength={3}
                    className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs font-bold text-center uppercase focus:outline-none focus:border-[#141414]"
                    placeholder="AG"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#141414]">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 bg-white border border-[#dbdbd4] rounded-xl text-xs focus:outline-none focus:border-[#141414]"
                  placeholder="Brief description of the fellowship..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 font-semibold text-[#61615b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#141414] hover:bg-[#050505] rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Save Changes' : 'Create Denomination'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
