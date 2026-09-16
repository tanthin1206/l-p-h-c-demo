import { Student, Group, Criterion, PointLog, AttendanceDay, Assignment, ClassConfig } from '../types';
import * as XLSX from 'xlsx';

export const STORAGE_KEYS = {
  STUDENTS: "tndv_students_v2",
  GROUPS: "tndv_groups_v2",
  CRITERIA: "tndv_criteria_v2",
  POINT_LOGS: "tndv_point_logs_v2",
  ATTENDANCE: "tndv_attendance_v2",
  ASSIGNMENTS: "tndv_assignments_v2",
  CONFIG: "tndv_config_v2",
  OFFLINE_HOME_BANNER: "offlineBannerData",
  OFFLINE_GAME_BANNER: "offlineGameBanner",
  OFFLINE_TAMKHOI_BANNER: "offlineTamKhoiBanner",
  RANDOM_CALLED_IDS: "random_caller_called_ids"
};

export const DEFAULT_GROUPS: Group[] = [
  { id: "group-1", name: "Tổ 1: Rồng Vàng", icon: "🐉", color: "from-amber-500 to-orange-600", slogan: "Chăm chỉ - Tự tin - Bay cao" },
  { id: "group-2", name: "Tổ 2: Hổ Dũng Mãnh", icon: "🐯", color: "from-red-500 to-rose-600", slogan: "Đoàn kết - Quyết tâm - Dẫn đầu" },
  { id: "group-3", name: "Tổ 3: Chim Lạc", icon: "🦅", color: "from-emerald-500 to-teal-600", slogan: "Kiên trì - Vững bước - Tỏa sáng" },
  { id: "group-4", name: "Tổ 4: Cá Chép Vượt Sóng", icon: "🐟", color: "from-blue-500 to-indigo-600", slogan: "Vượt khó - Chăm ngoan - Thành tài" }
];

export const DEFAULT_CRITERIA: Criterion[] = [
  { id: "c-1", name: "Tích cực giơ tay phát biểu", points: 2, category: "positive", icon: "🙋‍♂️", description: "Hăng hái xây dựng bài và trả lời câu hỏi" },
  { id: "c-2", name: "Bài tập làm xuất sắc / Điểm 10", points: 5, category: "positive", icon: "⭐", description: "Bài vở sạch đẹp, đạt kết quả cao" },
  { id: "c-3", name: "Giúp đỡ bạn bè / Việc tốt", points: 3, category: "positive", icon: "🤝", description: "Hỗ trợ bạn cùng tiến bộ, nhặt được của rơi" },
  { id: "c-4", name: "Đọc sách / Rèn chữ chăm chỉ", points: 2, category: "positive", icon: "📖", description: "Chữ viết nắn nót, đọc bài to rõ ràng" },
  { id: "c-5", name: "Giữ gìn vệ sinh / Trực nhật tốt", points: 2, category: "positive", icon: "🧹", description: "Bàn ghế gọn gàng, lớp học sạch đẹp" },
  { id: "c-6", name: "Sáng tạo / Ý tưởng hay", points: 3, category: "positive", icon: "💡", description: "Có lời giải độc đáo, sản phẩm mĩ thuật đẹp" },
  { id: "c-7", name: "Tự giác & Kỷ luật tốt", points: 2, category: "positive", icon: "🛡️", description: "Xếp hàng ngay ngắn, lắng nghe thầy cô" },
  { id: "c-8", name: "Hoàn thành nhiệm vụ tổ giao", points: 3, category: "positive", icon: "🎯", description: "Hoàn thành tốt phần việc của nhóm thi đua" },
  { id: "c-9", name: "Nói chuyện riêng trong giờ", points: -1, category: "reminder", icon: "🤫", description: "Cần tập trung lắng nghe bài giảng" },
  { id: "c-10", name: "Quên sách vở / Đồ dùng học tập", points: -1, category: "reminder", icon: "🎒", description: "Cần kiểm tra thời khóa biểu trước khi đến lớp" },
  { id: "c-11", name: "Chưa hoàn thành bài tập về nhà", points: -2, category: "reminder", icon: "📝", description: "Cần hoàn thành bài vở đầy đủ trước giờ học" },
  { id: "c-12", name: "Đi học trễ / Vào lớp muộn", points: -1, category: "reminder", icon: "⏰", description: "Cần chú ý đi học đúng giờ" },
  { id: "c-13", name: "Mất trật tự / Làm việc riêng", points: -1, category: "reminder", icon: "⚠️", description: "Cần giữ trật tự chung trong lớp" }
];

