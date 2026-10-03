import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  RotateCw, 
  UserCheck, 
  HelpCircle, 
  Sparkles, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, ClassConfig, PointLog } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { storage } from '../../utils/storage';
import { AI_SERVICE } from '../../utils/gemini';
import { GameBannerEditorModal, GameBannerConfig } from '../modals/GameBannerEditorModal';
import { getAssetUrl } from '../../utils/assets';
import { PageHeader, Button } from '../ui';

interface GamesViewProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  config: ClassConfig;
  pointLogs: PointLog[];
  setPointLogs: React.Dispatch<React.SetStateAction<PointLog[]>>;
}

type GameKey = 'wheel' | 'picker' | 'riddles';

const GAME_TABS: {
  key: GameKey;
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}[] = [
  { key: 'wheel', id: 'btn-tab-wheel-hero', icon: RotateCw, title: 'Vòng Quay Khoa Bảng', desc: 'Quay thưởng hoa điểm, quà may mắn' },
  { key: 'picker', id: 'btn-tab-decree-hero', icon: UserCheck, title: 'Chiếu Chỉ Gọi Tên', desc: 'Bốc thăm gọi môn sinh lên bảng' },
  { key: 'riddles', id: 'btn-tab-cards-hero', icon: HelpCircle, title: 'Đố Vui Trí Tuệ (AI)', desc: 'Câu đố dân gian do AI gợi ý' },
];

