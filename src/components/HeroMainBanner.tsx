import React, { useState, useEffect } from 'react';
import { Maximize2, X, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

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
      alert("Vui lòng chọn ảnh nhỏ hơn 5MB để lưu trữ mượt mà!");
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
        className="w-full relative group rounded-2xl sm:rounded-3xl border-2 sm:border-3 md:border-4 border-amber-400/90 shadow-md sm:shadow-xl bg-gradient-to-b from-amber-50/50 via-white to-amber-100/40 p-1 sm:p-1.5 transition-all duration-300 hover:shadow-2xl overflow-hidden"
      >
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer bg-amber-950/5 flex items-center justify-center select-none"
          title="Nhấn để xem ảnh Banner toàn màn hình"
        >
          <img
            src={getAssetUrl(currentBanner)}
            alt="Hero Banner Hành Trình Trạng Nguyên"
            className="w-full h-auto max-h-[480px] md:max-h-[560px] object-contain block transition-transform duration-300 group-hover:scale-[1.005]"
            loading="eager"
            onError={(e) => {
              // Fallback if custom image fails
              (e.target as HTMLImageElement).src = getAssetUrl(DEFAULT_BANNER);
            }}
          />

          {/* Phóng to hint badge */}
          <div className="absolute top-2.5 left-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-amber-200 p-1.5 sm:p-2 rounded-xl backdrop-blur-xs flex items-center gap-1.5 text-xs font-bold pointer-events-none shadow-md">
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phóng to</span>
          </div>

          {/* Edit banner button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-900/80 hover:bg-amber-950 text-amber-200 hover:text-white p-1.5 sm:p-2 rounded-xl backdrop-blur-xs flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer border border-amber-400/50"
            title="Đổi ảnh bìa lớp học"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đổi ảnh bìa</span>
          </button>

          {/* Four golden decorative corners */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
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