// Dữ liệu mẫu tùy chọn (khi người dùng muốn nạp thử nghiệm)
export const SAMPLE_STUDENTS: Student[] = [
  { id: "s-1", name: "Nguyễn Gia Bảo", gender: "male", avatar: "rong_con", groupId: "group-1", points: 420, stars: 42, role: "Lớp trưởng", birthDate: "2016-04-12" },
  { id: "s-2", name: "Trần Minh Khang", gender: "male", avatar: "trau_vang", groupId: "group-1", points: 340, stars: 34, role: "Tổ trưởng Tổ 1", birthDate: "2016-08-20" },
  { id: "s-3", name: "Lê Bảo Ngọc", gender: "female", avatar: "tho_ngoc", groupId: "group-1", points: 295, stars: 29, role: "Học sinh", birthDate: "2016-02-15" },
  { id: "s-4", name: "Phạm Tuấn Kiệt", gender: "male", avatar: "ho_con", groupId: "group-1", points: 210, stars: 21, role: "Học sinh", birthDate: "2016-11-05" },
  { id: "s-5", name: "Đỗ Mai Chi", gender: "female", avatar: "chim_hac", groupId: "group-1", points: 185, stars: 18, role: "Học sinh", birthDate: "2016-07-22" },
  { id: "s-6", name: "Vũ Hải Đăng", gender: "male", avatar: "ca_chep", groupId: "group-1", points: 140, stars: 14, role: "Học sinh", birthDate: "2016-09-30" },
  { id: "s-7", name: "Bùi Thảo Vy", gender: "female", avatar: "meo_ngoan", groupId: "group-1", points: 110, stars: 11, role: "Học sinh", birthDate: "2016-03-18" },
  { id: "s-8", name: "Hoàng Đức Anh", gender: "male", avatar: "voi_con", groupId: "group-1", points: 85, stars: 8, role: "Học sinh", birthDate: "2016-12-04" },

  { id: "s-9", name: "Lê Phương Linh", gender: "female", avatar: "tho_ngoc", groupId: "group-2", points: 380, stars: 38, role: "Lớp phó học tập", birthDate: "2016-05-10" },
  { id: "s-10", name: "Nguyễn Phúc Khang", gender: "male", avatar: "ho_con", groupId: "group-2", points: 310, stars: 31, role: "Tổ trưởng Tổ 2", birthDate: "2016-01-25" },
  { id: "s-11", name: "Đặng Khánh Huyền", gender: "female", avatar: "chim_lac", groupId: "group-2", points: 260, stars: 26, role: "Học sinh", birthDate: "2016-09-14" },
  { id: "s-12", name: "Trịnh Gia Huy", gender: "male", avatar: "rong_con", groupId: "group-2", points: 195, stars: 19, role: "Học sinh", birthDate: "2016-06-08" },
  { id: "s-13", name: "Ngô Trúc Anh", gender: "female", avatar: "meo_ngoan", groupId: "group-2", points: 165, stars: 16, role: "Học sinh", birthDate: "2016-10-19" },
  { id: "s-14", name: "Phan Đình Trọng", gender: "male", avatar: "trau_vang", groupId: "group-2", points: 130, stars: 13, role: "Học sinh", birthDate: "2016-04-03" },
  { id: "s-15", name: "Võ Quỳnh Nga", gender: "female", avatar: "ong_vang", groupId: "group-2", points: 95, stars: 9, role: "Học sinh", birthDate: "2016-08-11" },
  { id: "s-16", name: "Dương Minh Trí", gender: "male", avatar: "chuot_thong_thai", groupId: "group-2", points: 75, stars: 7, role: "Học sinh", birthDate: "2016-11-28" },

  { id: "s-17", name: "Phạm Đăng Khoa", gender: "male", avatar: "chuot_thong_thai", groupId: "group-3", points: 410, stars: 41, role: "Lớp phó phong trào", birthDate: "2016-03-09" },
  { id: "s-18", name: "Nguyễn Ngọc Ánh", gender: "female", avatar: "chim_hac", groupId: "group-3", points: 285, stars: 28, role: "Tổ trưởng Tổ 3", birthDate: "2016-07-04" },
  { id: "s-19", name: "Vũ Thiên An", gender: "female", avatar: "tho_ngoc", groupId: "group-3", points: 240, stars: 24, role: "Học sinh", birthDate: "2016-02-28" },
  { id: "s-20", name: "Trần Quang Dũng", gender: "male", avatar: "chim_lac", groupId: "group-3", points: 175, stars: 17, role: "Học sinh", birthDate: "2016-10-02" },
  { id: "s-21", name: "Lâm Uyên Nhi", gender: "female", avatar: "meo_ngoan", groupId: "group-3", points: 150, stars: 15, role: "Học sinh", birthDate: "2016-06-16" },
  { id: "s-22", name: "Đoàn Mạnh Hùng", gender: "male", avatar: "voi_con", groupId: "group-3", points: 120, stars: 12, role: "Học sinh", birthDate: "2016-12-19" },
  { id: "s-23", name: "Hà Bảo Trâm", gender: "female", avatar: "ong_vang", groupId: "group-3", points: 90, stars: 9, role: "Học sinh", birthDate: "2016-05-23" },
  { id: "s-24", name: "Lý Thế Phong", gender: "male", avatar: "ca_chep", groupId: "group-3", points: 65, stars: 6, role: "Học sinh", birthDate: "2016-01-14" },

  { id: "s-25", name: "Nguyễn Thùy Dương", gender: "female", avatar: "rua_vang", groupId: "group-4", points: 360, stars: 36, role: "Lớp phó đời sống", birthDate: "2016-08-17" },
  { id: "s-26", name: "Trịnh Anh Tuấn", gender: "male", avatar: "ca_chep", groupId: "group-4", points: 305, stars: 30, role: "Tổ trưởng Tổ 4", birthDate: "2016-04-29" },
  { id: "s-27", name: "Đỗ Kim Ngân", gender: "female", avatar: "chim_lac", groupId: "group-4", points: 230, stars: 23, role: "Học sinh", birthDate: "2016-11-12" },
  { id: "s-28", name: "Mai Hoàng Nam", gender: "male", avatar: "ho_con", groupId: "group-4", points: 180, stars: 18, role: "Học sinh", birthDate: "2016-09-06" },
  { id: "s-29", name: "Hồ Bích Thảo", gender: "female", avatar: "meo_ngoan", groupId: "group-4", points: 145, stars: 14, role: "Học sinh", birthDate: "2016-03-21" },
  { id: "s-30", name: "Lê Nhật Minh", gender: "male", avatar: "trau_vang", groupId: "group-4", points: 115, stars: 11, role: "Học sinh", birthDate: "2016-07-31" },
  { id: "s-31", name: "Tô Minh Châu", gender: "female", avatar: "tho_ngoc", groupId: "group-4", points: 80, stars: 8, role: "Học sinh", birthDate: "2016-12-25" },
  { id: "s-32", name: "Chu Đình Kiên", gender: "male", avatar: "voi_con", groupId: "group-4", points: 55, stars: 5, role: "Học sinh", birthDate: "2016-02-08" }
];

