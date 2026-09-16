import React, { useState, useEffect, useMemo } from 'react';
import { getRankByPoints } from '../utils/ranks';

interface ChibiAvatarProps {
  points?: number;
  rankTier?: string;
  gender?: 'male' | 'female';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showHatBadge?: boolean;
  showAura?: boolean;
  animated?: boolean;
  customPhotoUrl?: string;
  useCustomPhoto?: boolean;
}

export const ChibiAvatar: React.FC<ChibiAvatarProps> = ({
  points,
  rankTier,
  gender = 'male',
  size = 'md',
  className = '',
  showHatBadge = false,
  showAura = false,
  animated = false,
  customPhotoUrl,
  useCustomPhoto = true,
}) => {
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setImgError(false);
  }, [customPhotoUrl]);

  const tier = useMemo(() => {
    if (rankTier) {
      if (rankTier === 'Đồng Sinh') return 'Sĩ Tử';
      if (rankTier === 'Thám Hoa' || rankTier === 'Bảng Nhãn') return 'Phó Bảng';
      return rankTier;
    }
    if (points !== undefined) {
      const r = getRankByPoints(points);
      if (r.tier === 'Đồng Sinh') return 'Sĩ Tử';
      if (r.tier === 'Thám Hoa' || r.tier === 'Bảng Nhãn') return 'Phó Bảng';
      return r.tier;
    }
    return 'Sĩ Tử';
  }, [rankTier, points]);

  const sizeClasses: Record<string, string> = {
    xs: 'w-8 h-8',
    sm: 'w-11 h-11',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    '2xl': 'w-40 h-40'
  };

  const isFemale = gender === 'female';

  // If custom photo is provided and valid
  if (customPhotoUrl && customPhotoUrl.trim() && useCustomPhoto && !imgError) {
    return (
      <div 
        className={`relative shrink-0 select-none flex items-center justify-center ${sizeClasses[size] || sizeClasses.md} ${className}`}
        title={`${tier} (${isFemale ? 'Nữ' : 'Nam'})`}
      >
        {showAura && (tier === 'Trạng Nguyên' || tier === 'Phó Bảng') && (
          <div className="absolute inset-0 -m-2 bg-gradient-to-r from-amber-400/40 via-red-400/30 to-yellow-300/40 rounded-full blur-md animate-pulse" />
        )}
        <div className={`w-full h-full rounded-full overflow-hidden border-2 shadow-sm relative bg-amber-50 ${
          tier === 'Trạng Nguyên' ? 'border-amber-400 ring-2 ring-yellow-400' :
          tier === 'Phó Bảng' ? 'border-purple-400 ring-1 ring-purple-300' :
          tier === 'Tiến Sĩ' ? 'border-red-400' :
          tier === 'Cử Nhân' ? 'border-emerald-400' :
          tier === 'Tú Tài' ? 'border-blue-400' : 'border-amber-200'
        } ${animated ? 'hover:scale-105 transition-transform' : ''}`}>
          <img
            src={customPhotoUrl}
            alt="Student Avatar"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>
        {(showHatBadge || tier === 'Trạng Nguyên') && (
          <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm border border-white">
            {tier === 'Trạng Nguyên' ? '👑' : tier === 'Phó Bảng' ? '📜' : '🌱'}
          </div>
        )}
      </div>
    );
  }

  // Authentic Chibi SVG Generator
  return (
    <div
      className={`relative shrink-0 select-none flex items-center justify-center ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={`${tier} (${isFemale ? 'Nữ' : 'Nam'})`}
    >
      {showAura && (tier === 'Trạng Nguyên' || tier === 'Phó Bảng') && (
        <div className="absolute inset-0 -m-2 bg-gradient-to-r from-amber-400/40 via-red-400/30 to-yellow-300/40 rounded-full blur-md animate-pulse" />
      )}

      <svg
        viewBox="0 0 160 170"
        className={`w-full h-full drop-shadow-sm transition-transform duration-300 ${animated ? 'hover:scale-110 active:scale-95' : ''}`}
      >
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF2E8" />
            <stop offset="100%" stopColor="#FED7AA" />
          </linearGradient>
          <radialGradient id="blushGrad">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="robeSiTu" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="robeTuTai" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="robeCuNhan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="robeTienSi" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id="robePhoBang" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="robeTrangNguyen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="40%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
          <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="hatBlack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
        </defs>

        {/* Chibi Body & Robe */}
        <g id="chibi-body">
          {tier === 'Sĩ Tử' && (
            <g id="outfit-si-tu">
              <path d="M45,95 L115,95 L128,155 Q80,165 32,155 Z" fill="url(#robeSiTu)" stroke="#78350F" strokeWidth="2.5" />
              <path d="M60,95 L80,120 L100,95" stroke="#FDE68A" strokeWidth="3" fill="none" strokeLinecap="round" />
              <rect x="44" y="122" width="72" height="7" rx="2" fill="#78350F" />
              <g transform="translate(118, 118) rotate(25)">
                <rect x="-2" y="-12" width="4" height="26" rx="1.5" fill="#B45309" stroke="#78350F" strokeWidth="1" />
                <path d="M-3,14 Q0,24 3,14 Z" fill="#1F2937" />
              </g>
            </g>
          )}

          {tier === 'Tú Tài' && (
            <g id="outfit-tu-tai">
              <path d="M44,95 L116,95 L130,155 Q80,165 30,155 Z" fill="url(#robeTuTai)" stroke="#0369A1" strokeWidth="2.5" />
              <path d="M58,95 L80,122 L102,95" stroke="#E0F2FE" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M62,95 L80,118 L98,95" stroke="#0284C7" strokeWidth="2" fill="none" />
              <rect x="42" y="122" width="76" height="8" rx="2" fill="#0369A1" />
              <circle cx="80" cy="126" r="4.5" fill="#A7F3D0" stroke="#047857" strokeWidth="1.5" />
              <g transform="translate(114, 116) rotate(15)">
                <rect x="-8" y="-10" width="16" height="22" rx="2" fill="#0284C7" stroke="#BAE6FD" strokeWidth="1.5" />
                <line x1="-5" y1="-4" x2="5" y2="-4" stroke="#FFF" strokeWidth="1.5" />
                <line x1="-5" y1="1" x2="5" y2="1" stroke="#FFF" strokeWidth="1.5" />
                <line x1="-5" y1="6" x2="3" y2="6" stroke="#FFF" strokeWidth="1.5" />
              </g>
            </g>
          )}

          {tier === 'Cử Nhân' && (
            <g id="outfit-cu-nhan">
              <path d="M44,95 L116,95 L130,155 Q80,165 30,155 Z" fill="url(#robeCuNhan)" stroke="#064E3B" strokeWidth="2.5" />
              <path d="M58,95 L80,122 L102,95" stroke="url(#goldTrim)" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M64,95 L80,118 L96,95" stroke="#064E3B" strokeWidth="2" fill="none" />
              <rect x="42" y="122" width="76" height="8" rx="2" fill="#064E3B" />
              <rect x="74" y="121" width="12" height="10" rx="2" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
              <g transform="translate(115, 115) rotate(15)">
                <rect x="-6" y="-12" width="14" height="26" rx="2" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5" />
                <line x1="-2" y1="-8" x2="-2" y2="10" stroke="#B45309" strokeWidth="1" />
                <line x1="2" y1="-8" x2="2" y2="10" stroke="#B45309" strokeWidth="1" />
              </g>
            </g>
          )}

          {tier === 'Tiến Sĩ' && (
            <g id="outfit-tien-si">
              <path d="M43,95 L117,95 L132,156 Q80,166 28,156 Z" fill="url(#robeTienSi)" stroke="#7F1D1D" strokeWidth="2.5" />
              <path d="M56,95 L80,124 L104,95" stroke="url(#goldTrim)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M72,112 Q80,106 88,112 Q84,118 76,116 Z" fill="url(#goldTrim)" />
              <rect x="40" y="122" width="80" height="9" rx="2" fill="#7F1D1D" stroke="url(#goldTrim)" strokeWidth="1.5" />
              <circle cx="80" cy="126.5" r="5" fill="#FDE047" stroke="#B45309" strokeWidth="1.5" />
              <g transform="translate(116, 114) rotate(12)">
                <rect x="-7" y="-12" width="16" height="24" rx="3" fill="#DC2626" stroke="#FDE047" strokeWidth="2" />
                <circle cx="1" cy="0" r="4" fill="#FDE047" />
              </g>
            </g>
          )}

          {tier === 'Phó Bảng' && (
            <g id="outfit-pho-bang">
              <path d="M42,95 L118,95 L134,156 Q80,167 26,156 Z" fill="url(#robePhoBang)" stroke="#3B0764" strokeWidth="2.5" />
              <path d="M54,95 L80,125 L106,95" stroke="url(#goldTrim)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
              <path d="M60,95 L80,118 L100,95" stroke="#3B0764" strokeWidth="2" fill="none" />
              <rect x="68" y="104" width="24" height="15" rx="3" fill="#FDE047" stroke="#78350F" strokeWidth="1" />
              <circle cx="80" cy="111.5" r="3.5" fill="#DC2626" />
              <rect x="38" y="122" width="84" height="9" rx="2" fill="#3B0764" stroke="url(#goldTrim)" strokeWidth="1.5" />
              <path d="M78,131 L78,148 L82,148 L82,131 Z" fill="#FDE047" />
              <g transform="translate(118, 112) rotate(10)">
                <rect x="-4" y="-14" width="8" height="28" rx="3" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
              </g>
            </g>
          )}

          {tier === 'Trạng Nguyên' && (
            <g id="outfit-trang-nguyen">
              <path d="M42,95 L118,95 L134,156 Q80,167 26,156 Z" fill="url(#robeTrangNguyen)" stroke="#7F1D1D" strokeWidth="2.5" />
              <path d="M52,95 L80,126 L108,95" stroke="url(#goldTrim)" strokeWidth="6" fill="none" strokeLinecap="round" />
              <circle cx="80" cy="111" r="10" fill="url(#goldTrim)" stroke="#991B1B" strokeWidth="1" />
              <polygon points="80,104 82,108 86,109 83,112 84,116 80,113 76,116 77,112 74,109 78,108" fill="#DC2626" />
              <path d="M36,152 Q58,145 80,152 Q102,145 124,152" stroke="url(#goldTrim)" strokeWidth="3" fill="none" />
              <rect x="36" y="122" width="88" height="9" rx="2" fill="#7F1D1D" stroke="url(#goldTrim)" strokeWidth="2" />
              <rect x="74" y="120" width="12" height="13" rx="2" fill="#FDE047" stroke="#78350F" strokeWidth="1" />
            </g>
          )}
          {/* Hands & Shoes */}
          <ellipse cx="65" cy="158" rx="8" ry="4" fill="#1F2937" />
          <ellipse cx="95" cy="158" rx="8" ry="4" fill="#1F2937" />
        </g>

        {/* Chibi Head & Face */}
        <g id="chibi-head">
          <circle cx="36" cy="58" r="7" fill="#FED7AA" stroke="#FDBA74" strokeWidth="1" />
          <circle cx="124" cy="58" r="7" fill="#FED7AA" stroke="#FDBA74" strokeWidth="1" />
          <circle cx="80" cy="56" r="44" fill="url(#skinGrad)" stroke="#FDBA74" strokeWidth="2" />
          <ellipse cx="52" cy="67" rx="9" ry="5.5" fill="url(#blushGrad)" />
          <ellipse cx="108" cy="67" rx="9" ry="5.5" fill="url(#blushGrad)" />
          {/* Left Eye */}
          <g id="left-eye">
            <ellipse cx="58" cy="56" rx="8" ry="10" fill="#1E293B" />
            <circle cx="55" cy="52" r="3.5" fill="#FFFFFF" />
            <circle cx="61" cy="60" r="1.8" fill="#FFFFFF" />
            <path d="M49,49 Q58,45 67,50" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
          {/* Right Eye */}
          <g id="right-eye">
            <ellipse cx="102" cy="56" rx="8" ry="10" fill="#1E293B" />
            <circle cx="99" cy="52" r="3.5" fill="#FFFFFF" />
            <circle cx="105" cy="60" r="1.8" fill="#FFFFFF" />
            <path d="M93,50 Q102,45 111,49" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
          {/* Eyebrows & Smile */}
          <path d="M51,43 Q58,39 65,43" stroke="#78350F" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M95,43 Q102,39 109,43" stroke="#78350F" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="80" cy="62" r="1.5" fill="#FB923C" />
          <path d="M72,69 Q80,78 88,69" stroke="#BE123C" strokeWidth="2.5" fill="#FB7185" strokeLinecap="round" />
          <path d="M76,73 Q80,76 84,73" fill="#FDA4AF" />
        </g>

        {/* Hair and Traditional Scholar Hats */}
        <g id="chibi-hair-and-hat">
          {isFemale ? (
            <g id="girl-hair">
              <path d="M38,46 Q45,22 80,22 Q115,22 122,46 Q108,34 95,38 Q80,32 65,38 Q52,34 38,46 Z" fill="#1E293B" />
              <circle cx="34" cy="30" r="11" fill="#1E293B" />
              <circle cx="126" cy="30" r="11" fill="#1E293B" />
              <circle cx="34" cy="30" r="4" fill="#F472B6" />
              <circle cx="126" cy="30" r="4" fill="#F472B6" />
            </g>
          ) : (
            <g id="boy-hair">
              <path d="M40,42 Q48,22 80,22 Q112,22 120,42 Q105,34 95,38 Q80,30 65,38 Q55,34 40,42 Z" fill="#1E293B" />
            </g>
          )}

          {tier === 'Sĩ Tử' && (
            <g id="hat-si-tu">
              {!isFemale && (
                <>
                  <ellipse cx="80" cy="18" rx="10" ry="8" fill="#1E293B" />
                  <rect x="73" y="20" width="14" height="4" rx="1" fill="#D97706" />
                </>
              )}
            </g>
          )}

          {tier === 'Tú Tài' && (
            <g id="hat-tu-tai">
              <path d="M42,28 Q80,18 118,28 Q118,20 80,12 Q42,20 42,28 Z" fill="url(#robeTuTai)" stroke="#0369A1" strokeWidth="1.5" />
              <path d="M48,25 Q80,17 112,25" stroke="#BAE6FD" strokeWidth="1.5" fill="none" />
            </g>
          )}

          {tier === 'Cử Nhân' && (
            <g id="hat-cu-nhan">
              <path d="M40,28 Q80,16 120,28 Q120,18 80,10 Q40,18 40,28 Z" fill="url(#robeCuNhan)" stroke="#064E3B" strokeWidth="1.5" />
              <path d="M46,24 Q80,15 114,24" stroke="#FDE047" strokeWidth="1.5" fill="none" />
            </g>
          )}

          {tier === 'Tiến Sĩ' && (
            <g id="hat-tien-si">
              <path d="M38,28 Q80,14 122,28 Q122,16 80,8 Q38,16 38,28 Z" fill="url(#robeTienSi)" stroke="#7F1D1D" strokeWidth="1.5" />
              <path d="M44,24 Q80,13 116,24" stroke="url(#goldTrim)" strokeWidth="2" fill="none" />
              <circle cx="80" cy="18" r="3.5" fill="#FDE047" stroke="#78350F" strokeWidth="1" />
            </g>
          )}

          {tier === 'Phó Bảng' && (
            <g id="hat-pho-bang">
              <path d="M42,20 Q16,16 10,24 Q24,28 44,24 Z" fill="url(#hatBlack)" stroke="url(#goldTrim)" strokeWidth="1" />
              <path d="M118,20 Q144,16 150,24 Q136,28 116,24 Z" fill="url(#hatBlack)" stroke="url(#goldTrim)" strokeWidth="1" />
              <path d="M44,26 Q80,10 116,26 L110,6 Q80,0 50,6 Z" fill="url(#hatBlack)" stroke="#374151" strokeWidth="1.5" />
              <rect x="52" y="16" width="56" height="5" rx="1.5" fill="url(#goldTrim)" />
              <circle cx="80" cy="12" r="4" fill="#7C3AED" stroke="#FDE047" strokeWidth="1.5" />
            </g>
          )}

          {tier === 'Trạng Nguyên' && (
            <g id="hat-trang-nguyen">
              {/* Left Wing (Cánh chuồn trái) */}
              <path d="M45,22 C15,10 0,22 4,32 C18,36 38,28 48,25 Z" fill="url(#hatBlack)" stroke="url(#goldTrim)" strokeWidth="1.5" />
              <path d="M12,22 Q28,26 44,23" stroke="url(#goldTrim)" strokeWidth="1" fill="none" />
              {/* Right Wing (Cánh chuồn phải) */}
              <path d="M115,22 C145,10 160,22 156,32 C142,36 122,28 112,25 Z" fill="url(#hatBlack)" stroke="url(#goldTrim)" strokeWidth="1.5" />
              <path d="M148,22 Q132,26 116,23" stroke="url(#goldTrim)" strokeWidth="1" fill="none" />
              {/* Main Hat Body */}
              <path d="M46,26 Q80,8 114,26 L108,4 Q80,-2 52,4 Z" fill="url(#hatBlack)" stroke="#1F2937" strokeWidth="1.5" />
              <path d="M48,24 Q80,14 112,24" stroke="url(#goldTrim)" strokeWidth="2.5" fill="none" />
              <circle cx="80" cy="11" r="5.5" fill="url(#goldTrim)" stroke="#991B1B" strokeWidth="1.5" />
              <polygon points="80,7 81.5,10 85,10.5 82.5,13 83.5,16 80,14 76.5,16 77.5,13 75,10.5 78.5,10" fill="#DC2626" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
