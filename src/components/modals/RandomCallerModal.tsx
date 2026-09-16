import React, { useState, useEffect } from 'react';
import { Dice5, Sparkles, X, RotateCw, Award, Plus } from 'lucide-react';
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

export const RandomCallerModal: React.FC<RandomCallerModalProps> = ({
  isOpen,
  onClose,
  students,
  groups,
  onAddScore
}) => {
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [chosenStudent, setChosenStudent] = useState<Student | null>(null);
  const [displayName, setDisplayName] = useState<string>('Sẵn sàng gọi môn sinh');
  const [calledIds, setCalledIds] = useState<string[]>(() => storage.getCalledIds());

  useEffect(() => {
    if (isOpen) {
      // Auto trigger roll on open or keep ready
      setDisplayName('Bấm nút để bốc thăm gọi môn sinh');
      setChosenStudent(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoll = () => {
    if (isCalling || students.length === 0) return;
    setIsCalling(true);
    setChosenStudent(null);

    const available = students.filter(s => !calledIds.includes(s.id));
    const pool = available.length > 0 ? available : students;

    let count = 0;
    const interval = setInterval(() => {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setDisplayName(rand.name);
      soundEngine.playWheelTick();
      count++;

      if (count > 22) {
        clearInterval(interval);
        const finalPick = pool[Math.floor(Math.random() * pool.length)];
        setChosenStudent(finalPick);
        setDisplayName(finalPick.name);
        setIsCalling(false);
        soundEngine.playRoyalFanfare();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

        const updatedCalled = [...new Set([...calledIds, finalPick.id])];
        setCalledIds(updatedCalled);
        storage.saveCalledIds(updatedCalled);
      }
    }, 75);
  };

  const handleQuickAward = (points: number) => {
    if (!chosenStudent) return;
    onAddScore(chosenStudent, points, `Gọi môn sinh - Trả lời xuất sắc (+${points}đ)`);
    soundEngine.playPointGain();
    confetti({ particleCount: 60, spread: 50 });
  };

  return (
    <div
      id="random-caller-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn select-none"
    >
      <div
        id="random-caller-modal-container"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-center relative overflow-hidden font-sans"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
          <Dice5 className="w-3.5 h-3.5 text-amber-700" />
          <span>Chiếu Chỉ Chọn Môn Sinh (Phím F2)</span>
        </div>

        <h3 className="text-2xl font-black text-slate-800 font-serif mb-4">
          Bốc Thăm Môn Sinh Lên Bảng
        </h3>

        {/* Display Area */}
        <div className="border-4 border-dashed border-amber-300 bg-amber-50/60 rounded-3xl p-6 mb-5 min-h-[160px] flex flex-col items-center justify-center relative">
          {chosenStudent ? (
            <div className="animate-bounce">
              <ChibiAvatar points={chosenStudent.points} gender={chosenStudent.gender} size="xl" showAura={true} />
              <div className="text-2xl sm:text-3xl font-black text-red-900 font-serif mt-2">
                {chosenStudent.name}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {groups.find(g => g.id === chosenStudent.groupId)?.name} • {chosenStudent.role}
              </div>
            </div>
          ) : (
            <div className="text-xl sm:text-2xl font-black text-amber-950 font-serif">
              {displayName}
            </div>
          )}
        </div>

        {/* Reward buttons if student is chosen */}
        {chosenStudent && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 mb-4 flex items-center justify-around text-xs font-bold text-emerald-900">
            <span>Thưởng nhanh:</span>
            <button
              onClick={() => handleQuickAward(1)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              +1 Điểm
            </button>
            <button
              onClick={() => handleQuickAward(2)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              +2 Điểm
            </button>
            <button
              onClick={() => handleQuickAward(5)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              +5 Điểm
            </button>
          </div>
        )}

        {/* Roll Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            id="btn-random-caller-spin-single"
            type="button"
            onClick={handleRoll}
            disabled={isCalling}
            className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-black text-sm rounded-xl shadow-lg border border-red-500 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCalling ? 'Đang bốc thăm...' : 'Quay Bốc Thăm (F2)'}</span>
          </button>

          <button
            id="btn-random-caller-draw-groups"
            type="button"
            onClick={() => {
              if (groups.length === 0 || students.length === 0) return;
              const randGroup = groups[Math.floor(Math.random() * groups.length)];
              const groupStudents = students.filter(s => s.groupId === randGroup.id);
              const pool = groupStudents.length > 0 ? groupStudents : students;
              const pick = pool[Math.floor(Math.random() * pool.length)];
              setChosenStudent(pick);
              setDisplayName(pick.name);
              soundEngine.playRoyalFanfare();
              confetti({ particleCount: 80, spread: 60 });
            }}
            className="px-4 py-3.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl cursor-pointer"
            title="Bốc thăm ngẫu nhiên đại diện 1 tổ"
          >
            Theo Tổ
          </button>

          <button
            onClick={() => {
              setCalledIds([]);
              storage.saveCalledIds([]);
              setChosenStudent(null);
              setDisplayName('Đã làm mới lượt gọi');
            }}
            className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            title="Đặt lại danh sách đã gọi"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