export const DEFAULT_CONFIG: ClassConfig = {
  className: "Lớp 3A1",
  schoolName: "Trường Tiểu học Lĩnh Nam",
  teacherName: "Cô giáo Nguyễn Hồng Nhung",
  teacherTitle: "Giáo viên chủ nhiệm",
  topic: "Học Chăm - Rèn Tốt - Xứng Danh Trạng Nguyên Đất Việt",
  classMotto: "Đoàn kết • Tự tin • Chăm ngoan • Sáng tạo",
  academicYear: "2025 - 2026",
  soundEnabled: true,
  theme: "royal-amber",
  isEditMode: false
};

export const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: "hw-1",
    title: "Giải toán bảng nhân 7 & Bài toán đố dân gian",
    subject: "Toán",
    description: "Làm bài tập trang 42 SGK và hoàn thành 3 câu đố vui Trạng Tí vào vở bài tập.",
    dueDate: "2026-08-20",
    rewardPoints: 5,
    completedStudentIds: ["s-1", "s-2", "s-9", "s-17", "s-25", "s-26"],
    createdAt: "2026-08-17"
  },
  {
    id: "hw-2",
    title: "Luyện viết đoạn văn: Kể về một việc tốt em đã làm",
    subject: "Tiếng Việt",
    description: "Viết đoạn văn ngắn 5-7 câu chữ viết nắn nót, kể lại một lần em giúp đỡ bạn bè hoặc người thân.",
    dueDate: "2026-08-21",
    rewardPoints: 5,
    completedStudentIds: ["s-1", "s-3", "s-9", "s-10", "s-18"],
    createdAt: "2026-08-17"
  },
  {
    id: "hw-3",
    title: "Vẽ tranh Linh vật Trạng Nguyên em yêu thích",
    subject: "Mĩ thuật",
    description: "Vẽ và tô màu bức tranh chú Trâu Vàng hoặc Rồng Con mang mũ cánh chuồn Trạng Nguyên.",
    dueDate: "2026-08-22",
    rewardPoints: 4,
    completedStudentIds: ["s-1", "s-2", "s-3", "s-4", "s-9", "s-17", "s-19", "s-25"],
    createdAt: "2026-08-16"
  }
];

