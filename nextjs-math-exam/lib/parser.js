const mammoth = require("mammoth");

function decodeEntities(s) {
  return s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function parseDocxHtml(html) {
  const lines = decodeEntities(html.replace(/<\/p>|<br\s*\/?>|<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "").replace(/<[^>]+>/g, ""))
    .split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  let part=1, current=null, optionKey=null, statementKey=null, solutionMode=false;
  const questions=[];
  function finish() {
    if (!current) return;
    if (current.part===2) current.options=current.statements;
    delete current.statements;
    if (current.part===1 && ["A","B","C","D"].some(k=>!(k in current.options))) current.warning="Chưa nhận diện đủ lựa chọn A-D.";
    if (!Object.keys(current.correctAnswer).length) current.warning=current.warning||"Chưa nhận diện được đáp án; giáo viên cần kiểm tra.";
    questions.push(current); current=null;
  }
  for (let line of lines) {
    if (/PHẦN\s*(I|1)\b/i.test(line)) { finish(); part=1; continue; }
    if (/PHẦN\s*(II|2)\b/i.test(line)) { finish(); part=2; continue; }
    if (/PHẦN\s*(III|3)\b/i.test(line)) { finish(); part=3; continue; }
    const qm=line.match(/^Câu\s*(\d+)\s*[:.)-]?\s*(.*)$/i);
    if (qm) {
      finish(); current={number:+qm[1],part,content:qm[2],options:{},statements:{},correctAnswer:{},solution:"",points:part===1?.25:part===2?1:.5};
      optionKey=null; statementKey=null; solutionMode=false; line=qm[2]; if (!line) continue;
    }
    if (!current) continue;
    if (line.includes("[HDG]")) { solutionMode=true; line=line.replace("[HDG]","").trim(); if(!line) continue; }
    if (solutionMode) { current.solution+=(current.solution?"\n":"")+line; continue; }
    const short=line.match(/\[\[(.*?)\]\]/);
    if (short) { current.correctAnswer.value=short[1].trim(); line=line.replace(short[0],"").trim(); }
    const tf=line.match(/^(<u>)?([a-d])(?:<\/u>)?\)\s*(.*)$/i);
    if (tf && current.part===2) {
      const k=tf[2].toLowerCase(); let body=tf[3]; const ex=body.match(/\[(Đúng|Sai)\]/i);
      if(ex){current.correctAnswer[k]=ex[1].toLowerCase()==="đúng";body=body.replace(ex[0],"").trim();}
      else if(tf[1]) current.correctAnswer[k]=true;
      current.statements[k]=body; statementKey=k; optionKey=null; continue;
    }
    const op=line.match(/^(<u>)?([A-D])(?:<\/u>)?\.\s*(.*)$/i);
    if(op && current.part===1) {
      const k=op[2].toUpperCase(); let body=op[3];
      if(op[1]||/\[Đúng\]/i.test(body)) current.correctAnswer.value=k;
      current.options[k]=body.replace(/\[(?:Đúng|Sai)\]/gi,"").trim(); optionKey=k; statementKey=null; continue;
    }
    if(optionKey) current.options[optionKey]+="\n"+line;
    else if(statementKey) current.statements[statementKey]+="\n"+line;
    else current.content+=(current.content?"\n":"")+line;
  }
  finish(); return questions;
}
async function parseDocxBuffer(buffer) {
  const result=await mammoth.convertToHtml({buffer},{styleMap:["u => u"]});
  return {html:result.value,messages:result.messages,questions:parseDocxHtml(result.value)};
}
module.exports={parseDocxBuffer,parseDocxHtml};
