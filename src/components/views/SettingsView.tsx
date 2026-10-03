import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Key,
  Check,
  AlertTriangle,
  School,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  ListChecks,
  Database,
  Bot
} from 'lucide-react';
import { ClassConfig, Criterion, Student, Group } from '../../types';
import { storage } from '../../utils/storage';
import { soundEngine } from '../../utils/soundEngine';
import { AI_SERVICE } from '../../utils/gemini';
import { getAssetUrl } from '../../utils/assets';
import { notify, confirmDialog } from '../ui/dialog';
import { Button, Card, PageHeader } from '../ui';

interface SettingsViewProps {
  config: ClassConfig;
  setConfig: React.Dispatch<React.SetStateAction<ClassConfig>>;
  criteria: Criterion[];
  setCriteria: React.Dispatch<React.SetStateAction<Criterion[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  groups: Group[];
}

type SettingsTab = 'class' | 'criteria' | 'appearance' | 'data' | 'ai';

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'class', label: 'Lớp học', icon: School },
  { id: 'criteria', label: 'Tiêu chí chấm điểm', icon: ListChecks },
  { id: 'appearance', label: 'Giao diện & ảnh bìa', icon: ImageIcon },
  { id: 'data', label: 'Dữ liệu & sao lưu', icon: Database },
  { id: 'ai', label: 'AI', icon: Bot },
];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-bold text-ink-soft mb-1">{children}</label>
);

