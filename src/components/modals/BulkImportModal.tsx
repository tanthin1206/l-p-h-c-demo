import React, { useState } from 'react';
import { X, Upload, Users, Check, FileSpreadsheet } from 'lucide-react';
import { Student, Group } from '../../types';
import { AVATAR_OPTIONS } from '../../utils/ranks';
import { soundEngine } from '../../utils/soundEngine';
import * as XLSX from 'xlsx';

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
      alert("Vui lòng dán danh sách họ tên học sinh!");
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
      alert("Không tìm thấy học sinh hợp lệ để nhập!");
      return;
    }

    onImportStudents(newStudents);
    soundEngine.playPointGain();
    alert(`Đã nạp thành công ${newStudents.length} học sinh vào lớp!`);
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
          alert(`Đã nạp thành công ${importedList.length} học sinh từ file Excel!`);
          onClose();
        } else {
          alert("Không tìm thấy dữ liệu học sinh trong file Excel!");
        }
      } catch (err) {
        console.error("Excel parse error:", err);
        alert("Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng!");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div
      id="bulk-import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none"
    >
      <div
        id="bulk-import-modal-card"
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-amber-400 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Nhập Danh Sách Học Sinh
          </span>
          <h3 className="text-2xl font-black text-slate-800 mt-1 font-serif">
            Nhập Hàng Loạt Tự Động
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Dán danh sách họ tên mỗi em 1 dòng hoặc tải lên tệp Excel (.xlsx, .csv)
          </p>
        </div>

        {/* Default group select */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Xếp vào tổ:</label>
          <select
            value={defaultGroup}
            onChange={e => setDefaultGroup(e.target.value)}
            className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Option 1: Paste Text */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Cách 1: Dán danh sách tên học sinh (mỗi em một dòng):
          </label>
          <textarea
            id="textarea-paste-students"
            rows={5}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Nguyễn Gia Bảo\nTrần Minh Khang, Nam, 2016-08-20\nLê Bảo Ngọc, Nữ, 2016-02-15`}
            className="w-full p-3 border border-amber-300 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20"
          />
        </div>

        {/* File Upload Option */}
        <div className="mb-5 p-3 bg-amber-50/70 border border-dashed border-amber-300 rounded-2xl text-center">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-slate-700">Hoặc chọn file Excel / CSV từ máy</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Tự động nhận diện cột họ tên</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
          >
            Hủy
          </button>
          <button
            onClick={handleParseAndImport}
            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow transition-all"
          >
            Nạp Học Sinh
          </button>
        </div>
      </div>
    </div>
  );
};
