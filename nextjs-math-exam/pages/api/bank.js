import fs from "node:fs/promises";
import path from "node:path";
export default async function handler(req,res){
  if(req.method!=="GET")return res.status(405).json({error:"Chỉ hỗ trợ GET."});
  try{
    const bank=JSON.parse(await fs.readFile(path.join(process.cwd(),"uploads","bank.json"),"utf8"));
    return res.status(200).json(bank.map(({id,title,originalFilename,importedAt,questions,warnings})=>({id,title,originalFilename,importedAt,questionCount:questions.length,warnings})));
  }catch{return res.status(200).json([]);}
}
