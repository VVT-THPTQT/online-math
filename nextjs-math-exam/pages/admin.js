import {useEffect,useState} from "react";
import {UploadCloud,FileText,CheckCircle2,AlertTriangle,RefreshCw,BookOpen} from "lucide-react";
export default function Admin(){
 const [files,setFiles]=useState([]),[title,setTitle]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[bank,setBank]=useState([]);
 async function refresh(){try{const r=await fetch("/api/bank");setBank(await r.json());}catch{setBank([]);}}
 useEffect(()=>{refresh();},[]);
 async function upload(){
  if(!files.length){setMessage("Vui lòng chọn tệp .docx.");return;}
  setBusy(true);setMessage("");const out=[];
  for(const file of files){const fd=new FormData();fd.append("file",file);fd.append("title",title.trim()||file.name.replace(/\.docx$/i,""));
   try{const r=await fetch("/api/upload",{method:"POST",body:fd});const d=await r.json();out.push(r.ok?`✓ ${file.name}: nhập ${d.exam.questions.length} câu`:`✗ ${file.name}: ${d.error}`);}catch{out.push(`✗ ${file.name}: lỗi kết nối`);}
  }
  setMessage(out.join("\n"));setFiles([]);await refresh();setBusy(false);
 }
 return <main className="min-h-screen px-4 py-8 sm:px-8"><div className="mx-auto max-w-5xl">
  <a href="/" className="text-sm font-semibold text-blue-700">← Về trang học sinh</a>
  <div className="mt-5 flex items-center gap-3"><div className="rounded-2xl bg-blue-700 p-3 text-white"><BookOpen size={26}/></div><div><p className="text-sm font-bold text-blue-700">KHU VỰC GIÁO VIÊN</p><h1 className="text-3xl font-extrabold">Ngân hàng đề thi</h1></div></div>
  <p className="mt-3 text-slate-600">Tải lên nhiều file Word để trích xuất câu hỏi. Hãy rà soát đáp án trước khi sử dụng.</p>
  <section className="mt-7 rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold">Nhập đề từ Word (.docx)</h2>
   <label className="mt-5 block text-sm font-semibold">Tên kỳ thi / nhóm đề<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Kiểm tra giữa kỳ Toán 10" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"/></label>
   <label className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-6 text-center"><UploadCloud size={36} className="text-blue-700"/><b className="mt-3">Chọn các tệp Word</b><span className="mt-1 text-sm text-slate-500">.docx · tối đa 10 MB mỗi tệp</span><input type="file" accept=".docx" multiple className="sr-only" onChange={e=>setFiles(Array.from(e.target.files||[]))}/></label>
   {files.map(f=><div key={f.name+f.size} className="mt-2 flex items-center gap-3 rounded-xl border p-3 text-sm"><FileText size={18}/><span className="flex-1">{f.name}</span><span>{(f.size/1048576).toFixed(2)} MB</span></div>)}
   <div className="mt-5 flex flex-wrap gap-3"><button disabled={busy||!files.length} onClick={upload} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?<RefreshCw className="animate-spin" size={18}/>:<UploadCloud size={18}/>} {busy?"Đang xử lý":"Tải lên và phân tích"}</button><button onClick={refresh} className="rounded-xl border px-5 py-3 font-semibold">Làm mới</button></div>
   {message&&<pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm">{message}</pre>}
  </section>
  <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Đề đã nhập</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{bank.length} đề</span></div>
   {!bank.length?<p className="mt-5 text-sm text-slate-500">Chưa có đề nào.</p>:bank.map(item=><div key={item.id} className="flex flex-wrap items-center gap-3 border-b py-4"><FileText size={22}/><div className="flex-1"><b>{item.title}</b><div className="text-sm text-slate-500">{item.originalFilename} · {item.questionCount} câu · {new Date(item.importedAt).toLocaleString("vi-VN")}</div></div>{item.warnings?.length?<span className="inline-flex items-center gap-1 text-sm text-amber-700"><AlertTriangle size={15}/>{item.warnings.length} cảnh báo</span>:<span className="inline-flex items-center gap-1 text-sm text-emerald-700"><CheckCircle2 size={15}/>Đã phân tích</span>}</div>)}
  </section><p className="mt-5 text-xs text-slate-500">Bản mẫu chưa có đăng nhập/phân quyền. Không dùng trực tiếp cho kỳ thi chính thức.</p>
 </div></main>;
}
