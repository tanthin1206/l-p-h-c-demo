import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  Upload, 
  RotateCcw, 
  Save, 
  Gamepad2, 
  AlertCircle,
  Maximize2,
  Compass,
  ZoomIn
} from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export interface GameBannerConfig {
  bannerUrl?: string;
  position: 'left' | 'center' | 'right';
  zoom: number;
  fit: 'cover' | 'contain';
}

interface GameBannerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBannerUrl?: string;
  currentPosition?: 'left' | 'center' | 'right';
  currentZoom?: number;
  currentFit?: 'cover' | 'contain';
  onSave: (config: GameBannerConfig) => void;
  onRestoreDefault: () => void;
}

export const GameBannerEditorModal: React.FC<GameBannerEditorModalProps> = ({
  isOpen,
  onClose,
  currentBannerUrl,
  currentPosition = 'center',
  currentZoom = 100,
  currentFit = 'cover',
  onSave,
  onRestoreDefault
}) => {
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(currentBannerUrl);
  const [position, setPosition] = useState<'left' | 'center' | 'right'>(currentPosition);
  const [zoom, setZoom] = useState<number>(currentZoom);
  const [fit, setFit] = useState<'cover' | 'contain'>(currentFit);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBannerUrl(currentBannerUrl);
      setPosition(currentPosition || 'center');
      setZoom(currentZoom || 100);
      setFit(currentFit || 'cover');
      setErrorMsg(null);
    }
  }, [isOpen, currentBannerUrl, currentPosition, currentZoom, currentFit]);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setIsOptimizing(true);
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('INVALID_FORMAT');
      }

      // Read as Data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBannerUrl(result);
        soundEngine.playPointGain();
        setIsOptimizing(false);
      };
      reader.onerror = () => {
        throw new Error('READ_ERROR');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      if (err.message === 'INVALID_FORMAT') {
        setErrorMsg('⚠️ Vui lòng chọn hình ảnh JPG, PNG hoặc WebP hợp lệ.');
      } else {
        setErrorMsg('⚠️ Không thể xử lý ảnh này. Vui lòng thử lại với ảnh khác.');
      }
      soundEngine.playPointDeduct();
      setIsOptimizing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    onSave({
      bannerUrl,
      position,
      zoom,
      fit
    });
    soundEngine.playPointGain();
    onClose();
  };

  const handleRestore = () => {
    setBannerUrl(undefined);
    setPosition('center');
    setZoom(100);
    setFit('cover');
    onRestoreDefault();
    soundEngine.playPointGain();
    onClose();
  };

  const effectiveBanner = bannerUrl || '/banner-tro-choi.png';
  const backgroundPosition = position === 'left' ? 'left center' : position === 'right' ? 'right center' : 'center center';

  return (
    <div
      id="modal-game-banner-editor"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border-4 border-amber-400 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-amber-700 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-serif tracking-wide text-yellow-100 flex items-center gap-2">
                <span>🖼️ THAY BANNER TRÒ CHƠI</span>
                <span className="text-[10px] bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Khoa Bảng Kỳ Thú
                </span>
              </h3>
              <p className="text-xs text-amber-100/90 font-medium">
                Tách biệt Ảnh nền nghệ thuật & Lớp chữ HTML rõ nét phía trên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin">
          {errorMsg && (
            <div className="p-3 bg-red-50 border-2 border-red-300 text-red-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Xem Trước Trực Tiếp (Live Preview)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">
                {bannerUrl ? "✨ Đang xem ảnh tùy chỉnh" : "🏛️ Ảnh nền mặc định hệ thống"}
              </span>
            </div>

            <div
              id="preview-game-banner-box"
              className="relative w-full rounded-2xl sm:rounded-3xl border-3 border-amber-400 shadow-xl overflow-hidden min-h-[220px] sm:min-h-[260px] md:min-h-[280px] bg-[#451a03] flex items-center"
            >
              <div
                className="absolute inset-0 transition-all duration-200"
                style={{
                  backgroundImage: `url(${effectiveBanner})`,
                  backgroundPosition,
                  backgroundSize: fit === 'cover' ? `${zoom}%` : 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#4a1506'
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={{
                  background: 'linear-gradient(to right, rgba(75, 20, 8, 0.85) 0%, rgba(75, 20, 8, 0.65) 45%, rgba(60, 20, 10, 0.3) 70%, rgba(10, 70, 60, 0.12) 100%)'
                }}
              />
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDE68A_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-300 pointer-events-none" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-300 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-300 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-300 pointer-events-none" />

              <div className="relative z-10 w-full p-4 sm:p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="max-w-xl space-y-2 text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black shadow-xs uppercase">
                      <Gamepad2 className="w-3 h-3 fill-amber-950" />
                      <span>ĐẤU TRƯỜNG THI ĐUA</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-900/80 border border-teal-300/50 text-teal-100 text-[10px] sm:text-xs font-bold backdrop-blur-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>3 TRÒ CHƠI DÂN GIAN</span>
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-100 to-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
                    KHOA BẢNG KỲ THÚ
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-200 font-bold italic drop-shadow-sm">
                    “Sĩ tử nào sẽ được gọi tên hôm nay?”
                  </p>
                  <p className="text-[11px] sm:text-xs text-yellow-100/90 font-medium line-clamp-2 max-w-md drop-shadow-sm">
                    Vòng quay khoa bảng, Thánh Chỉ và Thẻ Sĩ Tử đang chờ để tạo nên những khoảnh khắc bất ngờ và hào hứng cho lớp học!
                  </p>
                  <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-xs shadow-md border border-yellow-100 flex items-center gap-1.5 pointer-events-none">
                      <span>▶ BẮT ĐẦU TRÒ CHƠI</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-red-900/80 border border-amber-400/40 text-amber-100 text-xs font-bold pointer-events-none">
                      <span>📜 THÁNH CHỈ</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-teal-900/80 border border-teal-300/40 text-teal-100 text-xs font-bold pointer-events-none">
                      <span>🎴 RÚT THẺ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Box */}
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 space-y-3">
              <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-700" />
                <span>📷 TẢI LÊN HÌNH ẢNH MỚI</span>
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-amber-500 bg-amber-100/80 scale-[1.01]"
                    : "border-amber-300 bg-white/80 hover:bg-white hover:border-amber-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => e.target.files && e.target.files.length > 0 && processFile(e.target.files[0])}
                />
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-amber-950">
                  {isOptimizing ? "⏳ Đang tối ưu hình ảnh..." : "Bấm để chọn ảnh hoặc kéo thả vào đây"}
                </div>
                <p className="text-[10px] text-slate-500">
                  Hỗ trợ: JPG, JPEG, PNG, WebP (Khuyên dùng: 1400 x 420 px, ảnh phong cảnh / trường thi không chữ)
                </p>
              </div>
            </div>

            {/* Adjustments */}
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 space-y-3.5">
              {/* Position */}
              <div>
                <label className="text-xs font-extrabold text-amber-950 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-700" />
                    <span>🎯 VỊ TRÍ ẢNH (CANH LỀ)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{position}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPosition('left')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      position === 'left'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    TRÁI (Left)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('center')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      position === 'center'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    GIỮA (Center)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('right')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      position === 'right'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    PHẢI (Right)
                  </button>
                </div>
              </div>

              {/* Zoom */}
              <div>
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-950 mb-1">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-700" />
                    <span>🔍 ĐỘ PHÓNG ẢNH (ZOOM)</span>
                  </span>
                  <span className="text-amber-800 font-mono font-black">{zoom}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="140"
                  step="2"
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-0.5">
                  <span>80% (Thu nhỏ)</span>
                  <span>100% (Chuẩn)</span>
                  <span>140% (Phóng to)</span>
                </div>
              </div>

              {/* Fit */}
              <div>
                <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5 mb-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>📐 CHẾ ĐỘ HIỂN THỊ</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFit('cover')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      fit === 'cover'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    PHỦ ĐẦY BANNER (Cover)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFit('contain')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      fit === 'contain'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    HIỂN THỊ TRỌN ẢNH (Contain)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRestore}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>🔄 Khôi Phục Mặc Định</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>💾 LƯU BANNER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
