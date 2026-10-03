import React, { useState } from 'react';
import { ListChecks, Plus, Trash2 } from 'lucide-react';
import { Criterion } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { confirmDialog } from '../ui/dialog';
import { Modal, Button } from '../ui';

interface CriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: Criterion[];
  onUpdateCriteria: (criteria: Criterion[]) => void;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-bold text-ink-soft mb-1">{children}</label>
);

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

  const handleDelete = async (id: string) => {
    if (await confirmDialog("Bạn có chắc chắn muốn xóa tiêu chí này không?")) {
      onUpdateCriteria(criteria.filter(c => c.id !== id));
      soundEngine.playPointDeduct();
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={ListChecks}
      title="Cài Đặt Tiêu Chí Chấm Điểm"
      subtitle="Quản Lý Tiêu Chí • Thêm hoặc điều chỉnh điểm cộng/nhắc nhở cho học sinh"
      footer={
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="font-sans">
        {/* Existing criteria list */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-5">
          {criteria.map(crit => (
            <div
              key={crit.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-paper border border-paper-line text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{crit.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-ink truncate">{crit.name}</div>
                  <div className="text-[11px] text-ink-muted truncate">{crit.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`font-black px-2.5 py-1 rounded-xl text-xs ${
                  crit.points > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-primary-100 text-primary-800'
                }`}>
                  {crit.points > 0 ? `+${crit.points}` : crit.points} đ
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(crit.id)}
                  className="p-1.5 text-ink-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all cursor-pointer"
                  title="Xóa tiêu chí"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new form */}
        <form onSubmit={handleAdd} className="p-4 bg-paper-warm rounded-2xl border border-paper-line space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wide text-primary-800">Thêm Tiêu Chí Mới</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Label>Tên tiêu chí</Label>
              <input
                type="text"
                required
                placeholder="e.g. Tham gia văn nghệ"
                value={newCrit.name}
                onChange={e => setNewCrit({ ...newCrit, name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <Label>Loại</Label>
              <select
                value={newCrit.category}
                onChange={e => setNewCrit({ ...newCrit, category: e.target.value as any })}
                className="input"
              >
                <option value="positive">Khen thưởng (+)</option>
                <option value="reminder">Nhắc nhở (-)</option>
              </select>
            </div>
            <div>
              <Label>Điểm (+/-)</Label>
              <input
                type="number"
                value={newCrit.points}
                onChange={e => setNewCrit({ ...newCrit, points: Number(e.target.value) })}
                className="input font-bold"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Mô tả tiêu chí..."
              value={newCrit.description}
              onChange={e => setNewCrit({ ...newCrit, description: e.target.value })}
              className="input flex-1"
            />
            <Button type="submit" variant="success" icon={Plus} className="shrink-0">
              Thêm
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
