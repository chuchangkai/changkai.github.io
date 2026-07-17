/* Vector PDF generator for GitHub Pages. No html2canvas / no screenshot. */
(() => {
  'use strict';
  const FONT_URL = './fonts/TW-MOE-Std-Kai.ttf';
  let fontBase64Promise;

  async function loadKaiFont() {
    if (!fontBase64Promise) {
      fontBase64Promise = fetch(FONT_URL).then(async r => {
        if (!r.ok) throw new Error('找不到 fonts/TW-MOE-Std-Kai.ttf，請依 README 放入教育部標準楷書字型檔。');
        const buf = await r.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(buf);
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        return btoa(binary);
      });
    }
    return fontBase64Promise;
  }

  const isAppleMobile = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const mm = n => n;

  async function savePdfBlob(blob, filename) {
    const file = new File([blob], filename, { type: 'application/pdf' });
    if (isAppleMobile() && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  function collect() {
    const rows = [...document.querySelectorAll('#partsTable tbody tr')].map(tr => ({
      item: tr.cells[0]?.querySelector('input')?.value?.trim() || '',
      spec: tr.cells[1]?.querySelector('input')?.value?.trim() || '',
      qty: tr.querySelector('.qty')?.value || '',
      price: Number(tr.querySelector('.price')?.value) || 0
    })).filter(r => r.item || r.spec || r.price || (r.qty && r.qty !== '1'));
    const date = document.getElementById('dateField').value || '';
    return {
      orderNo: document.getElementById('orderNo').value || '', date,
      customer: document.getElementById('customerName').value.trim(),
      machineNo: document.getElementById('machineNo').value || '',
      startTime: document.getElementById('startTime').value || '', endTime: document.getElementById('endTime').value || '',
      issue: document.getElementById('issue').value || '', cause: document.getElementById('cause').value || '', solution: document.getElementById('solution').value || '',
      rows, total: rows.reduce((s,r)=>s+(Number(r.qty)||0)*r.price,0)
    };
  }

  window.generateVectorPDF = async function generateVectorPDF() {
    const d = collect();
    if (!d.customer) { alert('請先填寫客戶名稱。'); document.getElementById('customerName').focus(); return; }
    const btn = document.querySelector('button[onclick="exportFormalPDF()"]');
    const original = btn?.innerHTML;
    try {
      if (!window.jspdf?.jsPDF) throw new Error('jsPDF 尚未載入，請確認網路連線後重新整理。');
      if (btn) { btn.disabled = true; btn.innerHTML = '<span>⏳</span> PDF 產生中'; }
      const font64 = await loadKaiFont();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4', compress:true, putOnlyUsedFonts:true });
      doc.addFileToVFS('TW-MOE-Std-Kai.ttf', font64);
      doc.addFont('TW-MOE-Std-Kai.ttf', 'MOEKai', 'normal');
      doc.setProperties({ title:'英泰自動控制行－維修單', author:'英泰自動控制行', subject:'維修服務紀錄' });

      const L=12, R=198, W=R-L, black=[0,0,0], blue=[0,112,192], red=[192,0,0];
      const setKai=(size,color=black)=>{doc.setFont('MOEKai','normal');doc.setFontSize(size);doc.setTextColor(...color)};
      const setTimes=(size,style='normal',color=black)=>{doc.setFont('times',style);doc.setFontSize(size);doc.setTextColor(...color)};
      const kai=(txt,x,y,opt={},bold=false)=>{setKai(opt.size||10,opt.color||black);doc.text(String(txt||''),x,y,opt);if(bold)doc.text(String(txt||''),x+0.12,y,opt)};
      const times=(txt,x,y,opt={},bold=false)=>{setTimes(opt.size||10,bold?'bold':'normal',opt.color||black);doc.text(String(txt||''),x,y,opt)};
      const line=(x1,y1,x2,y2,w=.18)=>{doc.setDrawColor(95);doc.setLineWidth(w);doc.line(x1,y1,x2,y2)};
      const cell=(x,y,w,h,text='',align='left',font='kai',bold=false,size=10)=>{doc.setDrawColor(105);doc.setLineWidth(.16);doc.rect(x,y,w,h);const tx=align==='center'?x+w/2:align==='right'?x+w-2:x+2;const o={align,baseline:'middle',size};(font==='times'?times:kai)(text,tx,y+h/2+0.4,o,bold)};
      const money=n=>Number(n||0).toLocaleString('zh-TW',{maximumFractionDigits:0});

      let y=17;
      kai('英泰自動控制行',105,y,{align:'center',size:18,color:blue},true); y+=7;
      times('INTAI AUTO CONTROL',105,y,{align:'center',size:10,color:red},true); y+=13;
      kai('維　修　單',105,y,{align:'center',size:18},true); y+=11;
      // Address with Kai; numerals intentionally written with Times in the contact line.
      kai('彰化縣員林市員集路2段493巷4弄10號',105,y,{align:'center',size:12}); y+=8;
      const parts=[['Tel：','04-8356923'],['Mobile：','0935-435757'],['Fax：','04-8341151'],['統一編號：','45229579']];
      let widths=parts.map(([a,b])=>{setKai(12);const aw=doc.getTextWidth(a);setTimes(12);return [aw,doc.getTextWidth(b)]});
      const gap=5,totalW=widths.reduce((s,w)=>s+w[0]+w[1],0)+gap*3;let x=105-totalW/2;
      parts.forEach(([a,b],i)=>{kai(a,x,y,{size:12},true);x+=widths[i][0];times(b,x,y,{size:12});x+=widths[i][1]+gap}); y+=8;

      const c=[L,L+30,L+94,L+124,R], rh=9;
      const infoRows=[['維修單號',d.orderNo,'填單日期',''],['客戶名稱',d.customer,'機器編號',d.machineNo],['開始時間',d.startTime,'完成時間',d.endTime]];
      infoRows.forEach((r,idx)=>{cell(c[0],y,30,rh,r[0],'center','kai');cell(c[1],y,64,rh,r[1],'left',idx===0?'times':'kai');cell(c[2],y,30,rh,r[2],'center','kai');if(idx===0&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)){const yy=d.date.slice(0,4),mo=d.date.slice(5,7),dd=d.date.slice(8,10);let px=c[3]+3;times(yy,px,y+5.8,{size:10});setTimes(10);px+=doc.getTextWidth(yy);kai(' 年 ',px,y+5.8,{size:10});setKai(10);px+=doc.getTextWidth(' 年 ');times(mo,px,y+5.8,{size:10});setTimes(10);px+=doc.getTextWidth(mo);kai(' 月 ',px,y+5.8,{size:10});setKai(10);px+=doc.getTextWidth(' 月 ');times(dd,px,y+5.8,{size:10});setTimes(10);px+=doc.getTextWidth(dd);kai(' 日',px,y+5.8,{size:10});}else cell(c[3],y,R-c[3],rh,idx===0?d.date:r[3],'left',idx===0?'times':'kai');if(idx>0)cell(c[3],y,R-c[3],rh,r[3],'left',idx===1?'kai':'times');y+=rh});

      y+=7;kai('壹、故障檢測與處理紀錄',L,y,{size:11.5},true);y+=3;
      [['故障情形',d.issue],['故障原因',d.cause],['處理對策',d.solution]].forEach(([lab,val])=>{const h=15;cell(L,y,30,h,lab,'center','kai');doc.setDrawColor(105);doc.setLineWidth(.16);doc.rect(L+30,y,W-30,h);setKai(9.5);const lines=doc.splitTextToSize(val||'',W-35);doc.text(lines,L+32,y+5);y+=h});

      y+=7;kai('貳、維修項目及零件明細',L,y,{size:11.5},true);y+=3;
      const widths2=[12,57,36,17,30,34], headers=['項次','項目／零件名稱','規格','數量','單價','小計'];let xx=L;
      headers.forEach((h,i)=>{cell(xx,y,widths2[i],8,h,'center','kai');xx+=widths2[i]});y+=8;
      const rows=[...d.rows];while(rows.length<3)rows.push({item:'',spec:'',qty:'',price:0});
      rows.forEach((r,i)=>{xx=L;const sub=(Number(r.qty)||0)*(Number(r.price)||0);const vals=[String(i+1),r.item,r.spec,r.qty,r.price?'$'+money(r.price):'',sub?'$'+money(sub):''];vals.forEach((v,j)=>{cell(xx,y,widths2[j],8,v,j===0||j===3?'center':j>=4?'right':'left',j===0||j>=3?'times':'kai');xx+=widths2[j]});y+=8});
      cell(L,y,widths2.slice(0,4).reduce((a,b)=>a+b,0),9,'總計金額（新臺幣）','right','kai');
      const fx=L+widths2.slice(0,4).reduce((a,b)=>a+b,0);doc.setDrawColor(105);doc.setLineWidth(.16);doc.rect(fx,y,widths2[4]+widths2[5],9);times('NT$ '+money(d.total),fx+36,y+5.8,{align:'right',size:11});kai('（未稅價）',R-2,y+5.8,{align:'right',size:9.5});y+=12;
      kai('備註：',L,y,{size:9},true);setKai(9);doc.text('實際維修內容、零件規格及收費金額，以雙方確認結果為準；客戶簽章後，表示已確認本單所載維修內容。',L+15,y);y+=6;
      cell(L,y,W/2,22,'客戶簽章：','left','kai');cell(L+W/2,y,W/2,22,'維修人員：','left','kai');kai('朱文言',R-13,y+17,{align:'right',size:12});y+=27;
      kai('本維修單供客戶確認維修內容及留存紀錄使用。',105,y,{align:'center',size:8.5});y+=5;line(L,y,R,y,.12);y+=4;kai('英泰自動控制行　維修服務紀錄',105,y,{align:'center',size:8});
      kai('字型來源：中華民國教育部標準楷書',L,291,{size:6.5});

      const blob=doc.output('blob');
      const safe=d.customer.replace(/[\\/:*?"<>|]/g,'_')||'客戶';
      const fn=`${(d.date||'').replaceAll('-','')}_${safe}_正式維修單.pdf`;
      await savePdfBlob(blob,fn);
    } catch(e){console.error(e);if(e?.name!=='AbortError')alert(e.message||'PDF 產生失敗。');}
    finally{if(btn){btn.disabled=false;btn.innerHTML=original;}}
  };
})();
