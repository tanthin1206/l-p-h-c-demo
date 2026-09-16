import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { Criterion } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

interface CriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: Criterion[];
  onUpdateCriteria: (criteria: Criterion[]) => void;
}

export const CriteriaModal: React.FC<CriteriaModalProps> = ({
  isOpen,
  onClose,
  criteria,
  onUpdateCriteria
}) => {
  const [newCrit, setNewCrit] = useState<{
    name: string;
    points: number;
    category: 'positive' | 'reminder';
    icon: string;
    description: string;
  }>({
    name: '',
    points: 2,
    category: 'positive',
    icon: '🌸',
    description: ''
  });

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrit.name.trim()) return;

    const crit: Criterion = {
      id: `c-${Date.now()}`,
      name: newCrit.name.trim(),
      points: Number(newCrit.points) || 1,
      category: newCrit.category,
      icon: newCrit.icon || '🌸',
      description: newCrit.description
    };

    onUpdateCriteria([...criteria, crit]);
    soundEngine.playPointGain();
    setNewCrit({
      name: '',
      points: 2,
      category: 'positive',
      icon: '🌸',
      description: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tiêu chí này không?")) {
      onUpdateCriteria(criteria.filter(c => c.id !== id));
      soundEngine.playPointDeduct();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-4 border-amber-400 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Quản Lý Tiêu Chí
          </span>
          <h3 className="text-2xl font-black text-slate-800 mt-1 font-serif">
            Cài Đặt Tiêu Chí Chấm Điểm
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thêm hoặc điều chỉnh điểm cộng/nhắc nhở cho học sinh
          </p>
        </div>

        {/* Existing criteria list */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mb-5">
          {criteria.map(crit => (
            <div
              key={crit.id}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{crit.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{crit.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{crit.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`font-black px-2.5 py-1 rounded-xl text-xs ${
                  crit.points > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }`}>
                  {crit.points > 0 ? `+${crit.points}` : crit.points} đ
                </span>
                <button
                  onClick={() => handleDelete(crit.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
                  title="Xóa tiêu chí"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new form */}
        <form onSubmit={handleAdd} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
          <h4 className="text-xs font-bold uppercase text-amber-900">Thêm Tiêu Chí Mới</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-0.5">Tên tiêu chí</label>
              <input
                type="text"
                required
                placeholder="e.g. Tham gia văn nghệ"
                value={newCrit.name}
                onChange={e => setNewCrit({ ...newCrit, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-0.5">Loại</label>
              <select
                value={newCrit.category}
                onChange={e => setNewCrit({ ...newCrit, category: e.target.value as any })}
                className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
              >
                <option value="positive">Khen thưởng (+)</option>
                <option value="reminder">Nhắc nhở (-)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-0.5">Điểm (+/-)</label>
              <input
                type="number"
                value={newCrit.points}
                onChange={e => setNewCrit({ ...newCrit, points: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Mô tả tiêu chí..."
              value={newCrit.description}
              onChange={e => setNewCrit({ ...newCrit, description: e.target.value })}
              className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition-all"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
