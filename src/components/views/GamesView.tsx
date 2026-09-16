import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  RotateCw, 
  UserCheck, 
  HelpCircle, 
  Sparkles, 
  Trophy, 
  Volume2, 
  Flame, 
  Clock, 
  RefreshCw,
  Gift,
  CheckCircle2,
  Award,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, ClassConfig, PointLog } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { storage } from '../../utils/storage';
import { AVATAR_OPTIONS } from '../../utils/ranks';
import { AI_SERVICE } from '../../utils/gemini';
import { GameBannerEditorModal, GameBannerConfig } from '../modals/GameBannerEditorModal';
import { getAssetUrl } from '../../utils/assets';

interface GamesViewProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  config: ClassConfig;
  pointLogs: PointLog[];
  setPointLogs: React.Dispatch<React.SetStateAction<PointLog[]>>;
}

export const GamesView: React.FC<GamesViewProps> = ({
  students,
  setStudents,
  config,
  pointLogs,
  setPointLogs
}) => {
  const [activeGame, setActiveGame] = useState<'wheel' | 'picker' | 'riddles'>('wheel');
  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState<boolean>(false);
  const [bannerConfig, setBannerConfig] = useState<GameBannerConfig>(() => {
    try {
      const savedImg = localStorage.getItem('offlineGameBanner');
      const savedSettings = localStorage.getItem('gameBannerSettings');
      const parsed = savedSettings ? JSON.parse(savedSettings) : {};
      return {
        bannerUrl: savedImg || undefined,
        position: parsed.position || 'center',
        zoom: parsed.zoom || 100,
        fit: parsed.fit || 'cover'
      };
    } catch {
      return {
        position: 'center',
        zoom: 100,
        fit: 'cover'
      };
    }
  });

  const handleSaveBanner = (newConfig: GameBannerConfig) => {
    setBannerConfig(newConfig);
    if (newConfig.bannerUrl) {
      localStorage.setItem('offlineGameBanner', newConfig.bannerUrl);
    } else {
      localStorage.removeItem('offlineGameBanner');
    }
    localStorage.setItem('gameBannerSettings', JSON.stringify({
      position: newConfig.position,
      zoom: newConfig.zoom,
      fit: newConfig.fit
    }));
  };

  const handleRestoreBanner = () => {
    setBannerConfig({
      bannerUrl: undefined,
      position: 'center',
      zoom: 100,
      fit: 'cover'
    });
    localStorage.removeItem('offlineGameBanner');
    localStorage.removeItem('gameBannerSettings');
  };

  // --- GAME 1: VÒNG QUAY KHOA BẢNG ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [selectedStudentForReward, setSelectedStudentForReward] = useState<string>(students[0]?.id || '');

  const wheelSlices = [
    { text: "+1 Điểm", color: "#f59e0b", points: 1 },
    { text: "Tràng Pháo Tay", color: "#ef4444", points: 0 },
    { text: "+2 Điểm", color: "#10b981", points: 2 },
    { text: "Quà Nhỏ", color: "#3b82f6", points: 0 },
    { text: "+5 Điểm", color: "#8b5cf6", points: 5 },
    { text: "Thêm Lượt", color: "#ec4899", points: 0 },
    { text: "+3 Điểm", color: "#f97316", points: 3 },
    { text: "Đố Vui", color: "#14b8a6", points: 0 },
  ];

  const currentRotation = useRef<number>(0);

  // Draw wheel on mount or game change
  useEffect(() => {
    if (activeGame !== 'wheel') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 10;
    const numSlices = wheelSlices.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    wheelSlices.forEach((slice, i) => {
      const angle = currentRotation.current + i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Be Vietnam Pro", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(slice.text, radius - 20, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#78350f';
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QUAY', centerX, centerY);
  }, [activeGame]);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelResult(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numSlices = wheelSlices.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Pick random target
    const winningIndex = Math.floor(Math.random() * numSlices);
    const targetSlice = wheelSlices[winningIndex];

    const spins = 5 + Math.random() * 3;
    const totalRotation = spins * 2 * Math.PI + (numSlices - winningIndex - 0.5) * sliceAngle;

    const start = performance.now();
    const duration = 4000;
    const initialRot = currentRotation.current;

    let lastTickAngle = initialRot;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentRotation.current = initialRot + totalRotation * easeOut;

      // Tick sound
      if (Math.abs(currentRotation.current - lastTickAngle) > sliceAngle / 2) {
        soundEngine.playWheelTick();
        lastTickAngle = currentRotation.current;
      }

      // Re-draw
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = centerX - 10;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      wheelSlices.forEach((slice, i) => {
        const angle = currentRotation.current + i * sliceAngle;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Be Vietnam Pro", sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(slice.text, radius - 20, 5);
        ctx.restore();
      });

      // Center
      ctx.beginPath();
      ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
      ctx.fillStyle = '#78350f';
      ctx.fill();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('QUAY', centerX, centerY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWheelResult(targetSlice.text);
        soundEngine.playRoyalFanfare();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        // Auto award if student selected & has points
        if (targetSlice.points > 0 && selectedStudentForReward) {
          const st = students.find(s => s.id === selectedStudentForReward);
          if (st) {
            const updated = students.map(s => s.id === st.id ? { ...s, points: s.points + targetSlice.points } : s);
            setStudents(updated);
            storage.saveStudents(updated);
          }
        }
      }
    };

    requestAnimationFrame(animate);
  };

  // --- GAME 2: GỌI TÊN NGẪU NHIÊN (CHIẾU CHỈ TRẠNG TÍ) ---
  const [calledIds, setCalledIds] = useState<string[]>(() => storage.getCalledIds());
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('Bấm để chọn Trạng Tí');

  const handlePickRandomStudent = () => {
    if (isCalling || students.length === 0) return;
    setIsCalling(true);
    setSelectedStudent(null);

    const available = students.filter(s => !calledIds.includes(s.id));
    const pool = available.length > 0 ? available : students;

    let count = 0;
    const interval = setInterval(() => {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setCandidateName(rand.name);
      soundEngine.playWheelTick();
      count++;
      if (count > 25) {
        clearInterval(interval);
        const finalPick = pool[Math.floor(Math.random() * pool.length)];
        setSelectedStudent(finalPick);
        setCandidateName(finalPick.name);
        setIsCalling(false);
        soundEngine.playRoyalFanfare();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });

        const nextCalled = [...new Set([...calledIds, finalPick.id])];
        setCalledIds(nextCalled);
        storage.saveCalledIds(nextCalled);
      }
    }, 80);
  };

  const handleResetCalledIds = () => {
    setCalledIds([]);
    storage.saveCalledIds([]);
    setSelectedStudent(null);
    setCandidateName('Bấm để chọn Trạng Tí');
  };

  // --- GAME 3: ĐỐ VUI TRẠNG TÍ ---
  const [riddle, setRiddle] = useState<{
    question: string;
    answer: string;
    hint: string;
  }>({
    question: "Đầu rồng đuôi phụng le te, mùa đông ấp trứng mùa hè nở con. Là cây gì?",
    answer: "Cây cau",
    hint: "Cây thân thẳng, quả thường dùng têm trầu với lá trầu không"
  });
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [riddleTopic, setRiddleTopic] = useState<string>('dân gian');
  const [isLoadingRiddle, setIsLoadingRiddle] = useState<boolean>(false);

  const handleFetchNewRiddle = async () => {
    setIsLoadingRiddle(true);
    setShowAnswer(false);
    const res = await AI_SERVICE.generateRiddle(riddleTopic, config.geminiApiKey);
    setRiddle(res);
    setIsLoadingRiddle(false);
    soundEngine.playPointGain();
  };

  return (
    <div id="game-zone-section" className="space-y-6 select-none">
      {/* 2K AUTHENTIC HERO GAME BANNER */}
      <div
        id="hero-game-banner-top"
        className="relative group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl border-3 md:border-4 border-amber-400 bg-[#451a03] text-white p-5 sm:p-7 md:p-8 transition-all duration-300"
        style={{
          boxShadow: "0 10px 30px -5px rgba(120, 53, 15, 0.3), 0 0 15px 1px rgba(245, 158, 11, 0.2)"
        }}
      >
        {/* Layer 1: Background image */}
        <div
          id="banner-layer-1-bg"
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{
            backgroundImage: `url('${getAssetUrl(bannerConfig.bannerUrl || '/banner-tro-choi.png')}')`,
            backgroundPosition: bannerConfig.position === 'left' ? 'left center' : bannerConfig.position === 'right' ? 'right center' : 'center center',
            backgroundSize: bannerConfig.fit === 'cover' ? `${bannerConfig.zoom}%` : 'contain',
            backgroundRepeat: "no-repeat",
            backgroundColor: "#4a1506"
          }}
        />

        {/* Button to edit banner */}
        <button
          id="btn-edit-game-banner-top"
          type="button"
          onClick={() => setIsBannerEditorOpen(true)}
          className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer bg-amber-400 hover:bg-yellow-300 active:scale-95 text-amber-950 border border-yellow-200 shadow-lg ring-2 ring-amber-300 hover:scale-105"
          title="Đổi ảnh nền / Tùy chỉnh Banner Trò chơi"
        >
          <ImageIcon className="w-4 h-4 text-amber-950" />
          <span>📷 Thay Banner</span>
        </button>

        {/* Layer 2: Gradient Overlay */}
        <div
          id="banner-layer-2-overlay"
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: "linear-gradient(to right, rgba(75, 20, 8, 0.88) 0%, rgba(75, 20, 8, 0.72) 45%, rgba(60, 20, 10, 0.4) 75%, rgba(10, 70, 60, 0.2) 100%)"
          }}
        />

        {/* Decorative elements & golden corners */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDE68A_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-300/90 rounded-tl-sm" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-300/90 rounded-tr-sm" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-300/90 rounded-bl-sm" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-300/90 rounded-br-sm" />
        </div>

        {/* Banner content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3.5 text-center lg:text-left max-w-2xl">
            <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black shadow-md uppercase tracking-wider">
                <Gamepad2 className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                <span>ĐẤU TRƯỜNG THI ĐUA</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-900/70 border border-teal-300/50 text-teal-100 text-xs font-bold backdrop-blur-xs shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>3 TRÒ CHƠI DÂN GIAN</span>
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-100 to-amber-300 drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)] leading-tight">
              KHOA BẢNG KỲ THÚ
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-amber-100 font-semibold italic tracking-normal drop-shadow-sm font-sans">
              “Sĩ tử nào sẽ được gọi tên hôm nay?”
            </p>

            <p className="text-xs sm:text-sm text-yellow-100/90 font-normal max-w-xl drop-shadow-sm leading-relaxed font-sans">
              Vòng quay khoa bảng, Chiếu Chỉ và Thẻ Sĩ Tử đang chờ để tạo nên những khoảnh khắc bất ngờ và hào hứng cho lớp học!
            </p>

            {/* Quick Action Hero Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 font-sans">
              <button
                id="btn-start-games-hero"
                type="button"
                onClick={() => setActiveGame('wheel')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-950 font-bold text-sm sm:text-base shadow-xl hover:shadow-amber-400/40 flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer active:scale-95 border-2 border-yellow-100 ring-4 ring-amber-400/30 group/btn"
              >
                <div className="w-6 h-6 rounded-full bg-amber-950 text-amber-300 flex items-center justify-center shadow-xs group-hover/btn:scale-110 transition-transform">
                  <RotateCw className="w-3.5 h-3.5 text-amber-300 ml-0.5" />
                </div>
                <span className="tracking-wide">BẮT ĐẦU TRÒ CHƠI</span>
                <Sparkles className="w-4 h-4 text-amber-900 group-hover/btn:rotate-12 transition-transform" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  id="btn-decree-hero"
                  type="button"
                  onClick={() => setActiveGame('picker')}
                  className="px-4 py-2.5 rounded-xl bg-red-900/70 hover:bg-red-900/90 border border-amber-400/40 text-amber-100 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs active:scale-95 shadow-md"
                  title="Mở Thánh Chỉ Triều Đình"
                >
                  <span>📜 THÁNH CHỈ</span>
                </button>
                <button
                  id="btn-cards-hero"
                  type="button"
                  onClick={() => setActiveGame('riddles')}
                  className="px-4 py-2.5 rounded-xl bg-teal-900/70 hover:bg-teal-900/90 border border-teal-300/40 text-teal-100 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs active:scale-95 shadow-md"
                  title="Rút Thẻ Sĩ Tử"
                >
                  <span>🎴 RÚT THẺ</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs switchers */}
            <div className="pt-2 flex flex-wrap gap-2.5 justify-center lg:justify-start">
              <button
                id="btn-tab-wheel-hero"
                onClick={() => setActiveGame('wheel')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  activeGame === 'wheel'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow-lg scale-105 border border-yellow-200 font-black'
                    : 'bg-black/40 hover:bg-black/60 text-amber-200 border border-amber-400/40'
                }`}
              >
                <RotateCw className="w-4 h-4" />
                <span>Vòng Quay Khoa Bảng</span>
              </button>

              <button
                id="btn-tab-decree-hero"
                onClick={() => setActiveGame('picker')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  activeGame === 'picker'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow-lg scale-105 border border-yellow-200 font-black'
                    : 'bg-black/40 hover:bg-black/60 text-amber-200 border border-amber-400/40'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Chiếu Chỉ Gọi Tên</span>
              </button>

              <button
                id="btn-tab-cards-hero"
                onClick={() => setActiveGame('riddles')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  activeGame === 'riddles'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow-lg scale-105 border border-yellow-200 font-black'
                    : 'bg-black/40 hover:bg-black/60 text-amber-200 border border-amber-400/40'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Đố Vui Trí Tuệ (AI)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning banner when no students */}
      {students.length === 0 && (
        <div className="bg-amber-50 rounded-3xl p-5 border-2 border-dashed border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <img 
              src={getAssetUrl("/assets/images/trang-ti.jpg")} 
              alt="Trạng Tí" 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
            />
            <div className="text-left">
              <h4 className="font-black text-slate-800 text-sm">Chưa có môn sinh để quay thưởng & gọi tên</h4>
              <p className="text-xs text-slate-600">Thầy/Cô có thể nạp nhanh 32 học sinh mẫu hoặc thêm học sinh để quay điểm và bốc thăm gọi bài!</p>
            </div>
          </div>
          <button
            onClick={() => {
              const samples = storage.loadSampleStudents();
              setStudents(samples);
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold text-xs rounded-xl shadow whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Nạp 32 học sinh mẫu</span>
          </button>
        </div>
      )}

      {/* GAME CONTENT 1: LUCKY WHEEL */}
      {activeGame === 'wheel' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-200 flex flex-col md:flex-row items-center justify-around gap-8">
          {/* Wheel Canvas & Pointer */}
          <div className="relative flex flex-col items-center">
            {/* Pointer arrow */}
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[30px] border-t-red-600 drop-shadow-md z-10 -mb-4" />
            
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="rounded-full shadow-2xl border-4 border-amber-400"
            />
          </div>

          {/* Wheel Controls & Results */}
          <div className="flex-1 max-w-md text-center md:text-left space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                Vòng Quay May Mắn
              </span>
              <h3 className="text-2xl font-black text-slate-800 mt-2">
                Quay Thưởng Hoa Điểm Tốt
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Quay thưởng ngẫu nhiên hoa điểm, tràng pháo tay hoặc phần quà may mắn cho học sinh tích cực.
              </p>
            </div>

            {/* Select student to reward */}
            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
              <label className="block text-xs font-bold text-amber-900 mb-1.5">
                Cộng điểm cho học sinh đang quay (tùy chọn):
              </label>
              <select
                value={selectedStudentForReward}
                onChange={e => setSelectedStudentForReward(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.points} đ) - {s.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Result Box */}
            {wheelResult && (
              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400 rounded-2xl p-4 text-center animate-bounce">
                <div className="text-xs uppercase font-bold text-amber-800">KẾT QUẢ QUAY ĐƯỢC:</div>
                <div className="text-2xl font-black text-red-700 mt-1">
                  🎉 {wheelResult} 🎉
                </div>
              </div>
            )}

            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl border-2 border-yellow-300 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Đang quay tít mù...' : 'QUAY NGAY!'}</span>
            </button>
          </div>
        </div>
      )}

      {/* GAME CONTENT 2: RANDOM STUDENT PICKER */}
      {activeGame === 'picker' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-200 max-w-2xl mx-auto text-center space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img 
                src={getAssetUrl("/assets/images/trang-ti.jpg")} 
                alt="Trạng Tí Ban Chiếu" 
                className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 text-base bg-white rounded-full p-0.5 shadow border border-amber-300">
                📜
              </span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Chiếu Chỉ Trạng Tí
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2 font-serif">
              Bốc Thăm Gọi Tên Lên Bảng
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-serif">
              Hệ thống tự động ghi nhớ các em đã gọi ({calledIds.length}/{students.length} em) để không bị trùng lặp.
            </p>
          </div>

          {/* Random Name Showcase Box */}
          <div className="border-4 border-dashed border-amber-400 bg-amber-50/50 rounded-3xl p-8 shadow-inner min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-xs font-serif uppercase tracking-widest text-amber-800 font-bold mb-2">
              SĨ TỬ ĐƯỢC CHỌN:
            </span>
            <div className="text-3xl sm:text-4xl font-black text-amber-950 font-brand tracking-wider">
              {candidateName}
            </div>

            {selectedStudent && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 bg-amber-200 text-amber-900 rounded-full">
                  {selectedStudent.role}
                </span>
                <button
                  onClick={() => {
                    const newPts = selectedStudent.points + 2;
                    const updated = students.map(s => s.id === selectedStudent.id ? { ...s, points: newPts } : s);
                    setStudents(updated);
                    storage.saveStudents(updated);
                    soundEngine.playPointGain();
                    confetti({ particleCount: 50, spread: 40 });
                  }}
                  className="text-xs font-bold px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center gap-1 shadow"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Thưởng +2 Điểm vì trả lời tốt</span>
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handlePickRandomStudent}
              disabled={isCalling}
              className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl border border-red-500 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>{isCalling ? 'Đang chọn Trạng Tí...' : 'BỐC THĂM GỌI TÊN!'}</span>
            </button>

            <button
              onClick={handleResetCalledIds}
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition-all"
            >
              Đặt lại lượt gọi
            </button>
          </div>
        </div>
      )}

      {/* GAME CONTENT 3: RIDDLES */}
      {activeGame === 'riddles' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-200 max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col items-center text-center">
            <img 
              src={getAssetUrl("/assets/images/trang-ti.jpg")} 
              alt="Trạng Tí Đố Bạn" 
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-md mb-2"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Đố Vui Dân Gian & Trí Tuệ
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2 font-serif">
              Trạng Tí Đố Bạn
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Câu đố dân gian vui nhộn, phát triển tư duy ngôn ngữ và logic cho học sinh
            </p>
          </div>

          {/* Topic & AI Generate */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span>Chủ đề:</span>
              <input
                type="text"
                value={riddleTopic}
                onChange={e => setRiddleTopic(e.target.value)}
                placeholder="e.g. toán học, tiếng việt, loài vật"
                className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handleFetchNewRiddle}
              disabled={isLoadingRiddle}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-60 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoadingRiddle ? 'Trạng Tí đang nghĩ...' : 'Đổi Câu Đố Mới'}</span>
            </button>
          </div>

          {/* Riddle Card */}
          <div className="border-4 border-amber-400 bg-gradient-to-br from-amber-50/70 to-yellow-50/80 rounded-3xl p-6 sm:p-8 shadow-inner text-center font-serif">
            <div className="text-3xl mb-2">🐭 📜</div>
            <h4 className="text-lg sm:text-xl font-black text-amber-950 mb-3 leading-relaxed">
              « {riddle.question} »
            </h4>

            {riddle.hint && (
              <p className="text-xs font-sans text-slate-500 italic mb-4">
                💡 Gợi ý: {riddle.hint}
              </p>
            )}

            {showAnswer ? (
              <div className="bg-emerald-100 border border-emerald-300 rounded-2xl p-4 text-emerald-950 font-sans font-bold text-sm sm:text-base animate-fadeIn">
                🎯 Đáp án: <span className="text-lg font-black text-emerald-800">{riddle.answer}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowAnswer(true);
                  soundEngine.playPointGain();
                }}
                className="px-6 py-2.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-sans font-bold text-xs sm:text-sm rounded-xl transition-all shadow"
              >
                Mở Đáp Án Bí Mật
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL GAME BANNER EDITOR */}
      <GameBannerEditorModal
        isOpen={isBannerEditorOpen}
        onClose={() => setIsBannerEditorOpen(false)}
        currentBannerUrl={bannerConfig.bannerUrl}
        currentPosition={bannerConfig.position}
        currentZoom={bannerConfig.zoom}
        currentFit={bannerConfig.fit}
        onSave={handleSaveBanner}
        onRestoreDefault={handleRestoreBanner}
      />
    </div>
  );
};
