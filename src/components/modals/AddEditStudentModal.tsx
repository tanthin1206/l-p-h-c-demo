import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Camera, Save } from 'lucide-react';
import { Student, Group } from '../../types';
import { AVATAR_OPTIONS } from '../../utils/ranks';
import { soundEngine } from '../../utils/soundEngine';
import { Modal, Button } from '../ui';

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit: Student | null;
  groups: Group[];
  onSave: (student: Student) => void;
}

const FORM_ID = 'form-add-edit-student';

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-bold text-ink-soft mb-1">{children}</label>
);

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
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={studentToEdit ? Edit : UserPlus}
      title={studentToEdit ? 'Chỉnh Sửa Hồ Sơ Học Sinh' : 'Thêm Học Sinh Mới'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={FORM_ID} variant="primary" icon={Save}>
            Lưu Thông Tin
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-3.5 font-sans">
        <div>
          <Label>Họ và Tên</Label>
          <input
            type="text"
            required
            placeholder="e.g. Nguyễn Gia Bảo"
            value={formData.name || ''}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="input font-bold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Giới Tính</Label>
            <select
              value={formData.gender || 'male'}
              onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
              className="input"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>
          <div>
            <Label>Ngày Sinh</Label>
            <input
              type="date"
              value={formData.birthDate || '2016-01-01'}
              onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Tổ Thi Đua</Label>
            <select
              value={formData.groupId || 'group-1'}
              onChange={e => setFormData({ ...formData, groupId: e.target.value })}
              className="input"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Chức Vụ</Label>
            <select
              value={formData.role || 'Học sinh'}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="input"
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
          <Label>Linh Vật Đại Diện</Label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-paper border border-paper-line rounded-xl">
            {AVATAR_OPTIONS.map(av => (
              <button
                key={av.id}
                type="button"
                onClick={() => setFormData({ ...formData, avatar: av.id })}
                className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 text-center transition-all cursor-pointer ${
                  formData.avatar === av.id ? 'border-gold-500 bg-gold-100 shadow-inner-gold' : 'border-transparent hover:bg-paper-warm'
                }`}
              >
                <span className="text-lg">{av.emoji}</span>
                <span className="text-[9px] font-semibold text-ink-soft truncate w-full">{av.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Photo Upload */}
        <div>
          <Label>Hoặc ảnh chụp thật học sinh</Label>
          <div className="flex items-center gap-3 flex-wrap">
            {formData.customPhotoUrl ? (
              <img src={formData.customPhotoUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border-2 border-gold-400" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-paper border border-dashed border-paper-line flex items-center justify-center text-ink-muted">
                <Camera className="w-5 h-5" />
              </div>
            )}
            <label className="inline-flex items-center px-3 py-1.5 bg-white border border-paper-line hover:border-gold-400 text-ink-soft hover:text-ink font-bold rounded-lg text-xs cursor-pointer transition-all">
              <span>Chọn ảnh từ máy</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {formData.customPhotoUrl && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customPhotoUrl: '' })}
                className="text-xs font-bold text-primary-700 hover:underline cursor-pointer"
              >
                Gỡ ảnh
              </button>
            )}
          </div>
        </div>

        <div>
          <Label>Hoa Điểm Khởi Điểm</Label>
          <input
            type="number"
            min="0"
            value={formData.points || 0}
            onChange={e => setFormData({ ...formData, points: Number(e.target.value) })}
            className="input"
          />
        </div>
      </form>
    </Modal>
  );
};
