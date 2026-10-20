# Next.js Math Exam

## Chạy ứng dụng
Cài Node.js 20+, giải nén dự án rồi chạy:
```bash
npm install
npm run dev
```
Mở http://localhost:3000. Trang giáo viên: http://localhost:3000/admin.

## Có gì trong dự án?
- `pages/index.js`: giao diện học sinh, 3 dạng câu hỏi, đếm giờ, chấm điểm demo và lời giải.
- `pages/admin.js`: tải nhiều file DOCX lên ngân hàng đề.
- `pages/api/upload.js`: API nhận DOCX, phân tích và lưu file/metadata.
- `lib/parser.js`: parser cơ bản nhận diện 3 phần, gạch chân, `[HDG]`, `[Đúng]`, `[Sai]`, `[[đáp số]]`.
- KaTeX thông qua `react-markdown`, `remark-math`, `rehype-katex`.

## Giới hạn quan trọng
Bản này là starter/demo. Ngân hàng đề được lưu trên đĩa trong `uploads/bank.json`, không phù hợp môi trường serverless/multi-instance. Cần thêm đăng nhập/phân quyền, database, bảo vệ API, kiểm thử parser, hỗ trợ bảng và công thức Word (OMML) trước khi thi thật.
