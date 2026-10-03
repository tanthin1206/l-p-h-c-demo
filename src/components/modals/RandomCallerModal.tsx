import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Sparkles, X, RotateCw, Users, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, Group } from '../../types';
import { ChibiAvatar } from '../ChibiAvatar';
import { soundEngine } from '../../utils/soundEngine';
import { storage } from '../../utils/storage';

interface RandomCallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  groups: Group[];
  onAddScore: (student: Student, points: number, note: string) => void;
}

// Bảng màu lễ hội cho các ô vòng quay
const SEGMENT_COLORS = [
  '#B91C1C', // đỏ son
  '#F59E0B', // vàng hổ phách
  '#047857', // xanh ngọc
  '#EA580C', // cam
  '#7C2D12', // nâu đỏ
  '#CA8A04', // vàng đồng
  '#BE185D', // hồng sen
  '#1D4ED8', // xanh lam
];

const WHEEL_SIZE = 420;
const RADIUS = WHEEL_SIZE / 2;
const SPIN_DURATION = 5200; // ms

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const polar = (angleDeg: number, r: number) => {
  // 0° = đỉnh trên, tăng theo chiều kim đồng hồ
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: RADIUS + r * Math.cos(rad), y: RADIUS + r * Math.sin(rad) };
};

export const RandomCallerModal: React.FC<RandomCallerModalProps> = ({
  isOpen,
  onClose,
  students,
  groups,
  onAddScore
}) => {
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [skipCalled, setSkipCalled] = useState<boolean>(true);
  const [calledIds, setCalledIds] = useState<string[]>(() => storage.getCalledIds());
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [chosenStudent, setChosenStudent] = useState<Student | null>(null);
  const [awarded, setAwarded] = useState<number | null>(null);

  const rafRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);

  // Danh sách học sinh trên vòng quay
  const pool = useMemo(() => {
    const byGroup = groupFilter === 'all' ? students : students.filter(s => s.groupId === groupFilter);
    if (!skipCalled) return byGroup;
    const remaining = byGroup.filter(s => !calledIds.includes(s.id));
    return remaining.length > 0 ? remaining : byGroup;
  }, [students, groupFilter, skipCalled, calledIds]);

  const segAngle = pool.length > 0 ? 360 / pool.length : 360;

  useEffect(() => {
    if (isOpen) {
      setChosenStudent(null);
      setAwarded(null);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen]);

  const handleSpin = useCallback(() => {
    if (isSpinning || pool.length === 0) return;
    setIsSpinning(true);
    setChosenStudent(null);
    setAwarded(null);
    soundEngine.playFestiveDrum();

    const n = pool.length;
    const seg = 360 / n;
    const winnerIndex = Math.floor(Math.random() * n);
    const winner = pool[winnerIndex];

    // Góc để tâm ô thắng nằm đúng dưới kim chỉ (đỉnh trên)
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const targetMod = (360 - (winnerIndex * seg + seg / 2) + jitter + 360) % 360;
    const start = rotationRef.current;
    const startMod = ((start % 360) + 360) % 360;
    const extraSpins = 6 + Math.floor(Math.random() * 3);
    const delta = extraSpins * 360 + ((targetMod - startMod + 360) % 360);
    const end = start + delta;

    const t0 = performance.now();
    let lastSeg = Math.floor(start / seg);

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / SPIN_DURATION);
      const current = start + delta * easeOutCubic(t);
      rotationRef.current = current;
      setRotation(current);

      const curSeg = Math.floor(current / seg);
      if (curSeg !== lastSeg) {
        lastSeg = curSeg;
        soundEngine.playWheelTick();
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rotationRef.current = end;
        setIsSpinning(false);
        setChosenStudent(winner);
        soundEngine.playRoyalFanfare();
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 } });
        const updated = Array.from(new Set([...calledIds, winner.id]));
        setCalledIds(updated);
        storage.saveCalledIds(updated);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [isSpinning, pool, calledIds]);

  // Phím Space / Enter để quay khi modal mở
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleSpin]);

  if (!isOpen) return null;

  const handleQuickAward = (points: number) => {
    if (!chosenStudent) return;
    onAddScore(chosenStudent, points, `Vòng quay gọi môn sinh - Trả lời tốt (+${points}đ)`);
    setAwarded(points);
    confetti({ particleCount: 60, spread: 50 });
  };

  const handleReset = () => {
    setCalledIds([]);
    storage.saveCalledIds([]);
    setChosenStudent(null);
    setAwarded(null);
  };

  const fontSize = pool.length > 32 ? 10 : pool.length > 24 ? 12 : pool.length > 14 ? 14 : 17;
  const maxChars = pool.length > 24 ? 14 : 18;
  const shortName = (name: string) => {
    // Ưu tiên hiển thị tên (2 chữ cuối) cho gọn
    const parts = name.trim().split(/\s+/);
    const short = parts.length > 2 ? parts.slice(-2).join(' ') : name;
    return short.length > maxChars ? short.slice(0, maxChars - 1) + '…' : short;
  };

  const calledInFilter = (groupFilter === 'all' ? students : students.filter(s => s.groupId === groupFilter))
    .filter(s => calledIds.includes(s.id)).length;

  return (
    <div
      id="random-caller-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn select-none"
    >
      <div
        id="random-caller-modal-container"
        className="bg-gradient-to-b from-[#FFF8E7] to-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border-4 border-amber-400 relative font-sans max-h-[96vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer z-10"
          title="Đóng (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1">
            <RotateCw className="w-3.5 h-3.5 text-amber-700" />
            <span>Gọi Môn Sinh (Phím F2)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-red-900 font-serif">
            Vòng Quay May Mắn
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
          <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mr-1">
            <Users className="w-3.5 h-3.5 text-amber-700" /> Quay trong:
          </span>
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => setGroupFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-60 ${
              groupFilter === 'all' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-amber-200 text-slate-700 hover:bg-amber-50'
            }`}
          >
            Cả lớp ({students.length})
          </button>
          {groups.map(g => (
            <button
              key={g.id}
              type="button"
              disabled={isSpinning}
              onClick={() => setGroupFilter(g.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-60 ${
                groupFilter === g.id ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-amber-200 text-slate-700 hover:bg-amber-50'
              }`}
            >
              {g.icon} {g.name.split(':')[0]}
            </button>
          ))}
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 ml-2 cursor-pointer">
            <input
              type="checkbox"
              checked={skipCalled}
              disabled={isSpinning}
              onChange={e => setSkipCalled(e.target.checked)}
              className="accent-amber-600 w-3.5 h-3.5"
            />
            Bỏ qua em đã gọi
          </label>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-5">
          {/* Wheel */}
          <div className="relative shrink-0 w-[min(82vw,420px)] aspect-square">
            {/* Pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-20 drop-shadow-lg">
              <svg width="44" height="54" viewBox="0 0 44 54">
                <path d="M22 54 L4 14 A20 20 0 1 1 40 14 Z" fill="#B91C1C" stroke="#FDE68A" strokeWidth="3" />
                <circle cx="22" cy="18" r="7" fill="#FDE68A" />
              </svg>
            </div>

            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-700 p-2.5 shadow-[0_10px_40px_rgba(180,83,9,0.45)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                {pool.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-500 font-bold p-8 text-center">
                    Chưa có học sinh nào trong nhóm này
                  </div>
                ) : (
                  <svg
                    viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                    className="w-full h-full"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {pool.map((s, i) => {
                      const startA = i * segAngle;
                      const endA = startA + segAngle;
                      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
                      // tránh 2 ô cạnh nhau cùng màu khi vòng khép lại
                      const fill = pool.length > 1 && i === pool.length - 1 && i % SEGMENT_COLORS.length === 0
                        ? SEGMENT_COLORS[3]
                        : color;
                      const p1 = polar(startA, RADIUS);
                      const p2 = polar(endA, RADIUS);
                      const largeArc = segAngle > 180 ? 1 : 0;
                      const d = pool.length === 1
                        ? `M ${RADIUS} 0 A ${RADIUS} ${RADIUS} 0 1 1 ${RADIUS - 0.01} 0 Z`
                        : `M ${RADIUS} ${RADIUS} L ${p1.x} ${p1.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
                      const mid = startA + segAngle / 2;
                      const isLight = fill === '#F59E0B' || fill === '#CA8A04';
                      return (
                        <g key={s.id}>
                          <path d={d} fill={fill} stroke="#FEF3C7" strokeWidth={1.5} />
                          <text
                            x={RADIUS}
                            y={RADIUS}
                            transform={`rotate(${mid - 90} ${RADIUS} ${RADIUS}) translate(${RADIUS - 16} 0)`}
                            textAnchor="end"
                            dominantBaseline="middle"
                            fontSize={fontSize}
                            fontWeight={800}
                            fill={isLight ? '#451A03' : '#FFFBEB'}
                            style={{ fontFamily: 'inherit' }}
                          >
                            {shortName(s.name)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* Center button */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning || pool.length === 0}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-4 border-yellow-300 shadow-xl text-yellow-100 font-black text-sm sm:text-base flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:cursor-not-allowed"
              title="Quay (Space)"
            >
              {isSpinning ? '...' : 'QUAY'}
            </button>
          </div>

          {/* Result panel */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-3">
            <div className="border-4 border-dashed border-amber-300 bg-amber-50/70 rounded-3xl p-4 min-h-[210px] flex flex-col items-center justify-center text-center">
              {chosenStudent ? (
                <div className="animate-fadeIn flex flex-col items-center">
                  <div className="text-[11px] font-black uppercase tracking-widest text-amber-700 mb-1">
                    🎉 Môn sinh được chọn 🎉
                  </div>
                  <ChibiAvatar
                    points={chosenStudent.points}
                    gender={chosenStudent.gender}
                    size="xl"
                    showAura={true}
                    customPhotoUrl={chosenStudent.customPhotoUrl}
                  />
                  <div className="text-2xl sm:text-3xl font-black text-red-900 font-serif mt-2 leading-tight">
                    {chosenStudent.name}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {groups.find(g => g.id === chosenStudent.groupId)?.name} • {chosenStudent.role}
                  </div>
                </div>
              ) : (
                <div className="text-amber-950/80">
                  <Sparkles className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                  <div className="text-lg font-black font-serif">
                    {isSpinning ? 'Vòng quay đang chạy...' : 'Bấm QUAY để chọn môn sinh'}
                  </div>
                  <div className="text-xs mt-1 text-slate-500">
                    Hoặc nhấn phím <kbd className="px-1.5 py-0.5 bg-white border rounded">Space</kbd>
                  </div>
                </div>
              )}
            </div>

            {chosenStudent && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-center gap-2 flex-wrap text-xs font-bold text-emerald-900">
                {awarded ? (
                  <span>✅ Đã cộng +{awarded} điểm cho {chosenStudent.name}</span>
                ) : (
                  <>
                    <span>Thưởng nhanh:</span>
                    {[1, 2, 5].map(p => (
                      <button
                        key={p}
                        onClick={() => handleQuickAward(p)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                      >
                        +{p} điểm
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                id="btn-random-caller-spin-single"
                type="button"
                onClick={handleSpin}
                disabled={isSpinning || pool.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Đang quay...' : chosenStudent ? 'Quay tiếp' : 'Quay ngay'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSpinning}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                title="Đặt lại danh sách đã gọi"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Làm mới lượt
              </button>
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              Trên vòng quay: <b>{pool.length}</b> em • Đã gọi: <b>{calledInFilter}</b>
              {skipCalled && ' (các em đã gọi sẽ không xuất hiện lại cho đến khi làm mới)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
