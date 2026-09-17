import {SPECIES,freshState,validState,startSession,remainingSeconds,settleSession,cancelSession,totalMinutes,isUnlocked} from './garden-core.js?v=7';
import {exportBackup,importBackup,MAX_BACKUP_BYTES} from './backup.js?v=9';
const $=id=>document.getElementById(id),KEY='mygarden.v1';
let state=freshState(),selectedPlot=0,page=0,toastTimeout,installPrompt,audio=null,audioPlaying=false;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').hidden=true,5000);}
try{const saved=localStorage.getItem(KEY);if(saved)state=validState(JSON.parse(saved));else{const legacy=JSON.parse(localStorage.getItem('myForest')||'[]');if(Array.isArray(legacy)){const trees=legacy.filter(x=>x==='🌳');state.plots=Array(Math.max(16,(Math.floor(trees.length/16)+1)*16)).fill(null);trees.forEach((_,i)=>state.plots[i]={id:'legacy-'+i,species:'oak',minutes:25,completedAt:0});}}}catch{toast('Không thể đọc dữ liệu cũ. Một khu vườn mới đã sẵn sàng.');}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{toast('Không thể lưu dữ liệu. Hãy kiểm tra dung lượng hoặc quyền lưu trữ.');return false;}}
const speciesOf=id=>SPECIES.find(s=>s.id===id)||SPECIES[0];
function view(name){$('focus-view').hidden=name!=='focus';$('garden-view').hidden=name!=='garden';for(const n of ['focus','garden']){const tab=$(n+'-tab');tab.classList.toggle('active',n===name);if(n===name)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');}render();}
function render(){
 const session=state.session,sp=speciesOf(session?.species||state.selectedSpecies),seconds=session?remainingSeconds(session):state.duration*60;
 $('timer').textContent=format(seconds);
 const progress=session?Math.max(0,Math.min(1,1-seconds/(session.minutes*60))):1;
 $('plant-art').textContent=session?sp.stages[progress<.35?0:progress<.75?1:2]:sp.icon;$('plant-art').setAttribute('aria-label',sp.name);
 $('plant-caption').textContent=session?sp.name+' đang lớn lên · ô '+(session.plot+1):'Một '+sp.name.toLowerCase()+' đang chờ bạn';
 $('focus-label').textContent=session?'MỘT MẦM SỐNG ĐANG LỚN LÊN':'DÀNH MỘT CHÚT THỜI GIAN CHO BẠN';
 $('message').textContent=session?'Cứ chậm rãi. Thời gian này là của bạn.':'Đặt điện thoại xuống. Để khu vườn lớn lên.';
 $('action').textContent=session?'Kết thúc sớm':'Bắt đầu '+sp.verb+'  ↗';$('action').classList.toggle('running',!!session);$('setup').hidden=!!session;
 $('choose-species').textContent=sp.icon+' '+sp.name+'  ⌄';$('duration').value=state.duration;
 const occupied=state.plots.filter(Boolean);$('garden-count').textContent=occupied.length+' / '+state.plots.length;
 $('stat-plants').textContent=occupied.length;$('stat-sessions').textContent=occupied.length;$('stat-minutes').textContent=occupied.reduce((sum,p)=>sum+p.minutes,0);
 page=Math.max(0,Math.min(page,state.plots.length/16-1));$('page-label').textContent='Khu '+(page+1)+' / '+state.plots.length/16;$('prev').disabled=page===0;$('next').disabled=page===state.plots.length/16-1;
 $('garden-hint').textContent=session?'Mầm đang lớn. Hãy ngắm vườn trong lúc tập trung.':'Chọn một ô đất trống để gieo mầm.';
 $('garden').replaceChildren();state.plots.slice(page*16,page*16+16).forEach((plant,i)=>{const index=page*16+i,reserved=session?.plot===index,b=document.createElement('button');b.className='plot '+(plant?'':'empty ')+(reserved?'reserved ':'')+(!plant&&selectedPlot===index?'selected':'');b.textContent=plant?speciesOf(plant.species).icon:reserved?'🌱':'+';b.setAttribute('aria-label','Ô '+(index+1)+': '+(plant?speciesOf(plant.species).name:reserved?'đang phát triển':'đất trống'));b.addEventListener('click',()=>{if(plant)toast(speciesOf(plant.species).name+' · '+plant.minutes+' phút tập trung');else if(session)toast('Hãy hoàn thành phiên hiện tại trước khi gieo mầm mới.');else{selectedPlot=index;view('focus');toast('Đã chọn ô đất '+(index+1));}});$('garden').append(b);});
 $('sound-kind').value=state.sound;$('volume').value=state.volume;
}
function format(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function tick(){const before=totalMinutes(state);if(settleSession(state)){save();stopSound();const unlocked=SPECIES.filter(s=>(s.unlockMinutes||0)>before&&(s.unlockMinutes||0)<=totalMinutes(state));toast(unlocked.length?'Hoàn thành! Mở khóa thêm: '+unlocked.map(s=>s.name).join(', '):'Hoàn thành! Khu vườn có một thành viên mới ✿');selectedPlot=state.plots.findIndex(p=>!p);render();}else if(state.session){const s=remainingSeconds(state.session);$('timer').textContent=format(s);const sp=speciesOf(state.session.species),p=1-s/(state.session.minutes*60);$('plant-art').textContent=sp.stages[p<.35?0:p<.75?1:2];}}
function sync(){try{const saved=localStorage.getItem(KEY);if(saved)state=validState(JSON.parse(saved));}catch{}tick();render();}
window.addEventListener('storage',e=>{if(e.key===KEY){sync();if(!state.session)stopSound();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});window.addEventListener('pageshow',sync);
async function mutate(fn){const run=()=>{sync();fn();};if(navigator.locks)await navigator.locks.request('mygarden-state',run);else run();}
 $('action').addEventListener('click',()=>{const minutes=Number($('duration').value);mutate(()=>{if(state.session){$('cancel-dialog').showModal();return;}if(!Number.isInteger(minutes)||minutes<1||minutes>180){toast('Chọn thời lượng từ 1 đến 180 phút.');return;}state.duration=minutes;if(state.plots[selectedPlot])selectedPlot=state.plots.findIndex(p=>!p);if(startSession(state,selectedPlot,state.selectedSpecies,minutes)){save();render();}});});
 $('confirm-cancel').addEventListener('click',()=>mutate(()=>{cancelSession(state);save();stopSound();$('cancel-dialog').close();render();toast('Ô đất vẫn còn trống. Khi sẵn sàng, hãy thử lại.');}));
 $('keep-focus').addEventListener('click',()=>$('cancel-dialog').close());
 $('duration').addEventListener('change',()=>{const n=Number($('duration').value);if(Number.isInteger(n)&&n>=1&&n<=180){state.duration=n;save();render();}else{toast('Chọn thời lượng từ 1 đến 180 phút.');$('duration').value=state.duration;}});
 $('choose-species').addEventListener('click',()=>{
  const minutes=totalMinutes(state),next=SPECIES.find(s=>(s.unlockMinutes||0)>minutes);
  $('unlock-progress').textContent=next?'Đã tập trung '+Math.floor(minutes/60)+' giờ '+(minutes%60)+' phút · Còn '+(next.unlockMinutes-minutes)+' phút để mở khóa 3 sinh vật mới.':'Bạn đã mở khóa toàn bộ bộ sưu tập!';
  $('species-list').replaceChildren();SPECIES.forEach(sp=>{
   const b=document.createElement('button');b.className='species'+(state.selectedSpecies===sp.id?' chosen':'');
   const art=document.createElement('span');art.textContent=sp.icon;b.append(art,sp.name);
   if(!isUnlocked(state,sp.id)){b.classList.add('locked');b.disabled=true;const hint=document.createElement('small');hint.textContent='🔒 '+sp.unlockMinutes/60+' giờ';b.append(hint);}
   b.addEventListener('click',()=>{if(!isUnlocked(state,sp.id))return;state.selectedSpecies=sp.id;save();$('species-dialog').close();render();});
   $('species-list').append(b);
  });$('species-dialog').showModal();
 });
 $('close-species').addEventListener('click',()=>$('species-dialog').close());$('focus-tab').addEventListener('click',()=>view('focus'));$('garden-tab').addEventListener('click',()=>view('garden'));$('prev').addEventListener('click',()=>{page--;render();});$('next').addEventListener('click',()=>{page++;render();});
const SOUND_TRACKS={rain:'./sound/liecio-calming-rain.mp3',stream:'./sound/alex_jauk-calm-zen-river-flowing-228223.mp3',ambient:'./sound/focus.mp3'};
let soundRequest=0;
async function startSound(){
 stopSound();const request=soundRequest,player=new Audio(SOUND_TRACKS[state.sound]);audio=player;
 player.loop=true;player.volume=state.volume/100;player.preload='auto';
 player.addEventListener('error',()=>{if(audio===player){stopSound();toast('Không tải được bản âm thanh. Hãy mở ứng dụng có mạng một lần để lưu ngoại tuyến.');}});
 try{await player.play();if(request!==soundRequest||audio!==player){player.pause();return;}
 audioPlaying=true;$('sound-toggle').textContent='Ⅱ';$('sound-toggle').setAttribute('aria-pressed','true');$('sound-toggle').setAttribute('aria-label','Tạm dừng âm thanh');
 }catch{if(request===soundRequest){stopSound();toast('Không thể phát âm thanh. Hãy thử bấm phát lại.');}}
}
function stopSound(){soundRequest++;if(audio){audio.pause();audio.removeAttribute('src');audio.load();}audio=null;audioPlaying=false;$('sound-toggle').textContent='♫';$('sound-toggle').setAttribute('aria-pressed','false');$('sound-toggle').setAttribute('aria-label','Phát âm thanh');}
 $('sound-toggle').addEventListener('click',()=>audio?stopSound():startSound());$('sound-kind').addEventListener('change',()=>{const playing=!!audio;state.sound=$('sound-kind').value;save();if(playing)startSound();});$('volume').addEventListener('input',()=>{state.volume=Number($('volume').value);if(audio)audio.volume=state.volume/100;save();});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('install').hidden=false;$('tagline').hidden=true;});$('install').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('install').hidden=true;$('tagline').hidden=false;}});window.addEventListener('appinstalled',()=>{$('install').hidden=true;$('tagline').hidden=false;toast('MyGarden đã được cài đặt.');});
