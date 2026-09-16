import { Student, ClassConfig } from '../types';

export const AI_SERVICE = {
  // Sinh câu đố Trạng Tí
  async generateRiddle(topic: string = "dân gian", apiKey?: string) {
    if (!apiKey) {
      // Fallback danh sách câu đố dân gian Việt Nam đặc sắc
      const riddles = [
        {
          question: "Đầu rồng đuôi phụng le te, mùa đông ấp trứng mùa hè nở con. Là cây gì?",
          answer: "Cây cau",
          hint: "Cây thân thẳng, quả thường dùng têm trầu"
        },
        {
          question: "Vừa bằng quả ổi, bơi nổi giữa sông, rồng rồng uốn lượn. Là cái gì?",
          answer: "Bánh trôi nước",
          hint: "Bánh làm bằng bột nếp, nhân đường đỏ luộc chín nổi lên"
        },
        {
          question: "Không sơn mà đỏ, không gõ mà kêu, không khều mà rụng. Là cái gì?",
          answer: "Sấm sét và mưa giông",
          hint: "Hiện tượng tự nhiên mùa hè"
        },
        {
          question: "Cày trên đồng ruộng trắng phau, khát xuống uống nước giếng sâu đen ngòm. Là cái gì?",
          answer: "Cây bút mực và lọ mực",
          hint: "Đồ dùng học tập quen thuộc của sĩ tử ngày xưa"
        },
        {
          question: "Mình tròn vành vạnh, đáy phẳng lì, ngồi trên bếp lửa chẳng sợ chi. Là cái gì?",
          answer: "Cái nồi gang / Chảo gang",
          hint: "Đồ dùng nấu ăn trong bếp của mẹ"
        }
      ];
      return riddles[Math.floor(Math.random() * riddles.length)];
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bạn là Chuột Trạng Tí - linh vật thần đồng thông thái. Hãy tạo 1 câu đố dân gian hoặc đố vui toán học/tiếng việt cho học sinh tiểu học theo chủ đề "${topic}". 
Trả về ĐÚNG định dạng JSON sau (không kèm markdown):
{"question": "câu hỏi", "answer": "đáp án", "hint": "gợi ý ngắn"}`
            }]
          }]
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.error("AI Riddle error:", e);
    }

    return {
      question: "Cày trên đồng ruộng trắng phau, khát xuống uống nước giếng sâu đen ngòm. Là cái gì?",
      answer: "Cây bút và lọ mực",
      hint: "Đồ dùng học tập"
    };
  },

  // Sinh nhận xét học sinh cho sổ liên lạc / Zalo phụ huynh
  async generateStudentComment(student: Student, rankTitle: string, config: ClassConfig) {
    if (!config.geminiApiKey) {
      // Smart template generator
      const pos = student.points >= 200 ? "rất tích cực, hăng hái phát biểu và hoàn thành xuất sắc các nhiệm vụ" :
                  student.points >= 100 ? "chăm chỉ, có nhiều tiến bộ trong học tập và ý thức kỷ luật tốt" :
                  "có cố gắng, cần tự tin phát biểu và rèn luyện nề nếp thường xuyên hơn";
      return `Kính gửi phụ huynh em ${student.name}! Trong thời gian qua tại ${config.className}, em đạt danh hiệu "${rankTitle}" với ${student.points} Hoa Điểm Tốt. Em ${pos}. Cô chúc em tiếp tục phấn đấu, rạng rỡ bảng vàng Trạng Nguyên! Thân ái, ${config.teacherName}.`;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bạn là giáo viên chủ nhiệm ${config.teacherName} lớp ${config.className}. Hãy viết một đoạn nhận xét ấm áp, truyền cảm hứng và tinh tế (khoảng 3-4 câu) gửi cho phụ huynh học sinh ${student.name}. 
Thông tin: Em đang giữ chức vụ ${student.role}, đạt danh hiệu "${rankTitle}" với ${student.points} hoa điểm tốt và ${student.stars} sao thi đua. Lời văn sư phạm mực thước, mang nét thi cử Trạng Nguyên cổ vũ tinh thần.`
            }]
          }]
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (e) {
      console.error("AI Student comment error:", e);
    }

    return `Em ${student.name} ngoan ngoãn, đạt thành tích "${rankTitle}" với ${student.points} điểm. Chúc em luôn chăm ngoan, học giỏi!`;
  },

  // Sinh báo cáo tuần lớp học
  async generateClassReport(students: Student[], config: ClassConfig) {
    const totalPoints = students.reduce((sum, s) => sum + s.points, 0);
    const topStudents = [...students].sort((a, b) => b.points - a.points).slice(0, 3);
    const topNames = topStudents.map(s => `${s.name} (${s.points} điểm)`).join(', ');

    return `📜 BÁO CÁO TỔNG KẾT TUẦN - ${config.className.toUpperCase()} 📜
Trường: ${config.schoolName}
GVCN: ${config.teacherName}
Chủ đề: "${config.topic}"

1. THI ĐUA HOA ĐIỂM TỐT:
- Tổng số hoa điểm tốt toàn lớp đã gặt hái: ${totalPoints} điểm.
- Sĩ số tham gia thi đua: ${students.length} học sinh.

2. VINH DANH TAM KHÔI ĐUA TOP TUẦN NÀY:
- Trạng Nguyên: ${topStudents[0]?.name} (${topStudents[0]?.points} điểm)
- Bảng Nhãn: ${topStudents[1]?.name} (${topStudents[1]?.points} điểm)
- Thám Hoa: ${topStudents[2]?.name} (${topStudents[2]?.points} điểm)

3. LỜI NHẮN NHỦ TỪ CÔ CHỦ NHIỆM:
Tuần qua cả lớp đã rất nỗ lực, đoàn kết và sáng tạo. Chúc các Trạng Nguyên nhí tiếp tục chăm ngoan, giữ vững nề nếp và sẵn sàng cho những thử thách tuần mới!`;
  },

  // Kiểm tra tính hợp lệ của API Key
  async testApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: "Vui lòng nhập API Key trước khi kiểm tra." };
    }
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Chào bạn" }]
          }]
        })
      });
      const data = await response.json();
      if (response.ok && data.candidates?.[0]) {
        return { success: true, message: "Kết nối Gemini AI thành công! Khóa API hoạt động chính xác." };
      }
      const errMsg = data.error?.message || "Khóa API không hợp lệ hoặc đã hết hạn mức.";
      return { success: false, message: `Lỗi kết nối: ${errMsg}` };
    } catch (e: any) {
      return { success: false, message: `Không thể kết nối máy chủ Google AI: ${e.message || 'Lỗi mạng'}` };
    }
  }
};