const SectionTitle: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: React.ReactNode;
}> = ({ icon: Icon, title, description }) => (
  <div className="mb-4">
    <h3 className="text-base sm:text-lg font-black font-serif text-ink flex items-center gap-2">
      <span className="w-8 h-8 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <span>{title}</span>
    </h3>
    {description && <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">{description}</p>}
  </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  setConfig,
  criteria,
  setCriteria,
  students,
  setStudents,
  groups
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('class');
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

  const handleDeleteCriterion = async (id: string) => {
    if (await confirmDialog("Bạn có chắc muốn xóa tiêu chí chấm điểm này?")) {
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
        notify("Khôi phục dữ liệu thành công! Trang sẽ được làm mới.", 'success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        notify("Tệp sao lưu không đúng định dạng. Vui lòng kiểm tra lại!");
      }
    };
    reader.readAsText(file);
  };

  // Reset to default
  const handleResetToDefault = async () => {
    if (await confirmDialog("CẢNH BÁO: Thao tác này sẽ đặt lại toàn bộ dữ liệu (học sinh, điểm số, bài tập) về mặc định ban đầu. Bạn có chắc chắn không?")) {
      storage.resetToDefault();
      window.location.reload();
    }
  };

  // Reset all points to 0
  const handleResetPointsOnly = async () => {
    if (await confirmDialog("Bạn có chắc chắn muốn đặt lại điểm số của toàn bộ học sinh về 0 (khởi đầu đợt thi đua mới)?")) {
      const resetList = students.map(s => ({ ...s, points: 0, stars: 0 }));
      setStudents(resetList);
      storage.saveStudents(resetList);
      soundEngine.playFestiveDrum();
      notify("Đã đặt lại điểm số toàn bộ học sinh về 0 điểm!");
    }
  };

  const handleLoadSamples = async () => {
    if (await confirmDialog("Thao tác này sẽ nạp 32 học sinh mẫu chia đều 4 tổ để thử nghiệm. Bạn có chắc chắn không?")) {
      const samples = storage.loadSampleStudents();
      setStudents(samples);
      notify("Đã nạp 32 học sinh mẫu thành công!");
    }
  };

  const handleClearStudents = async () => {
    if (await confirmDialog("Bạn có chắc chắn muốn xóa toàn bộ danh sách học sinh để bắt đầu thêm lớp mới?")) {
      setStudents([]);
      storage.saveStudents([]);
      notify("Đã xóa danh sách học sinh!");
    }
  };

  const handleHomeBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setFormData({ ...formData, homeBanner: result });
      storage.saveConfig({ ...config, homeBanner: result });
      try { localStorage.setItem("offlineBannerData", result); } catch {}
      soundEngine.playPointGain();
      notify("Đã cập nhật banner trang chủ!");
    };
    reader.readAsDataURL(file);
  };

  const positiveCount = criteria.filter(c => c.points > 0).length;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        icon={Settings}
        title="Cài Đặt Hệ Thống & Quản Trị Dữ Liệu"
        subtitle="Tùy chỉnh thông tin trường lớp, bộ tiêu chí chấm điểm và sao lưu / khôi phục dữ liệu"
      />

      {/* Tabs (segmented control) */}
      <div
        role="tablist"
        aria-label="Nhóm cài đặt"
        className="flex gap-1.5 overflow-x-auto scrollbar-none p-1.5 mb-5 bg-paper-warm border border-paper-line rounded-2xl"
      >
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.id)}
              className={`chip flex items-center gap-1.5 shrink-0 ${active ? 'chip-active' : ''}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. THÔNG TIN TRƯỜNG LỚP */}
      {activeTab === 'class' && (
        <Card id="settings-class-info" className="p-5 sm:p-7 animate-fade-in">
          <SectionTitle icon={School} title="Thông Tin Trường Lớp & Giáo Viên" />

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tên Trường</Label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <Label>Tên Lớp Học</Label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={e => setFormData({ ...formData, className: e.target.value })}
                  className="input font-bold text-primary-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Họ Tên Giáo Viên</Label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <Label>Chức Danh</Label>
                <input
                  type="text"
                  value={formData.teacherTitle}
                  onChange={e => setFormData({ ...formData, teacherTitle: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <Label>Niên Khóa</Label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <Label>Chủ Đề Thi Đua</Label>
              <input
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                className="input font-bold"
              />
            </div>

            <div>
              <Label>Khẩu Hiệu Lớp</Label>
              <input
                type="text"
                value={formData.classMotto}
                onChange={e => setFormData({ ...formData, classMotto: e.target.value })}
                className="input font-serif italic"
              />
            </div>

            <div className="pt-3 border-t border-paper-line flex flex-wrap items-center justify-between gap-3">
              {saveSuccess ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs sm:text-sm animate-fade-in">
                  <Check className="w-4 h-4" />
                  <span>Đã lưu thành công!</span>
                </span>
              ) : <span />}
              <Button type="submit" variant="primary" icon={Save}>
                Lưu Thông Tin Lớp
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 2. QUẢN LÝ TIÊU CHÍ CHẤM ĐIỂM */}
      {activeTab === 'criteria' && (
        <div id="settings-criteria-management" className="grid grid-cols-1 lg:grid-cols-5 gap-4 animate-fade-in">
          <Card className="p-5 sm:p-6 lg:col-span-3">
            <SectionTitle
              icon={Sparkles}
              title={`Danh Sách Tiêu Chí Chấm Điểm (${criteria.length})`}
              description={`${positiveCount} tiêu chí khen thưởng • ${criteria.length - positiveCount} tiêu chí nhắc nhở`}
            />

            <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
              {criteria.map(crit => (
                <div
                  key={crit.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-paper border border-paper-line text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{crit.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-ink truncate">{crit.name}</div>
                      <div className="text-xs text-ink-muted truncate">{crit.description}</div>
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
                      onClick={() => handleDeleteCriterion(crit.id)}
                      className="p-1.5 text-ink-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all cursor-pointer"
                      title="Xóa tiêu chí"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6 lg:col-span-2 self-start">
            <form onSubmit={handleAddCriterion} className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wide text-primary-800">Thêm Tiêu Chí Mới</h4>
              <div>
                <Label>Tên Tiêu Chí</Label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tham gia văn nghệ lớp"
                  value={newCrit.name}
                  onChange={e => setNewCrit({ ...newCrit, name: e.target.value })}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                  <Label>Điểm (+ hoặc -)</Label>
                  <input
                    type="number"
                    value={newCrit.points}
                    onChange={e => setNewCrit({ ...newCrit, points: Number(e.target.value) })}
                    className="input font-bold"
                  />
                </div>
              </div>
              <div>
                <Label>Mô tả</Label>
                <input
                  type="text"
                  placeholder="Mô tả tiêu chí..."
                  value={newCrit.description}
                  onChange={e => setNewCrit({ ...newCrit, description: e.target.value })}
                  className="input"
                />
              </div>
              <Button type="submit" variant="success" className="w-full">
                Thêm Tiêu Chí
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* 3. QUẢN LÝ ẢNH BÌA & BANNER LỚP HỌC (OFFLINE CACHE 2K) */}
      {activeTab === 'appearance' && (
        <Card id="settings-images-offline-management" className="p-5 sm:p-7 animate-fade-in">
          <SectionTitle
            icon={ImageIcon}
            title="Quản Lý Ảnh Bìa & Banner Offline (Bộ 3 Banner 2K)"
            description="Hệ thống lưu trữ độc lập 3 ảnh banner chất lượng cao (Trang chủ, Bảng vàng, Trò chơi) để ứng dụng có thể trình chiếu offline hoàn toàn mà không phụ thuộc vào internet."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Home Banner Card */}
            <div id="card-settings-home-banner" className="rounded-2xl p-3 bg-paper-warm border border-paper-line flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-ink mb-2">
                  <span>Trang Chủ Môn Sinh</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Offline 2K</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-paper-line bg-white h-28 flex items-center justify-center mb-3">
                  <img
                    src={getAssetUrl(formData.homeBanner || "/banner-trang-nguyen.png")}
                    alt="Home Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <label className="py-2 px-3 bg-gold-100 hover:bg-gold-200 text-gold-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh mới</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHomeBannerUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Tam Khoi Banner Card */}
            <div id="card-settings-tam-khoi-banner" className="rounded-2xl p-3 bg-paper-warm border border-paper-line flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-ink mb-2">
                  <span>Bảng Vàng Tam Khôi</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Offline 2K</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-paper-line bg-white h-28 flex items-center justify-center mb-3">
                  <img
                    src={getAssetUrl("/banner-tam-khoi.png")}
                    alt="Tam Khoi Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="py-2 px-3 bg-white border border-paper-line text-ink-soft text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                <span>Độ phân giải: 2.62 MB</span>
              </div>
            </div>

            {/* Game Banner Card */}
            <div id="card-settings-game-banner" className="rounded-2xl p-3 bg-paper-warm border border-paper-line flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-ink mb-2">
                  <span>Khoa Bảng Kỳ Thú</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Offline 2K</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-paper-line bg-white h-28 flex items-center justify-center mb-3">
                  <img
                    src={getAssetUrl("/banner-tro-choi.png")}
                    alt="Game Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="py-2 px-3 bg-white border border-paper-line text-ink-soft text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                <span>Độ phân giải: 2.30 MB</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 4. SAO LƯU & KHÔI PHỤC DỮ LIỆU */}
      {activeTab === 'data' && (
        <div id="settings-backup-danger" className="space-y-4 animate-fade-in">
          <Card className="p-5 sm:p-7">
            <SectionTitle
              icon={Download}
              title="Sao Lưu & Khôi Phục Dữ Liệu Lớp Học"
              description="Lưu trữ toàn bộ danh sách học sinh, điểm số, bài tập và cài đặt thành tệp JSON an toàn trên máy tính của bạn."
            />
            <div className="flex flex-wrap gap-2.5">
              <Button variant="success" icon={Download} onClick={handleExportJSON}>
                Xuất Sao Lưu Tệp JSON
              </Button>
              <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl bg-white border border-paper-line hover:border-gold-400 text-ink-soft hover:text-ink cursor-pointer transition-all active:scale-[0.97]">
                <Upload className="w-4 h-4" />
                <span>Khôi Phục Từ Tệp JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </Card>

          {/* Vùng nguy hiểm */}
          <div className="rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/60 p-5 sm:p-7">
            <h3 className="text-base sm:text-lg font-black font-serif text-primary-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Vùng nguy hiểm</span>
            </h3>
            <p className="text-xs text-primary-900/70 mt-1 mb-4">
              Các thao tác dưới đây thay đổi hoặc xóa dữ liệu lớp học và không thể hoàn tác. Hãy xuất sao lưu trước khi thực hiện.
            </p>

            <div className="divide-y divide-primary-100 rounded-xl bg-white border border-primary-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink">Đặt lại điểm về 0</div>
                  <div className="text-xs text-ink-muted">Khởi đầu đợt thi đua mới, giữ nguyên danh sách học sinh.</div>
                </div>
                <Button variant="outline" icon={RotateCcw} onClick={handleResetPointsOnly} className="shrink-0">
                  Đặt Lại Điểm Về 0
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink">Nạp học sinh mẫu</div>
                  <div className="text-xs text-ink-muted">Thay danh sách hiện tại bằng 32 học sinh mẫu chia đều 4 tổ.</div>
                </div>
                <Button variant="gold" icon={Sparkles} onClick={handleLoadSamples} className="shrink-0">
                  Nạp 32 Học Sinh Mẫu
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink">Xóa trắng học sinh</div>
                  <div className="text-xs text-ink-muted">Xóa toàn bộ danh sách để bắt đầu thêm lớp mới.</div>
                </div>
                <Button variant="danger" icon={Trash2} onClick={handleClearStudents} className="shrink-0">
                  Xóa Trắng Học Sinh (Lớp Mới)
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink">Reset về mặc định</div>
                  <div className="text-xs text-ink-muted">Đặt lại toàn bộ dữ liệu (học sinh, điểm số, bài tập) về ban đầu.</div>
                </div>
                <Button variant="danger" icon={AlertTriangle} onClick={handleResetToDefault} className="shrink-0">
                  Reset Về Mặc Định Ban Đầu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CẤU HÌNH AI GEMINI */}
      {activeTab === 'ai' && (
        <Card id="settings-ai-config" className="p-5 sm:p-7 animate-fade-in">
          <SectionTitle
            icon={Key}
            title="Cấu Hình Google Gemini AI API Key"
            description="Tùy chọn: Nhập khóa API Google Gemini cá nhân (miễn phí từ Google AI Studio) để tạo nhận xét học sinh và sinh câu đố Trạng Tí không giới hạn. Nếu để trống, hệ thống sẽ sử dụng các mẫu câu thông minh tích hợp sẵn."
          />

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
                className="input flex-1 font-mono"
              />
              <Button
                variant="outline"
                disabled={isTestingKey}
                onClick={handleTestApiKey}
                className="shrink-0"
              >
                {isTestingKey ? <Loader2 className="w-4 h-4 animate-spin text-gold-700" /> : <Sparkles className="w-4 h-4 text-gold-700" />}
                <span>{isTestingKey ? 'Đang kiểm tra...' : 'Kiểm Tra Khóa AI'}</span>
              </Button>
              <Button
                variant="primary"
                icon={Save}
                className="shrink-0"
                onClick={() => {
                  setConfig(formData);
                  storage.saveConfig(formData);
                  soundEngine.playPointGain();
                  notify("Đã lưu Gemini API Key thành công!");
                }}
              >
                Lưu Key
              </Button>
            </div>

            {testKeyResult && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-fade-in ${
                testKeyResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-primary-50 border-primary-200 text-primary-800'
              }`}>
                {testKeyResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-primary-600 shrink-0" />
                )}
                <span>{testKeyResult.message}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