export const storage = {
  // Mặc định khởi tạo: DANH SÁCH HỌC SINH TRỐNG để giáo viên tự thêm học sinh thực tế vào
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  // Nạp dữ liệu 32 học sinh mẫu (nếu người dùng muốn trải nghiệm nhanh)
  loadSampleStudents(): Student[] {
    this.saveStudents(SAMPLE_STUDENTS);
    return SAMPLE_STUDENTS;
  },

  getGroups(): Group[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
      return data ? JSON.parse(data) : DEFAULT_GROUPS;
    } catch {
      return DEFAULT_GROUPS;
    }
  },
  saveGroups(groups: Group[]) {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  },

  getCriteria(): Criterion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CRITERIA);
      return data ? JSON.parse(data) : DEFAULT_CRITERIA;
    } catch {
      return DEFAULT_CRITERIA;
    }
  },
  saveCriteria(criteria: Criterion[]) {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
  },

  getPointLogs(): PointLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POINT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePointLogs(logs: PointLog[]) {
    localStorage.setItem(STORAGE_KEYS.POINT_LOGS, JSON.stringify(logs));
  },

  getAttendance(): AttendanceDay[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveAttendance(attendance: AttendanceDay[]) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  },

  getAssignments(): Assignment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      return data ? JSON.parse(data) : DEFAULT_ASSIGNMENTS;
    } catch {
      return DEFAULT_ASSIGNMENTS;
    }
  },
  saveAssignments(assignments: Assignment[]) {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  },

  getConfig(): ClassConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? JSON.parse(data) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  },
  saveConfig(config: ClassConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  getCalledIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RANDOM_CALLED_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveCalledIds(ids: string[]) {
    localStorage.setItem(STORAGE_KEYS.RANDOM_CALLED_IDS, JSON.stringify(ids));
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.CRITERIA);
    localStorage.removeItem(STORAGE_KEYS.POINT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_HOME_BANNER);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_GAME_BANNER);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_TAMKHOI_BANNER);
    localStorage.removeItem(STORAGE_KEYS.RANDOM_CALLED_IDS);
  },

  exportAllDataJSON(): string {
    const data = {
      students: this.getStudents(),
      groups: this.getGroups(),
      criteria: this.getCriteria(),
      pointLogs: this.getPointLogs(),
      attendance: this.getAttendance(),
      assignments: this.getAssignments(),
      config: this.getConfig(),
      exportDate: new Date().toISOString(),
      version: "2.0"
    };
    return JSON.stringify(data, null, 2);
  },

  importAllDataJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.students && Array.isArray(parsed.students)) {
        this.saveStudents(parsed.students);
      }
      if (parsed.groups && Array.isArray(parsed.groups)) {
        this.saveGroups(parsed.groups);
      }
      if (parsed.criteria && Array.isArray(parsed.criteria)) {
        this.saveCriteria(parsed.criteria);
      }
      if (parsed.pointLogs && Array.isArray(parsed.pointLogs)) {
        this.savePointLogs(parsed.pointLogs);
      }
      if (parsed.attendance && Array.isArray(parsed.attendance)) {
        this.saveAttendance(parsed.attendance);
      }
      if (parsed.assignments && Array.isArray(parsed.assignments)) {
        this.saveAssignments(parsed.assignments);
      }
      if (parsed.config) {
        this.saveConfig({ ...DEFAULT_CONFIG, ...parsed.config });
      }
      return true;
    } catch (e) {
      console.error("Import JSON Error:", e);
      return false;
    }
  },

  exportStudentsToExcel(students: Student[], groups: Group[]) {
    const groupMap = new Map(groups.map(g => [g.id, g.name]));
    const excelData = students.map((s, index) => ({
      "STT": index + 1,
      "Mã Học Sinh": s.id,
      "Họ và Tên": s.name,
      "Giới Tính": s.gender === 'male' ? 'Nam' : 'Nữ',
      "Ngày Sinh": s.birthDate || '',
      "Tổ": groupMap.get(s.groupId) || s.groupId,
      "Chức Vụ": s.role,
      "Hoa Điểm Tốt": s.points,
      "Sao": s.stars
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachHocSinh");
    XLSX.writeFile(workbook, `Danh_Sach_Lop_Trang_Nguyen_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
};
