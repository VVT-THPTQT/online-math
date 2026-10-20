import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import formidable from "formidable";
import { parseDocxBuffer } from "../../lib/parser";

export const config={api:{bodyParser:false}};
const MAX=10*1024*1024;
function parseForm(req){
  return new Promise((resolve,reject)=>{
    const form=formidable({multiples:false,maxFileSize:MAX});
    form.parse(req,(err,fields,files)=>err?reject(err):resolve({fields,files}));
  });
}
export default async function handler(req,res){
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Chỉ hỗ trợ POST."});}
  let tempPath;
  try{
    const {fields,files}=await parseForm(req);
    const f=Array.isArray(files.file)?files.file[0]:files.file;
    if(!f||!f.originalFilename?.toLowerCase().endsWith(".docx")) return res.status(400).json({error:"Vui lòng chọn tệp .docx hợp lệ."});
    tempPath=f.filepath;
    const buffer=await fs.readFile(tempPath);
    if(buffer.length>MAX)return res.status(413).json({error:"Tệp tối đa 10 MB."});
    const parsed=await parseDocxBuffer(buffer);
    const dir=path.join(process.cwd(),"uploads");await fs.mkdir(dir,{recursive:true});
    const stored=`${Date.now()}-${crypto.randomBytes(4).toString("hex")}.docx`;
    await fs.copyFile(tempPath,path.join(dir,stored));
    const bankPath=path.join(dir,"bank.json");let bank=[];
    try{bank=JSON.parse(await fs.readFile(bankPath,"utf8"));}catch{}
    const rawTitle=Array.isArray(fields.title)?fields.title[0]:fields.title;
    const item={id:crypto.randomUUID(),title:String(rawTitle||f.originalFilename).slice(0,200),originalFilename:f.originalFilename,storedFilename:stored,importedAt:new Date().toISOString(),questions:parsed.questions,warnings:parsed.questions.filter(q=>q.warning).map(q=>({number:q.number,warning:q.warning}))};
    bank.push(item);await fs.writeFile(bankPath,JSON.stringify(bank,null,2),"utf8");
    return res.status(200).json({message:"Đã nhập đề; vui lòng rà soát đáp án.",exam:item,parserMessages:parsed.messages});
  }catch(err){
    console.error(err);const status=err?.httpCode===413?413:500;
    return res.status(status).json({error:status===413?"Tệp vượt quá 10 MB.":"Không thể đọc tệp Word. Hãy kiểm tra tệp .docx."});
  }finally{if(tempPath)await fs.unlink(tempPath).catch(()=>{});}
}
