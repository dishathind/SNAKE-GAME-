const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const restartBtn = document.getElementById('restart');
const mobileControls = document.getElementById('mobile-controls');
const ctx = canvas.getContext('2d');

let cols = 20; let rows = 20; let cell=20; let scale=1;
let snake, food, dir, nextDir, running, score, speed, tickAcc, lastTime;

function resize(){
  const wrap = canvas.parentElement.getBoundingClientRect();
  const maxSize = Math.min(wrap.width, window.innerHeight * 0.7);
  cell = Math.floor(maxSize / cols);
  if(cell < 8){ cols = Math.max(12, Math.floor(cols * 0.8)); cell = Math.floor(maxSize/cols); }
  canvas.style.width = `${cols*cell}px`;
  canvas.style.height = `${cols*cell}px`;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = cols * cell * dpr;
  canvas.height = cols * cell * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function reset(){
  cols = 20; rows = 20; score = 0; speed = 6; tickAcc = 0; lastTime = 0;
  snake = [{x:9,y:9},{x:8,y:9},{x:7,y:9}];
  dir = {x:1,y:0}; nextDir = {x:1,y:0};
  placeFood();
  running = false; updateHud();
}

function placeFood(){
  while(true){
    const x = Math.floor(Math.random()*cols);
    const y = Math.floor(Math.random()*rows);
    if(!snake.some(s=>s.x===x && s.y===y)){ food = {x,y}; break }
  }
}

function updateHud(){ scoreEl.textContent = score }

function step(){
  dir = nextDir;
  const head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
  if(head.x<0||head.x>=cols||head.y<0||head.y>=rows||snake.some(s=>s.x===head.x&&s.y===head.y)){
    running = false; return
  }
  snake.unshift(head);
  if(head.x===food.x && head.y===food.y){ score++; speed = 6 + Math.floor(score/3); placeFood(); updateHud() } else { snake.pop() }
}

function draw(){
  const w = cols*cell; const h = rows*cell;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = '#071827'; ctx.fillRect(0,0,w,h);
  ctx.fillStyle = '#16a34a'; for(let i=0;i<snake.length;i++){ const s=snake[i]; ctx.fillRect(s.x*cell+1,s.y*cell+1,cell-2,cell-2) }
  ctx.fillStyle = '#f97316'; ctx.fillRect(food.x*cell+2,food.y*cell+2,cell-4,cell-4);
}

function loop(ts){
  if(!lastTime) lastTime = ts; const dt = (ts-lastTime)/1000; lastTime = ts;
  if(running){
    tickAcc += dt * speed;
    while(tickAcc >= 1){ step(); tickAcc -= 1 }
  }
  draw();
  requestAnimationFrame(loop);
}

function changeDir(d){ if((d.x===-dir.x && d.y===-dir.y)) return; nextDir = d }

window.addEventListener('keydown', e=>{
  const m = {ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}};
  const key = e.key.length===1?e.key.toLowerCase():e.key;
  if(m[key]) changeDir(m[key]);
});

let touchStart = null;
window.addEventListener('touchstart', e=>{ if(e.touches[0]) touchStart = {x:e.touches[0].clientX, y:e.touches[0].clientY} },{passive:true});
window.addEventListener('touchend', e=>{ if(!touchStart) return; const t = e.changedTouches[0]; const dx = t.clientX - touchStart.x; const dy = t.clientY - touchStart.y; if(Math.abs(dx)>20||Math.abs(dy)>20){ if(Math.abs(dx)>Math.abs(dy)) changeDir(dx>0?{x:1,y:0}:{x:-1,y:0}); else changeDir(dy>0?{x:0,y:1}:{x:0,y:-1}); } touchStart = null },{passive:true});

mobileControls.querySelectorAll('button').forEach(b=>b.addEventListener('click', ()=>{
  const dirMap = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
  const d = b.dataset.dir; if(dirMap[d]) changeDir(dirMap[d]);
}));

startBtn.addEventListener('click', ()=>{ if(!running){ running = true; lastTime = 0 } });
pauseBtn.addEventListener('click', ()=>{ running = !running });
restartBtn.addEventListener('click', ()=>{ reset(); running = true; lastTime = 0 });

window.addEventListener('resize', ()=>{ resize(); draw() });

reset(); resize(); requestAnimationFrame(loop);
