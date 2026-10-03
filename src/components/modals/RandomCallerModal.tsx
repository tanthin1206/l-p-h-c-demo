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

  // Danh sách học sinh đủ điều kiện (tính lại theo bộ lọc / danh sách đã gọi)
  const freshPool = useMemo(() => {
    const byGroup = groupFilter === 'all' ? students : students.filter(s => s.groupId === groupFilter);
    if (!skipCalled) return byGroup;
    const remaining = byGroup.filter(s => !calledIds.includes(s.id));
    return remaining.length > 0 ? remaining : byGroup;
  }, [students, groupFilter, skipCalled, calledIds]);

  // Danh sách đang HIỂN THỊ trên vòng quay. Được "đóng băng" khi đang quay và sau khi có kết quả,
  // để việc loại em vừa trúng khỏi danh sách không làm các ô dịch chuyển dưới kim chỉ.
  const [pool, setPool] = useState<Student[]>(freshPool);
  useEffect(() => {
    if (!isSpinning && !chosenStudent) setPool(freshPool);
  }, [freshPool, isSpinning, chosenStudent]);

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
    if (isSpinning || freshPool.length === 0) return;
    // Lượt mới: nạp danh sách mới nhất lên vòng rồi mới quay
    const spinPool = freshPool;
    setPool(spinPool);
    setIsSpinning(true);
    setChosenStudent(null);
    setAwarded(null);
    soundEngine.playFestiveDrum();

    const n = spinPool.length;
    const seg = 360 / n;
    const winnerIndex = Math.floor(Math.random() * n);
    const winner = spinPool[winnerIndex];

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
  }, [isSpinning, freshPool, calledIds]);

  // Đổi bộ lọc (tổ / bỏ qua em đã gọi) thì xoá kết quả cũ để vòng quay cập nhật danh sách mới
  useEffect(() => {
    setChosenStudent(null);
    setAwarded(null);
  }, [groupFilter, skipCalled]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-primary-950/60 backdrop-blur-[2px] animate-fade-in select-none"
    >
      <div
        id="random-caller-modal-container"
        className="bg-white rounded-3xl max-w-4xl w-full shadow-pop border border-paper-line relative font-sans max-h-[96vh] flex flex-col overflow-hidden animate-pop-in"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-paper-line bg-gradient-to-b from-paper-warm to-white">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-gold-200 flex items-center justify-center shrink-0">
            <RotateCw className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-black text-ink font-serif leading-tight">
              Vòng Quay May Mắn
            </h3>
            <div className="text-xs text-ink-muted mt-0.5 flex items-center gap-1.5">
              <span>Gọi Môn Sinh</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-paper-line text-[10px] font-bold text-ink-soft">F2</kbd>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg text-ink-muted hover:bg-paper-warm hover:text-ink cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted flex items-center gap-1 mr-1">
            <Users className="w-3.5 h-3.5" /> Quay trong:
          </span>
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => setGroupFilter('all')}
            className={`chip disabled:opacity-60 disabled:cursor-not-allowed ${groupFilter === 'all' ? 'chip-active' : ''}`}
          >
            Cả lớp ({students.length})
          </button>
          {groups.map(g => (
            <button
              key={g.id}
              type="button"
              disabled={isSpinning}
              onClick={() => setGroupFilter(g.id)}
              className={`chip disabled:opacity-60 disabled:cursor-not-allowed ${groupFilter === g.id ? 'chip-active' : ''}`}
            >
              {g.icon} {g.name.split(':')[0]}
            </button>
          ))}
          <label className="flex items-center gap-1.5 text-xs font-bold text-ink-soft ml-1 sm:ml-2 px-2.5 py-1.5 rounded-full bg-paper-warm border border-paper-line cursor-pointer">
            <input
              type="checkbox"
              checked={skipCalled}
              disabled={isSpinning}
              onChange={e => setSkipCalled(e.target.checked)}
              className="accent-primary-700 w-3.5 h-3.5"
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
                <path d="M22 54 L4 14 A20 20 0 1 1 40 14 Z" fill="#8A1F19" stroke="#FCD34D" strokeWidth="3" />
                <circle cx="22" cy="18" r="7" fill="#FCD34D" />
              </svg>
            </div>

            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 p-2.5 shadow-card-hover ring-1 ring-gold-700/30">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                {pool.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-sm text-ink-muted font-bold p-8 text-center">
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
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary-600 to-primary-900 border-4 border-gold-300 shadow-pop text-gold-100 font-black text-sm sm:text-base flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:cursor-not-allowed"
              title="Quay (Space)"
            >
              {isSpinning ? '...' : 'QUAY'}
            </button>
          </div>

          {/* Result panel */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-3">
            <div className="border-2 border-dashed border-gold-300 bg-paper-warm rounded-3xl p-4 min-h-[210px] flex flex-col items-center justify-center text-center">
              {chosenStudent ? (
                <div className="animate-pop-in flex flex-col items-center">
                  <div className="text-[11px] font-black uppercase tracking-widest text-gold-800 mb-1">
                    🎉 Môn sinh được chọn 🎉
                  </div>
                  <ChibiAvatar
                    points={chosenStudent.points}
                    gender={chosenStudent.gender}
                    size="xl"
                    showAura={true}
                    customPhotoUrl={chosenStudent.customPhotoUrl}
                  />
                  <div className="text-2xl sm:text-3xl font-black text-primary-900 font-serif mt-2 leading-tight">
                    {chosenStudent.name}
                  </div>
                  <div className="text-xs text-ink-muted font-medium mt-0.5">
                    {groups.find(g => g.id === chosenStudent.groupId)?.name} • {chosenStudent.role}
                  </div>
                </div>
              ) : (
                <div className="text-ink-soft">
                  <div className="w-14 h-14 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="text-lg font-black font-serif text-ink">
                    {isSpinning ? 'Vòng quay đang chạy...' : 'Bấm QUAY để chọn môn sinh'}
                  </div>
                  <div className="text-xs mt-1 text-ink-muted">
                    Hoặc nhấn phím <kbd className="px-1.5 py-0.5 bg-white border border-paper-line rounded-md font-bold text-ink-soft">Space</kbd>
                  </div>
                </div>
              )}
            </div>

            {chosenStudent && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-center gap-2 flex-wrap text-xs font-bold text-emerald-900 animate-fade-in">
                {awarded ? (
                  <span>✅ Đã cộng +{awarded} điểm cho {chosenStudent.name}</span>
                ) : (
                  <>
                    <span>Thưởng nhanh:</span>
                    {[1, 2, 5].map(p => (
                      <button
                        key={p}
                        onClick={() => handleQuickAward(p)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm cursor-pointer transition active:scale-95"
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
                className="flex-1 py-3 bg-primary-800 hover:bg-primary-900 text-gold-100 font-black text-sm rounded-xl shadow-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 text-gold-300 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Đang quay...' : chosenStudent ? 'Quay tiếp' : 'Quay ngay'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSpinning}
                className="px-4 py-3 bg-white border border-paper-line hover:border-gold-400 text-ink-soft hover:text-ink font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Đặt lại danh sách đã gọi"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Làm mới lượt
              </button>
            </div>

            <div className="text-[11px] text-ink-muted text-center">
              Trên vòng quay: <b className="text-ink">{pool.length}</b> em • Đã gọi: <b className="text-ink">{calledInFilter}</b>
              {skipCalled && ' (các em đã gọi sẽ không xuất hiện lại cho đến khi làm mới)'}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
