// The aquarium is a procedural game scene: fish react to recorded care events.
const canvas=$('aquarium'), ctx=canvas.getContext('2d'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
let w=1,h=1;
new ResizeObserver(()=>{const rect=canvas.getBoundingClientRect();w=rect.width;h=rect.height;canvas.width=w*Math.min(2,devicePixelRatio);canvas.height=h*Math.min(2,devicePixelRatio);ctx.setTransform(Math.min(2,devicePixelRatio),0,0,Math.min(2,devicePixelRatio),0,0);}).observe(canvas);
const sprite=new Image();sprite.src='assets/medaka.png';
const fish=Array.from({length:5},(_,i)=>({x:.16+i*.16,y:.28+(i%3)*.16,speed:.018+i*.003,phase:i*1.9,color:['#d9a255','#d8c49c','#d99a69','#b9c8b7','#e5bc6c'][i]}));
let lastFrame=0;
function draw(now){
 requestAnimationFrame(draw); if(document.hidden || $('home-view').hidden || now-lastFrame<(reduced.matches?200:33))return;lastFrame=now;
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
 if(feeding&&!reduced.matches){for(let i=0;i<16;i++){const x=w*(.32+(i*.029)% .35),y=24+Math.min(age*30,110)+(i%4)*7;ctx.fillStyle=`rgba(141,107,56,${Math.max(0,1-age/6)})`;ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill();}}
 fish.forEach((f,i)=>{const phase=t*(.19+i*.015)+f.phase;let x=w*(.5+Math.sin(phase)*.27),y=h*(.32+i*.105+Math.sin(t*.7+i)*.025);let direction=Math.cos(phase)>=0?1:-1;
 if(feeding&&!reduced.matches){const blend=Math.sin(Math.min(1,age/6)*Math.PI)*.95;x=x*(1-blend)+w*(.27+i*.115)*blend;y=y*(1-blend)+(88+(i%2)*30)*blend;direction=x<w*.5?1:-1;}
 ctx.save();ctx.translate(x,y);ctx.scale(direction,1);ctx.rotate(reduced.matches?0:Math.sin(t*3+i)*.035);const size=i===0?145:105;
 if(sprite.complete&&sprite.naturalWidth){ctx.globalAlpha=i===3?.85:1;ctx.drawImage(sprite,-size/2,-size/3,size,size*2/3);}ctx.restore();
 if(feeding&&age>1&&age<4&&!reduced.matches){ctx.fillStyle='#ed9f8790';ctx.font='17px serif';ctx.fillText('♡',x-5,y-26-(age*13)%20);}
 });
 for(let i=0;i<(washing?30:8);i++){const x=(i*91.7+Math.sin(t+i)*5)%w,y=h-((t*(washing?65:17)+i*47)%h);ctx.strokeStyle='#ffffff65';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,2+i%4,0,7);ctx.stroke();}
 if(washing&&!reduced.matches){for(let j=0;j<14;j++){const xx=(j*73)%w,yy=(j*43+age*28)%h;ctx.fillStyle='#fffbe6';ctx.font='18px serif';ctx.fillText('✧',xx,yy);}ctx.strokeStyle='#ffffff90';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(0,h-(age/5)*h);ctx.quadraticCurveTo(w*.5,h-(age/5)*h+Math.sin(age*3)*30,w,h-(age/5)*h);ctx.stroke();ctx.fillStyle=`rgba(233,255,253,${.15*Math.sin(age/5*Math.PI)})`;ctx.fillRect(0,0,w,h);}


}
requestAnimationFrame(draw);
