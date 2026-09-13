const KEY = 'medaka-biyori-v1';
const $ = id => document.getElementById(id);
const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
let state = { started: dateKey(), records: [] }, storageBroken = false;
try {
  const saved = localStorage.getItem(KEY);
  if(saved) {
    const parsed = JSON.parse(saved);
    if(!parsed || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.started) || !Array.isArray(parsed.records) || !parsed.records.every(r => r && typeof r.id === 'string' && Number.isFinite(Date.parse(r.at)) && (r.type === 'water' ? Number.isInteger(r.amount) && r.amount > 0 && r.amount <= 3000 : r.type === 'meal' && ['朝ごはん','昼ごはん','夜ごはん','間食'].includes(r.meal) && ['p','f','c'].every(k => Number.isInteger(r[k]) && r[k]>=1 && r[k]<=10)))) throw new Error('Invalid data');
    state = parsed;
  }
} catch { storageBroken = true; }
function toast(message) { $('toast').textContent=message; $('toast').classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>$('toast').classList.remove('show'),4000); }
function save(next) {
  if(storageBroken){toast('保存データを読み込めません。既存のデータを保護するため記録を停止しています。'); return false;}
  try { localStorage.setItem(KEY,JSON.stringify(next)); state=next; return true; }
  catch {toast('保存できませんでした。ブラウザーの保存設定や空き容量をご確認ください。');return false;}
}
const nutrientDefinitions=[['p','たんぱく質','P','#b9904f','#f5ebd9'],['f','脂質','F','#b78072','#f4e5df'],['c','炭水化物','C','#809665','#eaf0df']];
$('nutrients').innerHTML=nutrientDefinitions.map(([id,label,initial,color,pale])=>`<div class="nutrient" style="--color:${color};--pale:${pale}"><label class="nutrient-title" for="${id}"><i>${initial}</i>${label}<output id="${id}-value" for="${id}">5</output><small>/ 10</small></label><input id="${id}" type="range" min="1" max="10" step="1" value="5"><div class="range-labels"><span>少なめ</span><span>いつもくらい</span><span>多め</span></div></div>`).join('');
nutrientDefinitions.forEach(([id])=>$(id).addEventListener('input',()=>$(id+'-value').value=$(id).value));
function selectTab(type){ ['meal','water'].forEach(t=>{ $(t+'-tab').setAttribute('aria-selected',String(t===type)); $(t+'-tab').tabIndex=t===type?0:-1; $(t+'-panel').hidden=t!==type; }); }
['meal','water'].forEach(type=>{ $(type+'-tab').onclick=()=>selectTab(type); $(type+'-tab').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'meal':e.key==='End'?'water':type==='meal'?'water':'meal';selectTab(next);$(next+'-tab').focus();}}; });
document.querySelectorAll('[data-water]').forEach(b=>b.onclick=()=>{$('water-amount').value=b.dataset.water; markPreset();});
function markPreset(){document.querySelectorAll('[data-water]').forEach(b=>b.classList.toggle('selected',b.dataset.water===$('water-amount').value));}
$('water-amount').oninput=markPreset;
let effect=null;
function addRecord(record){const next={...state,records:[...state.records,{...record,id:crypto.randomUUID(),at:new Date().toISOString()}]};if(!save(next))return; $('history-date').value=dateKey();render();effect={type:record.type,start:performance.now()};toast(record.type==='meal'?'ごはんを記録しました。メダカもいただきます！':'水分を記録しました。水槽がすっきり！');}
$('meal-panel').onsubmit=e=>{e.preventDefault();addRecord({type:'meal',meal:$('meal-type').value,p:+$('p').value,f:+$('f').value,c:+$('c').value});};
$('water-panel').onsubmit=e=>{e.preventDefault();const amount=Number($('water-amount').value);if(!Number.isInteger(amount)||amount<1||amount>3000)return;addRecord({type:'water',amount});};
$('history-date').value=dateKey(); $('history-date').onchange=render;
function cleanliness(){const latest=state.records.filter(r=>r.type==='water').reduce((max,r)=>Math.max(max,Date.parse(r.at)),0);return latest?Math.max(30,100-(Date.now()-latest)/3600000*2):65;}
function render(){
  const today=dateKey(), records=state.records.filter(r=>dateKey(new Date(r.at))===today);
  $('today').textContent=new Intl.DateTimeFormat('ja-JP',{month:'long',day:'numeric',weekday:'short'}).format(new Date());
  $('meal-count').textContent=records.filter(r=>r.type==='meal').length;
  $('water-total').textContent=records.filter(r=>r.type==='water').reduce((sum,r)=>sum+r.amount,0).toLocaleString();
  $('care-days').textContent=new Set(state.records.map(r=>dateKey(new Date(r.at)))).size;
  $('day-tag').textContent=`飼育 ${Math.max(1,Math.floor((Date.parse(today+'T00:00:00')-Date.parse(state.started+'T00:00:00'))/86400000)+1)} 日目`;
  const clean=cleanliness(); $('clean-bar').style.width=clean+'%'; $('clean-label').textContent=clean>=75?'きれい':clean>=50?'おだやか':'水換え日和';
  $('care-label').textContent=records.length?'今日もお世話、ありがとう':'お世話をはじめよう';
  const items=state.records.filter(r=>dateKey(new Date(r.at))===$('history-date').value).slice().reverse();
  $('history-list').replaceChildren();
  if(!items.length){const li=document.createElement('li');li.className='empty';li.textContent='この日の記録はまだありません。食事や水分を記録して、メダカのお世話をはじめましょう。';$('history-list').append(li);}
  items.forEach(r=>{const li=document.createElement('li');li.className=r.type;
    const icon=document.createElement('span');icon.className='history-icon';icon.textContent=r.type==='meal'?'◌':'≋';
    const body=document.createElement('div');body.className='history-text';body.textContent=r.type==='meal'?`${r.meal} · えさをあげました`:`水分 ${r.amount.toLocaleString()} mL · 水を入れ替えました`;
    const detail=document.createElement('small');detail.textContent=r.type==='meal'?`たんぱく質 ${r.p} / 脂質 ${r.f} / 炭水化物 ${r.c}`:'水槽がすっきり、気持ちよさそう。';body.append(detail);
    const time=document.createElement('time');time.dateTime=r.at;time.textContent=new Intl.DateTimeFormat('ja-JP',{hour:'2-digit',minute:'2-digit'}).format(new Date(r.at));
    const remove=document.createElement('button');remove.className='delete';remove.textContent='取消';remove.setAttribute('aria-label',`${time.textContent}の${r.type==='meal'?r.meal:'水分'}の記録を取り消す`);remove.onclick=()=>{if(!confirm('この記録を取り消しますか？'))return;if(save({...state,records:state.records.filter(x=>x.id!==r.id)})){render();toast('記録を取り消しました。');}};
    li.append(icon,body,time,remove);$('history-list').append(li);
  });
}
$('export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`medaka-${dateKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
render();if(storageBroken)toast('保存データを読み込めませんでした。記録は上書きしていません。');
if(document.modelContext?.registerTool){
  try{Promise.resolve(document.modelContext.registerTool({
    name:'read_aquarium_summary',title:'今日のお世話の記録を読む',
    description:'今日の食事の記録回数、水分量、水槽のきれいさを読み取ります。記録の変更は行いません。',
    inputSchema:{type:'object',properties:{},additionalProperties:false},
    annotations:{readOnlyHint:true,untrustedContentHint:false},
    execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('引数は空のオブジェクトにしてください。');const today=state.records.filter(r=>dateKey(new Date(r.at))===dateKey());return {date:dateKey(),meals:today.filter(r=>r.type==='meal').length,waterMl:today.filter(r=>r.type==='water').reduce((sum,r)=>sum+r.amount,0),cleanliness:Math.round(cleanliness())};}
  })).catch(()=>{});}catch{}
}
setInterval(render,60000);
// The aquarium is a procedural game scene: fish react to recorded care events.
const canvas=$('aquarium'), ctx=canvas.getContext('2d'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
let w=1,h=1;
new ResizeObserver(()=>{const rect=canvas.getBoundingClientRect();w=rect.width;h=rect.height;canvas.width=w*devicePixelRatio;canvas.height=h*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}).observe(canvas);
const fish=Array.from({length:5},(_,i)=>({x:.16+i*.16,y:.28+(i%3)*.16,speed:.018+i*.003,phase:i*1.9,color:['#d9a255','#d8c49c','#d99a69','#b9c8b7','#e5bc6c'][i]}));
function draw(now){
 const t=reduced.matches?0:now/1000,age=effect?(now-effect.start)/1000:99,feeding=effect?.type==='meal'&&age<6,washing=effect?.type==='water'&&age<5;
 if(effect&&age>6)effect=null;
 ctx.clearRect(0,0,w,h);const water=ctx.createLinearGradient(0,0,0,h);water.addColorStop(0,'#d9ebe0');water.addColorStop(.48,'#b8d8ca');water.addColorStop(1,'#8db8a8');ctx.fillStyle=water;ctx.fillRect(0,0,w,h);
 // Light shafts and softly moving surface reflections.
 for(let i=0;i<5;i++){ctx.fillStyle=`rgba(255,255,226,${.045+i*.006})`;ctx.beginPath();ctx.moveTo(w*(i*.24)-80,0);ctx.lineTo(w*(i*.24)+20,0);ctx.lineTo(w*(i*.24)+h*.6+80,h);ctx.lineTo(w*(i*.24)+h*.6-80,h);ctx.fill();}
 ctx.strokeStyle='#ffffff38';ctx.lineWidth=1;for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(w*(.15+i*.16),18+Math.sin(t+i)*3,30+i*4,3,0,0,Math.PI*2);ctx.stroke();}
 // Sandy substrate, stones and aquatic plants.
 ctx.fillStyle='#c7ccb0';ctx.beginPath();ctx.moveTo(0,h-28);ctx.quadraticCurveTo(w*.45,h-8,w,h-39);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
 for(let i=0;i<70;i++){ctx.fillStyle=i%2?'#98ab9270':'#e1dfba90';ctx.beginPath();ctx.ellipse((i*137.2)%w,h-6-(i*11.3)%20,1.6,1,0,0,7);ctx.fill();}
 for(const [x,y,rx,ry] of [[.14,22,34,14],[.2,17,23,10],[.8,28,45,19],[.87,20,31,13]]){ctx.fillStyle='#8eaa9b';ctx.beginPath();ctx.ellipse(w*x,h-y,rx,ry,-.1,0,7);ctx.fill();}
 for(let i=0;i<17;i++){const x=i<9?20+i*9:w-20-(i-9)*10,ph=i*1.7,len=50+(i*31)%95;ctx.strokeStyle=i%2?'#527f66aa':'#709773b0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,h-20);ctx.quadraticCurveTo(x-8+Math.sin(t*.7+ph)*6,h-len*.6,x+Math.sin(t*.6+ph)*8,h-len);ctx.stroke();for(let j=1;j<5;j++){const yy=h-20-j*len/5,xx=x+Math.sin(t*.6+ph)*j;ctx.fillStyle=i%2?'#638c6b90':'#779d7490';ctx.beginPath();ctx.ellipse(xx+(j%2?6:-6),yy,4,13,j%2?.7:-.7,0,7);ctx.fill();}}
 if(feeding){for(let i=0;i<16;i++){const x=w*(.32+(i*.029)% .35),y=24+Math.min(age*30,110)+(i%4)*7;ctx.fillStyle=`rgba(141,107,56,${Math.max(0,1-age/6)})`;ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill();}}
 fish.forEach((f,i)=>{let x=((f.x+t*f.speed)%1.36-.18)*w,y=(f.y+Math.sin(t*.65+f.phase)*.04)*h;const direction=i%2?-1:1;if(direction<0)x=w-x;if(feeding){const blend=Math.sin(Math.min(1,age/6)*Math.PI)*.85;x=x*(1-blend)+w*(.36+i*.065)*blend;y=y*(1-blend)+(70+i*12)*blend;}
 ctx.save();ctx.translate(x,y);ctx.scale(direction,1);const size=w<430?.78:1;ctx.scale(size,size);ctx.fillStyle='#446e5b12';ctx.beginPath();ctx.ellipse(0,15,26,6,0,0,7);ctx.fill();ctx.fillStyle=f.color;ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-34,Math.sin(t*6+i)*3-10);ctx.quadraticCurveTo(-29,0,-34,10+Math.sin(t*6+i)*3);ctx.closePath();ctx.fill();ctx.beginPath();ctx.ellipse(0,0,23,7,0,0,7);ctx.fill();ctx.fillStyle='#ffffed65';ctx.beginPath();ctx.ellipse(2,-2,16,2,0,0,7);ctx.fill();ctx.fillStyle='#ecdfb78a';ctx.beginPath();ctx.moveTo(-2,3);ctx.lineTo(-10,13);ctx.lineTo(9,5);ctx.fill();ctx.fillStyle='#354c40';ctx.beginPath();ctx.arc(16,-1,1.7,0,7);ctx.fill();ctx.restore();});
 for(let i=0;i<(washing?30:8);i++){const x=(i*91.7+Math.sin(t+i)*5)%w,y=h-((t*(washing?65:17)+i*47)%h);ctx.strokeStyle='#ffffff65';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,2+i%4,0,7);ctx.stroke();}
 if(washing){ctx.fillStyle=`rgba(233,255,253,${.15*Math.sin(age/5*Math.PI)})`;ctx.fillRect(0,0,w,h);}
 $('tank-caption').textContent=feeding?'みんな集まって、いただきます。':washing?'新しいお水、きもちいいね。':'ゆっくり、のんびり。いい一日を。';
 requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
