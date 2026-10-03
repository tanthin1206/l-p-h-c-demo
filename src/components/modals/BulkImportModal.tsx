import React, { useState } from 'react';
import { X, Upload, Users, FileSpreadsheet } from 'lucide-react';
import { Student, Group } from '../../types';
import { AVATAR_OPTIONS } from '../../utils/ranks';
import { soundEngine } from '../../utils/soundEngine';
import * as XLSX from 'xlsx';
import { notify } from '../ui/dialog';
import { Button } from '../ui';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStudents: Student[];
  groups: Group[];
  onImportStudents: (newStudents: Student[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  existingStudents,
  groups,
  onImportStudents
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [defaultGroup, setDefaultGroup] = useState<string>(groups[0]?.id || 'group-1');

  if (!isOpen) return null;

  const handleParseAndImport = () => {
    if (!inputText.trim()) {
      notify("Vui lòng dán danh sách họ tên học sinh!");
      return;
    }

    const lines = inputText.split('\n').map(l => l.trim()).filter(Boolean);
    const newStudents: Student[] = [];

    lines.forEach((line, index) => {
      // Allow format: "Nguyen Van A, Nam, 2016-05-12" or just "Nguyen Van A"
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const name = parts[0];
      if (!name) return;

      const gender = (parts[1]?.toLowerCase().includes('nữ') || parts[1]?.toLowerCase() === 'female') ? 'female' : 'male';
      const birthDate = parts[2] || '2016-01-01';

      // Pick random avatar
      const randAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)].id;

      newStudents.push({
        id: `s-${Date.now()}-${index}`,
        name,
        gender,
        avatar: randAvatar,
        groupId: defaultGroup,
        points: 0,
        stars: 0,
        role: 'Học sinh',
        birthDate
      });
    });

    if (newStudents.length === 0) {
      notify("Không tìm thấy học sinh hợp lệ để nhập!");
      return;
    }

    onImportStudents(newStudents);
    soundEngine.playPointGain();
    notify(`Đã nạp thành công ${newStudents.length} học sinh vào lớp!`);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        const importedList: Student[] = [];
        // Skip header if needed
        json.slice(1).forEach((row: any[], i) => {
          if (!row || !row[0]) return;
          const name = String(row[1] || row[0]).trim();
          if (!name || name.toLowerCase().includes('họ') || name.toLowerCase().includes('tên')) return;

          const gender = String(row[2] || '').toLowerCase().includes('nữ') ? 'female' : 'male';
          const birthDate = String(row[3] || '2016-01-01');
          const randAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)].id;

          importedList.push({
            id: `s-excel-${Date.now()}-${i}`,
            name,
            gender,
            avatar: randAvatar,
            groupId: defaultGroup,
            points: Number(row[4]) || 0,
            stars: Math.floor((Number(row[4]) || 0) / 10),
            role: 'Học sinh',
            birthDate
          });
        });

        if (importedList.length > 0) {
          onImportStudents(importedList);
          soundEngine.playPointGain();
          notify(`Đã nạp thành công ${importedList.length} học sinh từ file Excel!`);
          onClose();
        } else {
          notify("Không tìm thấy dữ liệu học sinh trong file Excel!");
        }
      } catch (err) {
        console.error("Excel parse error:", err);
        notify("Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng!");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div
      id="bulk-import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary-950/55 backdrop-blur-[2px] animate-fade-in font-sans"
    >
      <div
        id="bulk-import-modal-card"
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-3xl w-full max-w-lg shadow-pop border border-paper-line flex flex-col max-h-[94vh] overflow-hidden animate-pop-in"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-paper-line bg-gradient-to-b from-paper-warm to-white">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-gold-200 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-black font-serif text-ink leading-tight">Nhập Hàng Loạt Tự Động</h2>
            <div className="text-xs text-ink-muted mt-0.5">
              Nhập Danh Sách Học Sinh • Dán danh sách họ tên mỗi em 1 dòng hoặc tải lên tệp Excel (.xlsx, .csv)
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg text-ink-muted hover:bg-paper-warm hover:text-ink cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {/* Default group select */}
          <div>
            <label className="block text-xs font-bold text-ink-soft mb-1">Xếp vào tổ:</label>
            <select
              value={defaultGroup}
              onChange={e => setDefaultGroup(e.target.value)}
              className="input font-semibold"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Option 1: Paste Text */}
          <div>
            <label className="block text-xs font-bold text-ink-soft mb-1">
              Cách 1: Dán danh sách tên học sinh (mỗi em một dòng):
            </label>
            <textarea
              id="textarea-paste-students"
              rows={6}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Nguyễn Gia Bảo\nTrần Minh Khang, Nam, 2016-08-20\nLê Bảo Ngọc, Nữ, 2016-02-15`}
              className="input font-mono text-xs leading-relaxed resize-y"
            />
          </div>

          {/* File Upload Option */}
          <label className="flex flex-col items-center justify-center p-4 bg-paper-warm hover:bg-gold-50 border-2 border-dashed border-paper-line hover:border-gold-400 rounded-2xl text-center cursor-pointer transition-colors select-none">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-ink">Hoặc chọn file Excel / CSV từ máy</span>
            <span className="text-[10px] text-ink-muted mt-0.5">Tự động nhận diện cột họ tên</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-paper-line bg-paper-warm flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" icon={Upload} onClick={handleParseAndImport}>
            Nạp Học Sinh
          </Button>
        </div>
      </div>
    </div>
  );
};
