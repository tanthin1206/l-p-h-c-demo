import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  Key, 
  Check, 
  AlertTriangle,
  School,
  Image as ImageIcon,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { ClassConfig, Criterion, Student, Group } from '../../types';
import { storage, DEFAULT_CONFIG, DEFAULT_CRITERIA } from '../../utils/storage';
import { soundEngine } from '../../utils/soundEngine';
import { AI_SERVICE } from '../../utils/gemini';

interface SettingsViewProps {
  config: ClassConfig;
  setConfig: React.Dispatch<React.SetStateAction<ClassConfig>>;
  criteria: Criterion[];
  setCriteria: React.Dispatch<React.SetStateAction<Criterion[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  groups: Group[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  setConfig,
  criteria,
  setCriteria,
  students,
  setStudents,
  groups
}) => {
  const [formData, setFormData] = useState<ClassConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [testKeyResult, setTestKeyResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestApiKey = async () => {
    if (!formData.geminiApiKey || !formData.geminiApiKey.trim()) {
      setTestKeyResult({ success: false, message: 'Vui lòng nhập API Key trước khi kiểm tra.' });
      return;
    }
    setIsTestingKey(true);
    setTestKeyResult(null);
    const res = await AI_SERVICE.testApiKey(formData.geminiApiKey);
    setTestKeyResult(res);
    setIsTestingKey(false);
    if (res.success) {
      soundEngine.playPointGain();
    } else {
      soundEngine.playPointDeduct();
    }
  };

  // New criterion state
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

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig(formData);
    storage.saveConfig(formData);
    soundEngine.playPointGain();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Thêm tiêu chí mới
  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrit.name) return;

    const crit: Criterion = {
      id: `c-${Date.now()}`,
      name: newCrit.name,
      points: Number(newCrit.points) || 1,
      category: newCrit.category,
      icon: newCrit.icon || '🌸',
      description: newCrit.description
    };

    const updated = [...criteria, crit];
    setCriteria(updated);
    storage.saveCriteria(updated);
    soundEngine.playPointGain();

    setNewCrit({
      name: '',
      points: 2,
      category: 'positive',
      icon: '🌸',
      description: ''
    });
  };

