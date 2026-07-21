const beats=[...document.querySelectorAll('.v14-beat')];
const images=[...document.querySelectorAll('.v14-stage-image')];
const labels=beats.map((beat)=>beat.dataset.label||'');
const stageTitle=document.getElementById('v14-stage-title');
const stageCount=document.getElementById('v14-stage-count');
const progress=document.querySelector('.v14-progress');

const scenePaths=[
  '/assets/v14/01-driveway-measure.webp',
  '/assets/v14/03-rainy-rental-claymation.webp',
  '/assets/v14/09-papercraft-road-trip.webp',
  '/assets/v14/02-family-clay-diorama.webp',
  '/assets/v14/10-family-cargo-fit.webp',
  '/assets/v14/08-highway-platform-test.webp',
  '/assets/v14/04-neon-parking-assist.webp',
  '/assets/v14/05-mountain-charging.webp',
  '/assets/v14/06-interior-visibility.webp',
  '/assets/v14/07-sunset-decision.webp'
];

images.forEach((image,index)=>{
  if(scenePaths[index]) image.src=scenePaths[index];
  image.loading=index===0?'eager':'lazy';
  image.decoding='async';
});

const hero=document.querySelector('.v14-hero');
if(hero){
  hero.style.backgroundImage="linear-gradient(90deg,rgba(8,11,9,.94) 0%,rgba(8,11,9,.58) 44%,rgba(8,11,9,.1) 76%),url('/assets/v14/01-driveway-measure.webp')";
}

function setActive(index){
  beats.forEach((el,i)=>el.classList.toggle('active',i===index));
  images.forEach((el,i)=>el.classList.toggle('active',i===index));
  if(stageTitle) stageTitle.textContent=labels[index];
  if(stageCount) stageCount.textContent=String(index+1).padStart(2,'0')+' / '+String(beats.length).padStart(2,'0');
}

const observer=new IntersectionObserver((entries)=>{
  const visible=entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(visible) setActive(Number(visible.target.dataset.index));
},{rootMargin:'-25% 0px -45% 0px',threshold:[0,.15,.35,.6]});

beats.forEach((beat)=>observer.observe(beat));
setActive(0);

window.addEventListener('scroll',()=>{
  const max=document.documentElement.scrollHeight-window.innerHeight;
  if(progress) progress.style.transform='scaleX('+(max?window.scrollY/max:0)+')';
},{passive:true});