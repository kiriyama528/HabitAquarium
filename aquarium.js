// Aquarium: photographic assets with subtle, continuous fin and water motion.
const canvas=$('aquarium'),ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let w=1,h=1;
new ResizeObserver(()=>{const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;w=rect.width;h=rect.height;const ratio=Math.min(2,devicePixelRatio);canvas.width=w*ratio;canvas.height=h*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);}).observe(canvas);
const sprite=new Image(),scenery=new Image();sprite.src='assets/elsa.png';scenery.src='assets/aquascape.png';
let lastFrame=0;
function draw(now){
 requestAnimationFrame(draw);
 if(document.hidden||$('home-view').hidden||now-lastFrame<(reduced.matches?200:33))return;
 lastFrame=now;
 const t=reduced.matches?0:now/1000,age=effect?(now-effect.start)/1000:99;
 const feeding=effect?.type==='meal'&&age<6,washing=effect?.type==='water'&&age<6;
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#123c40';ctx.fillRect(0,0,w,h);
 if(scenery.complete&&scenery.naturalWidth){const scale=Math.max(w/scenery.naturalWidth,h/scenery.naturalHeight),dw=scenery.naturalWidth*scale,dh=scenery.naturalHeight*scale;ctx.drawImage(scenery,(w-dw)/2,(h-dh)/2,dw,dh);}
 // Subtle caustic glints near the surface. No decorative symbols in the water.
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<5;i++){ctx.strokeStyle=`rgba(180,228,222,${.035+(washing?.06:0)})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(w*(.08+i*.21)+Math.sin(t*.4+i)*5,8+i%2*4,25+Math.sin(t+i)*9,2.5,0,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
 if(feeding&&!reduced.matches){for(let i=0;i<14;i++){const start=i*.08,fall=Math.max(0,age-start),alpha=Math.max(0,1-fall/3.2);if(age<start||!alpha)continue;ctx.fillStyle=`rgba(179,144,99,${alpha})`;ctx.beginPath();ctx.ellipse(w*(.24+(i%7)*.083)+Math.sin(i+fall)*2,18+fall*28,1.2,.85,.4,0,Math.PI*2);ctx.fill();}}
 for(let i=0;i<growth.count;i++){
  const phase=t*(.13+i*.008)+i*2.1;
  let x=w*(.5+Math.sin(phase)*.29),y=h*(.28+(i%4)*.115+Math.sin(t*.43+i)*.024);
  let facing=Math.tanh(Math.cos(phase)*8);
  if(feeding&&!reduced.matches){const blend=Math.sin(Math.min(1,age/6)*Math.PI)*.85;x=x*(1-blend)+w*(.25+(i%4)*.16)*blend;y=y*(1-blend)+(55+(i%3)*15)*blend;facing=x<w*.5?1:-1;}
  const size=growth.fish[i].size;
  ctx.save();ctx.translate(x,y);ctx.scale(facing,1);ctx.rotate(reduced.matches?0:Math.sin(t*1.8+i)*.025);
  ctx.globalAlpha=.87+(i%3)*.045;
  if(sprite.complete&&sprite.naturalWidth){
   // Slice deformation keeps the head steady while the tail and fin rays undulate.
   const slices=24,sourceWidth=sprite.naturalWidth/slices,drawHeight=size*sprite.naturalHeight/sprite.naturalWidth;
   for(let j=0;j<slices;j++){const tail=1-j/(slices-1),sway=reduced.matches?0:Math.sin(t*5.5+i+j*.24)*tail*tail*size*.023;ctx.drawImage(sprite,j*sourceWidth,0,sourceWidth,sprite.naturalHeight,-size/2+j*size/slices,-drawHeight/2+sway,size/slices+.35,drawHeight);}
  }
  ctx.restore();
  if(effect?.newborn&&i===growth.count-1&&age<6){const halo=ctx.createRadialGradient(x,y,0,x,y,size*.6);halo.addColorStop(0,'rgba(208,238,240,.17)');halo.addColorStop(1,'rgba(208,238,240,0)');ctx.fillStyle=halo;ctx.fillRect(x-size,y-size,size*2,size*2);}
 }
 // Fine suspended particles and aeration during a water change.
 const bubbles=washing?42:7;
 for(let i=0;i<bubbles;i++){
  const travel=t*(washing?36:7)+i*37,x=(i*83.17+Math.sin(t*.6+i)*4)%w,y=h-(travel%h),radius=washing?.6+(i%4)*.4:.55;
  ctx.strokeStyle=washing?'rgba(215,245,246,.48)':'rgba(230,246,238,.18)';ctx.lineWidth=.6;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.stroke();
 }
 if(washing&&!reduced.matches){const light=ctx.createLinearGradient(0,0,w,h);light.addColorStop(0,`rgba(202,242,245,${Math.sin(age/6*Math.PI)*.17})`);light.addColorStop(1,'rgba(202,242,245,0)');ctx.fillStyle=light;ctx.fillRect(0,0,w,h);}
}
requestAnimationFrame(draw);
