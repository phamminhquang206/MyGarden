export const SPECIES=[{id:'pine',name:'Cây thông',icon:'🌲',stages:['🌱','🌿','🌲'],verb:'trồng'},{id:'oak',name:'Cây xanh',icon:'🌳',stages:['🌱','🌿','🌳'],verb:'trồng'},{id:'cherry',name:'Anh đào',icon:'🌸',stages:['🌱','🌿','🌸'],verb:'trồng'},{id:'sunflower',name:'Hướng dương',icon:'🌻',stages:['🌱','🌿','🌻'],verb:'trồng'},{id:'rabbit',name:'Thỏ nhỏ',icon:'🐇',stages:['🐰','🐰','🐇'],verb:'nuôi'},{id:'cat',name:'Mèo con',icon:'🐈',stages:['🐱','🐱','🐈'],verb:'nuôi'}];
const additions=[
 ['palm','Cây cọ','🌴','trồng'],['tulip','Tulip','🌷','trồng'],['dog','Cún nhỏ','🐕','nuôi'],
 ['cactus','Xương rồng','🌵','trồng'],['rose','Hoa hồng','🌹','trồng'],['deer','Hươu','🦌','nuôi'],
 ['bamboo','Tre xanh','🎋','trồng'],['hibiscus','Dâm bụt','🌺','trồng'],['fox','Cáo nhỏ','🦊','nuôi'],
 ['maple','Phong đỏ','🍁','trồng'],['lotus','Hoa sen','🪷','trồng'],['squirrel','Sóc nhỏ','🐿️','nuôi'],
];
additions.forEach(([id,name,icon,verb],i)=>SPECIES.push({id,name,icon,verb,stages:verb==='trồng'?['🌱','🌿',icon]:[icon,icon,icon],unlockMinutes:(Math.floor(i/3)+1)*300}));
export const totalMinutes=state=>state.plots.reduce((sum,p)=>sum+(p?.minutes||0),0);
export const isUnlocked=(state,id)=>{const sp=SPECIES.find(s=>s.id===id);return !!sp&&totalMinutes(state)>=(sp.unlockMinutes||0);};
export const freshState=()=>({version:1,plots:Array(16).fill(null),session:null,selectedSpecies:'pine',duration:25,sound:'rain',volume:35});
export function validState(v){
 if(!v||v.version!==1||!Array.isArray(v.plots)||v.plots.length<16||v.plots.length%16)return freshState();
 const b=freshState();b.plots=v.plots.map(p=>p&&SPECIES.some(s=>s.id===p.species)&&Number.isFinite(p.minutes)&&p.minutes>0?{species:p.species,minutes:p.minutes,completedAt:Number(p.completedAt)||0,id:String(p.id||'legacy')}:null);
 if(SPECIES.some(s=>s.id===v.selectedSpecies))b.selectedSpecies=v.selectedSpecies;
 if(Number.isInteger(v.duration)&&v.duration>=0&&v.duration<=180)b.duration=v.duration;
 if(['rain','stream','ambient'].includes(v.sound))b.sound=v.sound;
 if(Number.isFinite(v.volume))b.volume=Math.max(0,Math.min(100,v.volume));
 const s=v.session;if(s&&typeof s.id==='string'&&SPECIES.some(x=>x.id===s.species)&&Number.isInteger(s.plot)&&s.plot>=0&&s.plot<b.plots.length&&!b.plots[s.plot]&&Number.isFinite(s.startedAt)&&Number.isInteger(s.minutes)&&s.minutes>=1&&s.minutes<=180&&s.endsAt===s.startedAt+s.minutes*60000)b.session={...s};
 if(b.plots.every(Boolean))b.plots.push(...Array(16).fill(null));
 if(!isUnlocked(b,b.selectedSpecies))b.selectedSpecies='pine';return b;
}
export function startSession(state,plot,species,minutes,now=Date.now(),id=globalThis.crypto.randomUUID()){
 if(state.session||!Number.isInteger(plot)||plot<0||plot>=state.plots.length||state.plots[plot]||!isUnlocked(state,species)||!Number.isInteger(minutes)||minutes<1||minutes>180)return false;
 state.session={id,plot,species,minutes,startedAt:now,endsAt:now+minutes*60000};return true;
}
export function remainingSeconds(s,now=Date.now()){return Math.max(0,Math.ceil((s.endsAt-now)/1000));}
export function settleSession(state,now=Date.now()){const s=state.session;if(!s||now<s.endsAt)return false;if(!state.plots[s.plot])state.plots[s.plot]={id:s.id,species:s.species,minutes:s.minutes,completedAt:s.endsAt};state.session=null;if(state.plots.every(Boolean))state.plots.push(...Array(16).fill(null));return true;}
export function cancelSession(state){state.session=null;}
