import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit, Camera } from 'lucide-react';
import { Student, Group } from '../../types';
import { AVATAR_OPTIONS } from '../../utils/ranks';
import { soundEngine } from '../../utils/soundEngine';

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit: Student | null;
  groups: Group[];
  onSave: (student: Student) => void;
}

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  groups,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    gender: 'male',
    avatar: 'trau_vang',
    groupId: 'group-1',
    points: 0,
    role: 'Học sinh',
    birthDate: '2016-01-01',
    customPhotoUrl: ''
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({ ...studentToEdit });
    } else {
      setFormData({
        name: '',
        gender: 'male',
        avatar: 'trau_vang',
        groupId: groups[0]?.id || 'group-1',
        points: 0,
        role: 'Học sinh',
        birthDate: '2016-01-01',
        customPhotoUrl: ''
      });
    }
  }, [studentToEdit, isOpen, groups]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const studentToSave: Student = {
      id: studentToEdit ? studentToEdit.id : `s-${Date.now()}`,
      name: formData.name.trim(),
      gender: formData.gender || 'male',
      avatar: formData.avatar || 'trau_vang',
      groupId: formData.groupId || 'group-1',
      points: Number(formData.points) || 0,
      stars: Math.floor((Number(formData.points) || 0) / 10),
      role: formData.role || 'Học sinh',
      birthDate: formData.birthDate || '2016-01-01',
      customPhotoUrl: formData.customPhotoUrl
    };

    onSave(studentToSave);
    soundEngine.playPointGain();
    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setFormData(prev => ({ ...prev, customPhotoUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-slate-800 text-center mb-4 font-serif">
          {studentToEdit ? 'Chỉnh Sửa Hồ Sơ Học Sinh' : 'Thêm Học Sinh Mới'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Họ và Tên</label>
            <input
              type="text"
              required
              placeholder="e.g. Nguyễn Gia Bảo"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Giới Tính</label>
              <select
                value={formData.gender || 'male'}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày Sinh</label>
              <input
                type="date"
                value={formData.birthDate || '2016-01-01'}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tổ Thi Đua</label>
              <select
                value={formData.groupId || 'group-1'}
                onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chức Vụ</label>
              <select
                value={formData.role || 'Học sinh'}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Học sinh">Học sinh</option>
                <option value="Lớp trưởng">Lớp trưởng</option>
                <option value="Lớp phó học tập">Lớp phó học tập</option>
                <option value="Lớp phó phong trào">Lớp phó phong trào</option>
                <option value="Lớp phó đời sống">Lớp phó đời sống</option>
                <option value="Tổ trưởng Tổ 1">Tổ trưởng Tổ 1</option>
                <option value="Tổ trưởng Tổ 2">Tổ trưởng Tổ 2</option>
                <option value="Tổ trưởng Tổ 3">Tổ trưởng Tổ 3</option>
                <option value="Tổ trưởng Tổ 4">Tổ trưởng Tổ 4</option>
              </select>
            </div>
          </div>

          {/* Linh vật */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Linh Vật Đại Diện</label>
            <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
              {AVATAR_OPTIONS.map(av => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: av.id })}
                  className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 text-center transition-all cursor-pointer ${
                    formData.avatar === av.id ? 'border-amber-500 bg-amber-100' : 'border-transparent hover:bg-slate-200/50'
                  }`}
                >
                  <span className="text-lg">{av.emoji}</span>
                  <span className="text-[9px] font-semibold text-slate-700 truncate w-full">{av.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Photo Upload */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Hoặc ảnh chụp thật học sinh</label>
            <div className="flex items-center gap-3">
              {formData.customPhotoUrl ? (
                <img src={formData.customPhotoUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                  <Camera className="w-5 h-5" />
                </div>
              )}
              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer border border-slate-300">
                <span>Chọn ảnh từ máy</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {formData.customPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, customPhotoUrl: '' })}
                  className="text-xs text-red-600 hover:underline"
                >
                  Gỡ ảnh
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hoa Điểm Khởi Điểm</label>
            <input
              type="number"
              min="0"
              value={formData.points || 0}
              onChange={e => setFormData({ ...formData, points: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow cursor-pointer transition-all"
            >
              Lưu Thông Tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