  const handleDeleteCriterion = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa tiêu chí chấm điểm này?")) {
      const updated = criteria.filter(c => c.id !== id);
      setCriteria(updated);
      storage.saveCriteria(updated);
      soundEngine.playPointDeduct();
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = storage.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_Trang_Nguyen_${config.className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    soundEngine.playPointGain();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importAllDataJSON(content)) {
        alert("Khôi phục dữ liệu thành công! Trang sẽ được làm mới.");
        window.location.reload();
      } else {
        alert("Tệp sao lưu không đúng định dạng. Vui lòng kiểm tra lại!");
      }
    };
    reader.readAsText(file);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm("CẢNH BÁO: Thao tác này sẽ đặt lại toàn bộ dữ liệu (học sinh, điểm số, bài tập) về mặc định ban đầu. Bạn có chắc chắn không?")) {
      storage.resetToDefault();
      window.location.reload();
    }
  };

  // Reset all points to 0
  const handleResetPointsOnly = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại điểm số của toàn bộ học sinh về 0 (khởi đầu đợt thi đua mới)?")) {
      const resetList = students.map(s => ({ ...s, points: 0, stars: 0 }));
      setStudents(resetList);
      storage.saveStudents(resetList);
      soundEngine.playFestiveDrum();
      alert("Đã đặt lại điểm số toàn bộ học sinh về 0 điểm!");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-md border border-amber-200">
        <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-serif flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-600" />
          <span>Cài Đặt Hệ Thống & Quản Trị Dữ Liệu</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Tùy chỉnh thông tin trường lớp, bộ tiêu chí chấm điểm và sao lưu / khôi phục dữ liệu
        </p>
      </div>

      {/* 1. THÔNG TIN TRƯỜNG LỚP */}
      <div id="settings-class-info" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-200">
        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <School className="w-5 h-5 text-amber-600" />
          <span>1. Thông Tin Trường Lớp & Giáo Viên</span>
        </h3>

        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên Trường</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên Lớp Học</label>
              <input
                type="text"
                value={formData.className}
                onChange={e => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-amber-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Họ Tên Giáo Viên</label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chức Danh</label>
              <input
                type="text"
                value={formData.teacherTitle}
                onChange={e => setFormData({ ...formData, teacherTitle: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Niên Khóa</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Chủ Đề Thi Đua</label>
            <input
              type="text"
              value={formData.topic}
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Khẩu Hiệu Lớp</label>
            <input
              type="text"
              value={formData.classMotto}
              onChange={e => setFormData({ ...formData, classMotto: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif italic"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thông Tin Lớp</span>
            </button>

            {saveSuccess && (
              <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs sm:text-sm animate-fadeIn">
                <Check className="w-4 h-4" />
                <span>Đã lưu thành công!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. QUẢN LÝ ẢNH BÌA & BANNER LỚP HỌC (OFFLINE CACHE 2K) */}
      <div id="settings-images-offline-management" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-200">
        <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-amber-600" />
          <span>2. Quản Lý Ảnh Bìa & Banner Offline (Bộ 3 Banner 2K)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Hệ thống lưu trữ độc lập 3 ảnh banner chất lượng cao (Trang chủ, Bảng vàng, Trò chơi) để ứng dụng có thể trình chiếu offline hoàn toàn mà không phụ thuộc vào internet.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Home Banner Card */}
          <div id="card-settings-home-banner" className="border-2 border-amber-300 rounded-2xl p-3 bg-amber-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1.5">
                <span>Trang Chủ Môn Sinh</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Offline 2K</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-amber-200 bg-slate-900/5 h-28 flex items-center justify-center mb-3">
                <img
                  src={formData.homeBanner || "/banner-trang-nguyen.png"}
                  alt="Home Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <label className="py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Tải ảnh mới</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const result = evt.target?.result as string;
                    setFormData({ ...formData, homeBanner: result });
                    storage.saveConfig({ ...config, homeBanner: result });
                    try { localStorage.setItem("offlineBannerData", result); } catch {}
                    soundEngine.playPointGain();
                    alert("Đã cập nhật banner trang chủ!");
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* 2. Tam Khoi Banner Card */}
          <div id="card-settings-tam-khoi-banner" className="border-2 border-amber-300 rounded-2xl p-3 bg-amber-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1.5">
                <span>Bảng Vàng Tam Khôi</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Offline 2K</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-amber-200 bg-slate-900/5 h-28 flex items-center justify-center mb-3">
                <img
                  src="/banner-tam-khoi.png"
                  alt="Tam Khoi Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="py-2 px-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
              <span>Độ phân giải: 2.62 MB</span>
            </div>
          </div>

          {/* 3. Game Banner Card */}
          <div id="card-settings-game-banner" className="border-2 border-amber-300 rounded-2xl p-3 bg-amber-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1.5">
                <span>Khoa Bảng Kỳ Thú</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Offline 2K</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-amber-200 bg-slate-900/5 h-28 flex items-center justify-center mb-3">
                <img
                  src="/banner-tro-choi.png"
                  alt="Game Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="py-2 px-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
              <span>Độ phân giải: 2.30 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CẤU HÌNH AI GEMINI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-200">
        <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-600" />
          <span>3. Cấu Hình Google Gemini AI API Key</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tùy chọn: Nhập khóa API Google Gemini cá nhân (miễn phí từ Google AI Studio) để tạo nhận xét học sinh và sinh câu đố Trạng Tí không giới hạn. Nếu để trống, hệ thống sẽ sử dụng các mẫu câu thông minh tích hợp sẵn.
        </p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={formData.geminiApiKey || ''}
              onChange={e => {
                setFormData({ ...formData, geminiApiKey: e.target.value });
                setTestKeyResult(null);
              }}
              className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <button
              type="button"
              disabled={isTestingKey}
              onClick={handleTestApiKey}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm rounded-xl border border-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isTestingKey ? <Loader2 className="w-4 h-4 animate-spin text-amber-700" /> : <Sparkles className="w-4 h-4 text-amber-700" />}
              <span>{isTestingKey ? 'Đang kiểm tra...' : 'Kiểm Tra Khóa AI'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setConfig(formData);
                storage.saveConfig(formData);
                soundEngine.playPointGain();
                alert("Đã lưu Gemini API Key thành công!");
              }}
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all cursor-pointer"
            >
              Lưu Key
            </button>
          </div>

          {testKeyResult && (
            <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              testKeyResult.success 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              {testKeyResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testKeyResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. QUẢN LÝ TIÊU CHÍ CHẤM ĐIỂM */}
      <div id="settings-criteria-management" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-200">
        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>4. Danh Sách Tiêu Chí Chấm Điểm ({criteria.length})</span>
        </h3>

        {/* Existing criteria list */}
        <div className="space-y-2 mb-6 max-h-72 overflow-y-auto pr-1">
          {criteria.map(crit => (
            <div
              key={crit.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{crit.icon}</span>
                <div>
                  <div className="font-bold text-slate-800">{crit.name}</div>
                  <div className="text-xs text-slate-400">{crit.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`font-black px-2.5 py-1 rounded-xl text-xs ${
                  crit.points > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }`}>
                  {crit.points > 0 ? `+${crit.points}` : crit.points} đ
                </span>
                <button
                  onClick={() => handleDeleteCriterion(crit.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                  title="Xóa tiêu chí"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new criterion form */}
        <form onSubmit={handleAddCriterion} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
          <h4 className="text-xs font-bold uppercase text-amber-900">Thêm Tiêu Chí Mới</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Tên Tiêu Chí</label>
              <input
                type="text"
                required
                placeholder="e.g. Tham gia văn nghệ lớp"
                value={newCrit.name}
                onChange={e => setNewCrit({ ...newCrit, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Loại</label>
              <select
                value={newCrit.category}
                onChange={e => setNewCrit({ ...newCrit, category: e.target.value as any })}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg focus:outline-none"
              >
                <option value="positive">Khen thưởng (+)</option>
                <option value="reminder">Nhắc nhở (-)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Điểm (+ hoặc -)</label>
              <input
                type="number"
                value={newCrit.points}
                onChange={e => setNewCrit({ ...newCrit, points: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Mô tả tiêu chí..."
              value={newCrit.description}
              onChange={e => setNewCrit({ ...newCrit, description: e.target.value })}
              className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition-all"
            >
              Thêm Tiêu Chí
            </button>
          </div>
        </form>
      </div>

      {/* 5. SAO LƯU & KHÔI PHỤC DỮ LIỆU */}
      <div id="settings-backup-danger" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-200">
        <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-600" />
          <span>5. Sao Lưu & Khôi Phục Dữ Liệu Lớp Học</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Lưu trữ toàn bộ danh sách học sinh, điểm số, bài tập và cài đặt thành tệp JSON an toàn trên máy tính của bạn.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Sao Lưu Tệp JSON</span>
          </button>

          <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Khôi Phục Từ Tệp JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetPointsOnly}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt Lại Điểm Về 0</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Thao tác này sẽ nạp 32 học sinh mẫu chia đều 4 tổ để thử nghiệm. Bạn có chắc chắn không?")) {
                const samples = storage.loadSampleStudents();
                setStudents(samples);
                alert("Đã nạp 32 học sinh mẫu thành công!");
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 border border-amber-400 font-bold text-xs sm:text-sm rounded-xl shadow transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nạp 32 Học Sinh Mẫu</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách học sinh để bắt đầu thêm lớp mới?")) {
                setStudents([]);
                storage.saveStudents([]);
                alert("Đã xóa danh sách học sinh!");
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Trắng Học Sinh (Lớp Mới)</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reset Về Mặc Định Ban Đầu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