let pendingImport=null,importRequest=0;
function resetImport(){importRequest++;pendingImport=null;$('backup-file').value='';$('import-preview').hidden=true;$('backup-error').hidden=true;}
$('backup-open').addEventListener('click',()=>{resetImport();$('backup-dialog').showModal();});
$('backup-close').addEventListener('click',()=>$('backup-dialog').close());
$('backup-dialog').addEventListener('close',resetImport);
$('backup-cancel').addEventListener('click',resetImport);
$('backup-export').addEventListener('click',()=>mutate(()=>{
 const url=URL.createObjectURL(new Blob([exportBackup(state)],{type:'application/json'})),link=document.createElement('a');
 link.href=url;link.download='mygarden-backup-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';$('backup-dialog').append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Đã tạo file sao lưu khu vườn.');
}));
$('backup-file').addEventListener('change',async()=>{
 const file=$('backup-file').files[0],request=++importRequest;pendingImport=null;$('import-preview').hidden=true;$('backup-error').hidden=true;
 if(!file)return;
 try{if(file.size>MAX_BACKUP_BYTES)throw Error('File quá lớn (tối đa 5 MB).');const candidate=importBackup(await file.text());if(request!==importRequest)return;pendingImport=candidate.state;
  const plants=pendingImport.plots.filter(Boolean).length,minutes=totalMinutes(pendingImport),date=candidate.exportedAt?new Date(candidate.exportedAt).toLocaleString('vi-VN'):'không rõ ngày';
  $('import-summary').textContent=plants+' sinh vật · '+minutes+' phút tập trung · '+pendingImport.plots.length+' ô đất. Xuất lúc: '+date+'.'+(pendingImport.session?' Có phiên đang chạy; thời gian tiếp tục tính theo mốc kết thúc đã lưu.':'');$('import-preview').hidden=false;if(!$('backup-dialog').open)$('backup-dialog').showModal();
 }catch(error){if(request!==importRequest)return;$('backup-error').textContent=error.message;$('backup-error').hidden=false;}
});
$('backup-confirm').addEventListener('click',()=>mutate(()=>{
 if(!pendingImport)return;
 try{localStorage.setItem(KEY,JSON.stringify(pendingImport));}catch{$('backup-error').textContent='Không thể lưu bản nhập. Dữ liệu hiện tại chưa bị thay thế.';$('backup-error').hidden=false;return;}
 stopSound();state=pendingImport;selectedPlot=state.session?.plot??state.plots.findIndex(p=>!p);page=0;$('backup-dialog').close();tick();view('garden');toast('Đã nhập khu vườn. Tiến trình của bạn được khôi phục.');
}));
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>toast('Chế độ ngoại tuyến cần HTTPS hoặc localhost.'));
selectedPlot=state.session?.plot??state.plots.findIndex(p=>!p);tick();render();setInterval(tick,1000);
