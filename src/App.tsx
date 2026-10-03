import React, { useState, useEffect } from 'react';
import { 
  ActiveTab, 
  Student, 
  Group, 
  Criterion, 
  PointLog, 
  AttendanceDay, 
  ClassConfig 
} from './types';
import { storage } from './utils/storage';
import { soundEngine } from './utils/soundEngine';
import { getRankByPoints } from './utils/ranks';
import confetti from 'canvas-confetti';

import { SidebarNav, NAV_LABELS } from './components/SidebarNav';
import { Header } from './components/Header';
import { ToastFeedback, ToastData } from './components/ToastFeedback';
import { DialogHost } from './components/ui/dialog';

import { StudentsView } from './components/views/StudentsView';
import { AttendanceView } from './components/views/AttendanceView';
import { HonorView } from './components/views/HonorView';
import { GroupsView } from './components/views/GroupsView';
import { GamesView } from './components/views/GamesView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { ScoreModal } from './components/modals/ScoreModal';
import { StudentDetailModal } from './components/modals/StudentDetailModal';
import { AddEditStudentModal } from './components/modals/AddEditStudentModal';
import { BulkImportModal } from './components/modals/BulkImportModal';
import { CertificateModal } from './components/modals/CertificateModal';
import { CriteriaModal } from './components/modals/CriteriaModal';
import { WeeklySummaryModal } from './components/modals/WeeklySummaryModal';
import { RankUpModal } from './components/modals/RankUpModal';
import { RandomCallerModal } from './components/modals/RandomCallerModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const h = window.location.hash.replace('#', '') as ActiveTab;
    return (['students', 'attendance', 'honor', 'groups', 'games', 'reports', 'settings'] as ActiveTab[]).includes(h)
      ? h
      : 'students';
  });

  // Keep URL hash in sync so a page refresh stays on the same tab
  useEffect(() => {
    if (window.location.hash !== `#${activeTab}`) {
      history.replaceState(null, '', `#${activeTab}`);
    }
    window.scrollTo({ top: 0 });
  }, [activeTab]);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('tndv_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('tndv_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Core App States
  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const [groups, setGroups] = useState<Group[]>(() => storage.getGroups());
  const [criteria, setCriteria] = useState<Criterion[]>(() => storage.getCriteria());
  const [pointLogs, setPointLogs] = useState<PointLog[]>(() => storage.getPointLogs());
  const [attendance, setAttendance] = useState<AttendanceDay[]>(() => storage.getAttendance());
  const [config, setConfig] = useState<ClassConfig>(() => storage.getConfig());

  // Modal States
  const [scoreModal, setScoreModal] = useState<{
    isOpen: boolean;
    targetStudents: Student[];
    initialTab: 'positive' | 'reminder';
  }>({ isOpen: false, targetStudents: [], initialTab: 'positive' });

  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<{ isOpen: boolean; student: Student | null }>({
    isOpen: false,
    student: null
  });
  const [bulkImportOpen, setBulkImportOpen] = useState<boolean>(false);
  const [criteriaModalOpen, setCriteriaModalOpen] = useState<boolean>(false);
  const [weeklySummaryOpen, setWeeklySummaryOpen] = useState<boolean>(false);
  const [certStudent, setCertStudent] = useState<Student | null>(null);
  const [rankUpEvent, setRankUpEvent] = useState<{ student: Student; prevTier: string; newTier: string } | null>(null);
  const [randomCallerOpen, setRandomCallerOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Keyboard shortcut listener (F2: random caller, Esc: close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setRandomCallerOpen(prev => !prev);
        soundEngine.playFestiveDrum();
      } else if (e.key === 'Escape') {
        setScoreModal(prev => ({ ...prev, isOpen: false }));
        setDetailStudent(null);
        setStudentToEdit({ isOpen: false, student: null });
        setBulkImportOpen(false);
        setCriteriaModalOpen(false);
        setWeeklySummaryOpen(false);
        setCertStudent(null);
        setRankUpEvent(null);
        setRandomCallerOpen(false);
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync sound engine
  useEffect(() => {
    soundEngine.setEnabled(config.soundEnabled);
  }, [config.soundEnabled]);

  // Presentation (TV / projector) mode: fullscreen + larger UI + sidebar hidden
  useEffect(() => {
    document.documentElement.classList.toggle('presentation', isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const sidebarHidden = isSidebarCollapsed || isFullscreen;

  // Sound toggle handler
  const handleToggleSound = () => {
    const next = !config.soundEnabled;
    soundEngine.setEnabled(next);
    setConfig(prev => ({ ...prev, soundEnabled: next }));
    storage.saveConfig({ ...config, soundEnabled: next });
    if (next) soundEngine.playPointGain();
  };

  // Apply Score Logic (Supports single or multiple students)
  const handleApplyScore = (targetList: Student[], criterion: Criterion) => {
    const newLogs: PointLog[] = [];
    let rankUpOccurred: { student: Student; prevTier: string; newTier: string } | null = null;

    const updated = students.map(s => {
      if (targetList.some(t => t.id === s.id)) {
        const prevRank = getRankByPoints(s.points);
        const newPoints = Math.max(0, s.points + criterion.points);
        const newStars = Math.floor(newPoints / 10);
        const nextRank = getRankByPoints(newPoints);

        if (nextRank.level > prevRank.level) {
          rankUpOccurred = { student: { ...s, points: newPoints }, prevTier: prevRank.tier, newTier: nextRank.tier };
        }

        newLogs.push({
          id: `log-${Date.now()}-${s.id}`,
          studentId: s.id,
          criterionId: criterion.id,
          criterionName: criterion.name,
          points: criterion.points,
          timestamp: new Date().toISOString()
        });

        return { ...s, points: newPoints, stars: newStars };
      }
      return s;
    });

    setStudents(updated);
    storage.saveStudents(updated);

    const updatedLogs = [...newLogs, ...pointLogs];
    setPointLogs(updatedLogs);
    storage.savePointLogs(updatedLogs);

    // Audio & Visual Effects
    if (criterion.points > 0) {
      soundEngine.playPointGain();
      if (rankUpOccurred) {
        soundEngine.playRoyalFanfare();
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
        setRankUpEvent(rankUpOccurred);
        setToast({
          type: 'rankup',
          title: `VINH QUY BÁI TỔ: ${rankUpOccurred.student.name}`,
          subtitle: `Xuất sắc thăng cấp học vị ${rankUpOccurred.newTier}!`,
          badge: '👑'
        });
      } else {
        setToast({
          type: 'success',
          title: `+${criterion.points} Hoa Điểm Tốt`,
          subtitle: `${targetList.map(s => s.name).join(', ')}: ${criterion.name}`,
          badge: '🌸'
        });
      }
    } else {
      soundEngine.playPointDeduct();
      setToast({
        type: 'warning',
        title: `${criterion.points} Điểm nhắc nhở`,
        subtitle: `${targetList.map(s => s.name).join(', ')}: ${criterion.name}`,
        badge: '⚠️'
      });
    }

    setTimeout(() => setToast(null), 3500);
  };

  // Undo Point Log
  const handleUndoLog = (logId: string) => {
    const log = pointLogs.find(l => l.id === logId);
    if (!log) return;

    const updatedStudents = students.map(s => {
      if (s.id === log.studentId) {
        const newPoints = Math.max(0, s.points - log.points);
        return { ...s, points: newPoints, stars: Math.floor(newPoints / 10) };
      }
      return s;
    });
    setStudents(updatedStudents);
    storage.saveStudents(updatedStudents);

    const updatedLogs = pointLogs.filter(l => l.id !== logId);
    setPointLogs(updatedLogs);
    storage.savePointLogs(updatedLogs);

    soundEngine.playPointDeduct();
    if (detailStudent && detailStudent.id === log.studentId) {
      setDetailStudent(updatedStudents.find(s => s.id === log.studentId) || null);
    }
  };

  // Today absent count
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRec = attendance.find(a => a.date === todayStr);
  const todayAbsentCount = todayRec 
    ? todayRec.records.filter(r => r.status === 'excused' || r.status === 'unexcused').length 
    : 0;

  return (
    <div className="min-h-screen text-ink flex flex-col font-sans relative bg-paper">
      {/* Nền giấy dó với hoa văn mờ */}
      <div id="courtyard-heritage-background" className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-paper-warm via-paper to-paper" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%235B0E0E' stroke-width='1.2'%3E%3Cpath d='M28 4a24 24 0 0 1 0 48a24 24 0 0 1 0-48z'/%3E%3Cpath d='M28 16a12 12 0 0 1 0 24a12 12 0 0 1 0-24z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[420px] bg-gold-200/30 rounded-full blur-3xl" />
      </div>

      <DialogHost />

      {/* 1. SIDEBAR NAVIGATION (250px - FIXED) */}
      <SidebarNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        todayAbsentCount={todayAbsentCount}
        config={config}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        isCollapsed={sidebarHidden}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* 2. MAIN CONTENT WRAPPER (Offset dynamically by 250px or 0px on desktop) */}
      <div className={`flex-1 min-w-0 flex flex-col min-h-screen relative z-10 transition-[padding] duration-300 ease-in-out ${
        sidebarHidden ? 'lg:pl-0' : 'lg:pl-[250px]'
      }`}>
        {/* Sticky Header */}
        <Header
          config={config}
          students={students}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setActiveTab('settings')}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
          title={NAV_LABELS[activeTab]}
          onToggleMobileMenu={() => setIsMobileNavOpen(prev => !prev)}
          isSidebarCollapsed={sidebarHidden}
          onToggleSidebar={isFullscreen ? undefined : handleToggleSidebar}
          onWeeklySummary={() => setWeeklySummaryOpen(true)}
          onCallStudent={() => {
            setRandomCallerOpen(true);
            if (config.soundEnabled) soundEngine.playFestiveDrum();
          }}
          onOpenScoreModal={() => {
            setScoreModal({
              isOpen: true,
              targetStudents: students,
              initialTab: 'positive'
            });
          }}
        />

        {/* View Router Area */}
        <main className={`flex-1 w-full mx-auto p-3 sm:p-6 relative z-10 ${isFullscreen ? 'max-w-none' : 'max-w-7xl'}`}>
          {activeTab === 'students' && (
            <StudentsView
              students={students}
              setStudents={setStudents}
              groups={groups}
              criteria={criteria}
              pointLogs={pointLogs}
              config={config}
              onOpenScoreModalForSingle={(student, category) => {
                setScoreModal({
                  isOpen: true,
                  targetStudents: [student],
                  initialTab: category
                });
              }}
              onOpenScoreModalForSelected={(selectedList, category = 'positive') => {
                setScoreModal({
                  isOpen: true,
                  targetStudents: selectedList,
                  initialTab: category
                });
              }}
              onOpenDetailModal={(s) => setDetailStudent(s)}
              onEditStudent={(s) => setStudentToEdit({ isOpen: true, student: s })}
              onOpenAddStudentModal={() => setStudentToEdit({ isOpen: true, student: null })}
              onOpenBulkImportModal={() => setBulkImportOpen(true)}
              onOpenCriteriaModal={() => setCriteriaModalOpen(true)}
              onOpenHonorBoard={() => setWeeklySummaryOpen(true)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              students={students}
              attendance={attendance}
              setAttendance={setAttendance}
            />
          )}

          {activeTab === 'honor' && (
            <HonorView
              students={students}
              config={config}
            />
          )}

          {activeTab === 'groups' && (
            <GroupsView
              groups={groups}
              setGroups={setGroups}
              students={students}
              setStudents={setStudents}
              criteria={criteria}
              pointLogs={pointLogs}
              setPointLogs={setPointLogs}
            />
          )}

          {activeTab === 'games' && (
            <GamesView
              students={students}
              setStudents={setStudents}
              config={config}
              pointLogs={pointLogs}
              setPointLogs={setPointLogs}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              students={students}
              groups={groups}
              criteria={criteria}
              pointLogs={pointLogs}
              config={config}
              attendance={attendance}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              config={config}
              setConfig={setConfig}
              criteria={criteria}
              setCriteria={setCriteria}
              students={students}
              setStudents={setStudents}
              groups={groups}
            />
          )}
        </main>
      </div>

      {/* 3. TOAST FEEDBACK */}
      <ToastFeedback toast={toast} onClose={() => setToast(null)} />

      {/* 4. MODALS CONTAINER */}
      <ScoreModal
        isOpen={scoreModal.isOpen}
        onClose={() => setScoreModal(prev => ({ ...prev, isOpen: false }))}
        targetStudents={scoreModal.targetStudents}
        allStudents={students}
        groups={groups}
        criteria={criteria}
        initialTab={scoreModal.initialTab}
        onApplyScore={handleApplyScore}
      />

      <StudentDetailModal
        isOpen={!!detailStudent}
        onClose={() => setDetailStudent(null)}
        student={detailStudent}
        group={groups.find(g => g.id === detailStudent?.groupId)}
        pointLogs={pointLogs}
        config={config}
        onUndoLog={handleUndoLog}
        onEditStudent={(s) => {
          setDetailStudent(null);
          setStudentToEdit({ isOpen: true, student: s });
        }}
        onOpenCertificate={(s) => {
          setDetailStudent(null);
          setCertStudent(s);
        }}
      />

      <AddEditStudentModal
        isOpen={studentToEdit.isOpen}
        onClose={() => setStudentToEdit({ isOpen: false, student: null })}
        studentToEdit={studentToEdit.student}
        groups={groups}
        onSave={(saved) => {
          let updatedList: Student[];
          if (students.some(s => s.id === saved.id)) {
            updatedList = students.map(s => s.id === saved.id ? saved : s);
          } else {
            updatedList = [...students, saved];
          }
          setStudents(updatedList);
          storage.saveStudents(updatedList);
        }}
      />

      <BulkImportModal
        isOpen={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        existingStudents={students}
        groups={groups}
        onImportStudents={(newBatch) => {
          const merged = [...students, ...newBatch];
          setStudents(merged);
          storage.saveStudents(merged);
        }}
      />

      <CertificateModal
        isOpen={!!certStudent}
        onClose={() => setCertStudent(null)}
        student={certStudent}
        config={config}
      />

      <CriteriaModal
        isOpen={criteriaModalOpen}
        onClose={() => setCriteriaModalOpen(false)}
        criteria={criteria}
        onUpdateCriteria={(updated) => {
          setCriteria(updated);
          storage.saveCriteria(updated);
        }}
      />

      <WeeklySummaryModal
        isOpen={weeklySummaryOpen}
        onClose={() => setWeeklySummaryOpen(false)}
        students={students}
        groups={groups}
        config={config}
        onOpenCertificate={(s) => {
          setWeeklySummaryOpen(false);
          setCertStudent(s);
        }}
      />

      <RankUpModal
        isOpen={!!rankUpEvent}
        onClose={() => setRankUpEvent(null)}
        rankUpEvent={rankUpEvent}
        onOpenHonorBoard={() => {
          setRankUpEvent(null);
          setWeeklySummaryOpen(true);
        }}
      />

      <RandomCallerModal
        isOpen={randomCallerOpen}
        onClose={() => setRandomCallerOpen(false)}
        students={students}
        groups={groups}
        onAddScore={(student, points, note) => {
          handleApplyScore([student], {
            id: `call-reward-${Date.now()}`,
            name: note,
            points,
            category: 'positive',
            icon: '⭐',
            description: 'Gọi môn sinh lên bảng'
          });
        }}
      />
    </div>
  );
};
export default App;
