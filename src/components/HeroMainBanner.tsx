import React, { useState, useEffect } from 'react';
import { Maximize2, X, Image as ImageIcon, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { notify } from './ui/dialog';

interface HeroMainBannerProps {
  customBannerUrl?: string;
  onBannerChange?: (newUrl: string) => void;
}

const DEFAULT_BANNER = "/banner-trang-nguyen.png";

export const HeroMainBanner: React.FC<HeroMainBannerProps> = ({
  customBannerUrl,
  onBannerChange
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem('tndv_banner_collapsed') === 'true');
  const toggleCollapsed = () => {
    setCollapsed(c => {
      localStorage.setItem('tndv_banner_collapsed', String(!c));
      return !c;
    });
  };
  const [currentBanner, setCurrentBanner] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("offlineBannerData");
      return customBannerUrl?.trim() || saved?.trim() || DEFAULT_BANNER;
    } catch {
      return customBannerUrl?.trim() || DEFAULT_BANNER;
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem("offlineBannerData");
      if (customBannerUrl && customBannerUrl.trim()) {
        setCurrentBanner(customBannerUrl.trim());
      } else if (saved && saved.trim()) {
        setCurrentBanner(saved.trim());
      }
    } catch {}
  }, [customBannerUrl]);

  // Handle ESC key for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit ~5MB
    if (file.size > 5 * 1024 * 1024) {
      notify("Vui lòng chọn ảnh nhỏ hơn 5MB để lưu trữ mượt mà!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCurrentBanner(base64);
        try {
          localStorage.setItem("offlineBannerData", base64);
        } catch (err) {
          console.warn("Storage quota exceeded, banner kept in memory", err);
        }
        onBannerChange?.(base64);
        setIsEditModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUrl = () => {
    if (!inputUrl.trim()) return;
    setCurrentBanner(inputUrl.trim());
    try {
      localStorage.setItem("offlineBannerData", inputUrl.trim());
    } catch {}
    onBannerChange?.(inputUrl.trim());
    setIsEditModalOpen(false);
    setInputUrl('');
  };

  const handleResetBanner = () => {
    setCurrentBanner(DEFAULT_BANNER);
    try {
      localStorage.removeItem("offlineBannerData");
    } catch {}
    onBannerChange?.(DEFAULT_BANNER);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div
        id="hero-main-banner"
        className="w-full relative group rounded-3xl border border-gold-300 shadow-card bg-white p-1.5 transition-all duration-300 hover:shadow-card-hover overflow-hidden"
      >
        <div
          onClick={() => (collapsed ? toggleCollapsed() : setIsLightboxOpen(true))}
          className="relative w-full rounded-[1.1rem] overflow-hidden cursor-pointer bg-paper-warm flex items-center justify-center select-none"
          title={collapsed ? 'Nhấn để mở rộng ảnh bìa' : 'Nhấn để xem ảnh bìa toàn màn hình'}
        >
          <img
            src={getAssetUrl(currentBanner)}
            alt="Ảnh bìa lớp học"
            className={`w-full block transition-all duration-500 ${
              collapsed
                ? 'h-24 sm:h-28 object-cover object-center'
                : 'h-auto max-h-[480px] md:max-h-[560px] object-contain group-hover:scale-[1.005]'
            }`}
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getAssetUrl(DEFAULT_BANNER);
            }}
          />

          {collapsed && <div className="absolute inset-0 bg-gradient-to-r from-primary-950/30 via-transparent to-primary-950/30 pointer-events-none" />}

          {/* Phóng to hint badge */}
          {!collapsed && (
            <div className="absolute top-2.5 left-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/55 text-gold-100 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm flex items-center gap-1.5 text-xs font-bold pointer-events-none">
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phóng to</span>
            </div>
          )}

          {/* Controls */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
              className="bg-black/55 hover:bg-black/75 text-gold-100 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl backdrop-blur-sm flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Đổi ảnh bìa lớp học"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đổi ảnh</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapsed();
              }}
              className="bg-black/55 hover:bg-black/75 text-gold-100 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl backdrop-blur-sm flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title={collapsed ? 'Mở rộng ảnh bìa' : 'Thu gọn ảnh bìa'}
            >
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{collapsed ? 'Mở rộng' : 'Thu gọn'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          id="modal-banner-lightbox"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-lg"
            title="Đóng xem toàn màn hình (ESC)"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getAssetUrl(currentBanner)}
              alt="Banner Fullscreen"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl border-2 border-amber-400/80"
            />
            <div className="mt-3 flex items-center gap-3 text-amber-200 text-xs sm:text-sm font-semibold">
              <span>🖼️ Banner Trang Chủ Trạng Nguyên</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="underline hover:text-white cursor-pointer"
              >
                Nhấn ESC hoặc click ra ngoài để đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-800 font-serif mb-1">
              Đổi Ảnh Bìa Lớp Học
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Thầy/Cô có thể tải ảnh của lớp lên từ máy tính hoặc dán liên kết ảnh trực tiếp.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cách 1: Tải ảnh từ máy tính (.png, .jpg)
                </label>
                <label className="w-full py-3 px-4 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl bg-amber-50/50 hover:bg-amber-100/50 flex items-center justify-center gap-2 text-xs font-bold text-amber-900 cursor-pointer transition-all">
                  <ImageIcon className="w-4 h-4 text-amber-700" />
                  <span>Chọn tệp ảnh từ máy tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cách 2: Nhập đường dẫn URL ảnh
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="flex-1 px-3 py-2 text-xs border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleResetBanner}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục banner gốc</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