export const GamesView: React.FC<GamesViewProps> = ({
  students,
  setStudents,
  config,
  pointLogs,
  setPointLogs
}) => {
  const [activeGame, setActiveGame] = useState<GameKey>('wheel');
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

  // Màu ô vòng quay (canvas cần mã màu cụ thể)
  const wheelSlices = [
    { text: "+1 Điểm", color: "#F59E0B", points: 1 },
    { text: "Tràng Pháo Tay", color: "#A82820", points: 0 },
    { text: "+2 Điểm", color: "#059669", points: 2 },
    { text: "Quà Nhỏ", color: "#2563EB", points: 0 },
    { text: "+5 Điểm", color: "#7C3AED", points: 5 },
    { text: "Thêm Lượt", color: "#DB2777", points: 0 },
    { text: "+3 Điểm", color: "#D97706", points: 3 },
    { text: "Đố Vui", color: "#0D9488", points: 0 },
  ];

  // Token màu cho tâm vòng quay: primary-900 / gold-300 / gold-100
  const WHEEL_CENTER_FILL = '#5B0E0E';
  const WHEEL_CENTER_STROKE = '#FCD34D';
  const WHEEL_CENTER_TEXT = '#FEF3C7';

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
    ctx.fillStyle = WHEEL_CENTER_FILL;
    ctx.fill();
    ctx.strokeStyle = WHEEL_CENTER_STROKE;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = WHEEL_CENTER_TEXT;
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
      ctx.fillStyle = WHEEL_CENTER_FILL;
      ctx.fill();
      ctx.strokeStyle = WHEEL_CENTER_STROKE;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = WHEEL_CENTER_TEXT;
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

  // Giữ tham chiếu props không dùng trực tiếp (tương thích interface)
  void pointLogs;
  void setPointLogs;

  const sectionBadge = 'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-800 bg-gold-100 px-3 py-1 rounded-full';

  return (
    <div id="game-zone-section" className="space-y-4 sm:space-y-5 select-none">
      <PageHeader
        icon={Gamepad2}
        title="Trò chơi lớp học"
        subtitle="Vòng quay khoa bảng, Chiếu Chỉ gọi tên và Đố vui trí tuệ cho giờ học thêm hào hứng"
      />

      {/* HERO GAME BANNER */}
      <div
        id="hero-game-banner-top"
        className="relative group rounded-3xl overflow-hidden shadow-card border border-gold-300/70 bg-primary-950 text-white p-5 sm:p-7 md:p-8"
      >
        {/* Layer 1: Background image */}
        <div
          id="banner-layer-1-bg"
          className="absolute inset-0 transition-transform duration-500 ease-out bg-primary-950"
          style={{
            backgroundImage: `url('${getAssetUrl(bannerConfig.bannerUrl || '/banner-tro-choi.png')}')`,
            backgroundPosition: bannerConfig.position === 'left' ? 'left center' : bannerConfig.position === 'right' ? 'right center' : 'center center',
            backgroundSize: bannerConfig.fit === 'cover' ? `${bannerConfig.zoom}%` : 'contain',
            backgroundRepeat: "no-repeat"
          }}
        />

        {/* Button to edit banner */}
        <button
          id="btn-edit-game-banner-top"
          type="button"
          onClick={() => setIsBannerEditorOpen(true)}
          className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-white/90 hover:bg-white text-primary-900 border border-gold-300 shadow-sm active:scale-95"
          title="Đổi ảnh nền / Tùy chỉnh Banner Trò chơi"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Thay Banner</span>
        </button>

        {/* Layer 2: Gradient Overlay */}
        <div
          id="banner-layer-2-overlay"
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-primary-950/90 via-primary-900/70 to-primary-900/10"
        />

        {/* Banner content */}
        <div className="relative z-10 max-w-2xl space-y-3 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400 text-primary-950 text-[11px] font-black uppercase tracking-wider shadow-sm">
              <Gamepad2 className="w-3.5 h-3.5" />
              Đấu trường thi đua
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-gold-100 text-[11px] font-bold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-300" />
              3 trò chơi dân gian
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-wide text-gold-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] leading-tight">
            KHOA BẢNG KỲ THÚ
          </h2>

          <p className="text-sm sm:text-base text-gold-100 font-semibold italic drop-shadow-sm">
            “Sĩ tử nào sẽ được gọi tên hôm nay?”
          </p>

          <p className="hidden sm:block text-xs sm:text-sm text-gold-50/85 max-w-xl leading-relaxed drop-shadow-sm">
            Vòng quay khoa bảng, Chiếu Chỉ và Thẻ Sĩ Tử đang chờ để tạo nên những khoảnh khắc bất ngờ và hào hứng cho lớp học!
          </p>

          {/* Quick Action Hero Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5">
            <button
              id="btn-start-games-hero"
              type="button"
              onClick={() => setActiveGame('wheel')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 hover:from-gold-400 hover:to-gold-600 text-primary-950 font-black text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <RotateCw className="w-4 h-4" />
              <span className="tracking-wide">BẮT ĐẦU TRÒ CHƠI</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                id="btn-decree-hero"
                type="button"
                onClick={() => setActiveGame('picker')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-gold-50 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm active:scale-95"
                title="Mở Thánh Chỉ Triều Đình"
              >
                <span>📜 THÁNH CHỈ</span>
              </button>
              <button
                id="btn-cards-hero"
                type="button"
                onClick={() => setActiveGame('riddles')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-gold-50 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm active:scale-95"
                title="Rút Thẻ Sĩ Tử"
              >
                <span>🎴 RÚT THẺ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game selector */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {GAME_TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeGame === tab.key;
          return (
            <button
              key={tab.key}
              id={tab.id}
              type="button"
              onClick={() => setActiveGame(tab.key)}
              aria-pressed={active}
              className={`card p-2.5 sm:p-3.5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left transition cursor-pointer min-w-0 ${
                active
                  ? 'ring-2 ring-primary-700 border-primary-700 bg-primary-50/40'
                  : 'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-gold-300'
              }`}
            >
              <span
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  active ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-200' : 'bg-gold-100 text-gold-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className={`block text-xs sm:text-sm font-black leading-tight ${active ? 'text-primary-900' : 'text-ink'}`}>
                  {tab.title}
                </span>
                <span className="hidden md:block text-[11px] text-ink-muted mt-0.5 truncate">{tab.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Warning banner when no students */}
      {students.length === 0 && (
        <div className="card p-4 sm:p-5 border-dashed border-gold-300 bg-gold-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={getAssetUrl("/assets/images/trang-ti.jpg")} 
              alt="Trạng Tí" 
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gold-300 shrink-0"
            />
            <div className="text-left">
              <h4 className="font-black text-ink text-sm">Chưa có môn sinh để quay thưởng & gọi tên</h4>
              <p className="text-xs text-ink-muted">Thầy/Cô có thể nạp nhanh 32 học sinh mẫu hoặc thêm học sinh để quay điểm và bốc thăm gọi bài!</p>
            </div>
          </div>
          <Button
            variant="gold"
            size="sm"
            icon={Sparkles}
            className="shrink-0 whitespace-nowrap"
            onClick={() => {
              const samples = storage.loadSampleStudents();
              setStudents(samples);
            }}
          >
            Nạp 32 học sinh mẫu
          </Button>
        </div>
      )}

      {/* GAME CONTENT 1: LUCKY WHEEL */}
      {activeGame === 'wheel' && (
        <div className="card p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row items-center justify-around gap-6 md:gap-8 animate-fade-in">
          {/* Wheel Canvas & Pointer */}
          <div className="relative flex flex-col items-center w-full max-w-[340px]">
            {/* Pointer arrow */}
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[30px] border-t-primary-700 drop-shadow-md z-10 -mb-4" />
            
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="w-full h-auto aspect-square rounded-full shadow-card-hover ring-4 ring-gold-400 ring-offset-2 ring-offset-white"
            />
          </div>

          {/* Wheel Controls & Results */}
          <div className="flex-1 w-full max-w-md text-center md:text-left space-y-4">
            <div>
              <span className={sectionBadge}>
                Vòng Quay May Mắn
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-serif text-primary-900 mt-2">
                Quay Thưởng Hoa Điểm Tốt
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                Quay thưởng ngẫu nhiên hoa điểm, tràng pháo tay hoặc phần quà may mắn cho học sinh tích cực.
              </p>
            </div>

            {/* Select student to reward */}
            <div className="bg-paper-warm p-3.5 rounded-2xl border border-paper-line text-left">
              <label className="block text-xs font-bold text-ink-soft mb-1.5">
                Cộng điểm cho học sinh đang quay (tùy chọn):
              </label>
              <select
                value={selectedStudentForReward}
                onChange={e => setSelectedStudentForReward(e.target.value)}
                className="input font-semibold"
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
              <div className="bg-gold-50 border border-gold-300 rounded-2xl p-4 text-center animate-pop-in">
                <div className="text-[11px] uppercase font-bold tracking-wider text-gold-800">Kết quả quay được</div>
                <div className="text-2xl font-black font-serif text-primary-800 mt-1">
                  🎉 {wheelResult} 🎉
                </div>
              </div>
            )}

            {/* Spin Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={spinWheel}
              disabled={isSpinning}
              className="w-full py-3.5 text-base sm:text-lg font-black"
            >
              <RotateCw className={`w-5 h-5 text-gold-300 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Đang quay tít mù...' : 'QUAY NGAY!'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* GAME CONTENT 2: RANDOM STUDENT PICKER */}
      {activeGame === 'picker' && (
        <div className="card p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto text-center space-y-5 animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img 
                src={getAssetUrl("/assets/images/trang-ti.jpg")} 
                alt="Trạng Tí Ban Chiếu" 
                className="w-20 h-20 rounded-full object-cover ring-4 ring-gold-300 shadow-card"
              />
              <span className="absolute -bottom-1 -right-1 text-base bg-white rounded-full p-0.5 shadow-sm border border-paper-line">
                📜
              </span>
            </div>
            <span className={sectionBadge}>
              Chiếu Chỉ Trạng Tí
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-primary-900 mt-2 font-serif">
              Bốc Thăm Gọi Tên Lên Bảng
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Hệ thống tự động ghi nhớ các em đã gọi (<b className="text-ink">{calledIds.length}/{students.length}</b> em) để không bị trùng lặp.
            </p>
          </div>

          {/* Random Name Showcase Box */}
          <div className="border-2 border-dashed border-gold-300 bg-paper-warm rounded-3xl p-6 sm:p-8 min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[11px] uppercase tracking-widest text-gold-800 font-bold mb-2">
              Sĩ tử được chọn
            </span>
            <div className="text-3xl sm:text-4xl font-black text-primary-900 font-brand tracking-wider break-words">
              {candidateName}
            </div>

            {selectedStudent && (
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap animate-pop-in">
                <span className="text-xs font-bold px-3 py-1 bg-gold-100 text-gold-800 rounded-full">
                  {selectedStudent.role}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newPts = selectedStudent.points + 2;
                    const updated = students.map(s => s.id === selectedStudent.id ? { ...s, points: newPts } : s);
                    setStudents(updated);
                    storage.saveStudents(updated);
                    soundEngine.playPointGain();
                    confetti({ particleCount: 50, spread: 40 });
                  }}
                  className="text-xs font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center gap-1 shadow-sm cursor-pointer transition active:scale-95"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Thưởng +2 Điểm vì trả lời tốt</span>
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePickRandomStudent}
              disabled={isCalling}
              className="font-black"
            >
              <Sparkles className="w-5 h-5 text-gold-300" />
              <span>{isCalling ? 'Đang chọn Trạng Tí...' : 'BỐC THĂM GỌI TÊN!'}</span>
            </Button>

            <Button variant="outline" size="lg" icon={RefreshCw} onClick={handleResetCalledIds}>
              Đặt lại lượt gọi
            </Button>
          </div>
        </div>
      )}

      {/* GAME CONTENT 3: RIDDLES */}
      {activeGame === 'riddles' && (
        <div className="card p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-5 animate-fade-in">
          <div className="flex flex-col items-center text-center">
            <img 
              src={getAssetUrl("/assets/images/trang-ti.jpg")} 
              alt="Trạng Tí Đố Bạn" 
              className="w-20 h-20 rounded-full object-cover ring-4 ring-gold-300 shadow-card mb-2"
            />
            <span className={sectionBadge}>
              Đố Vui Dân Gian & Trí Tuệ
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-primary-900 mt-2 font-serif">
              Trạng Tí Đố Bạn
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Câu đố dân gian vui nhộn, phát triển tư duy ngôn ngữ và logic cho học sinh
            </p>
          </div>

          {/* Topic & AI Generate */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 bg-paper-warm rounded-2xl border border-paper-line">
            <label className="flex items-center gap-2 text-xs font-bold text-ink-soft flex-1 min-w-0">
              <span className="shrink-0">Chủ đề:</span>
              <input
                type="text"
                value={riddleTopic}
                onChange={e => setRiddleTopic(e.target.value)}
                placeholder="e.g. toán học, tiếng việt, loài vật"
                className="input py-1.5 text-xs font-semibold"
              />
            </label>

            <Button
              variant="gold"
              size="sm"
              icon={Sparkles}
              onClick={handleFetchNewRiddle}
              disabled={isLoadingRiddle}
              className="shrink-0 py-2"
            >
              {isLoadingRiddle ? 'Trạng Tí đang nghĩ...' : 'Đổi Câu Đố Mới'}
            </Button>
          </div>

          {/* Riddle Card */}
          <div className="border border-gold-300 bg-gradient-to-br from-gold-50 to-paper rounded-3xl p-5 sm:p-8 shadow-inner-gold text-center">
            <div className="text-3xl mb-2">🐭 📜</div>
            <h4 className="text-lg sm:text-xl font-black font-serif text-ink mb-3 leading-relaxed">
              « {riddle.question} »
            </h4>

            {riddle.hint && (
              <p className="text-xs text-ink-muted italic mb-4">
                💡 Gợi ý: {riddle.hint}
              </p>
            )}

            {showAnswer ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 font-bold text-sm sm:text-base animate-pop-in">
                🎯 Đáp án: <span className="text-lg font-black text-emerald-700">{riddle.answer}</span>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setShowAnswer(true);
                  soundEngine.playPointGain();
                }}
              >
                Mở Đáp Án Bí Mật
              </Button>
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
