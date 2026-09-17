import {SPECIES,validState} from './garden-core.js?v=7';
export const MAX_BACKUP_BYTES=5*1024*1024;
export function exportBackup(state,now=new Date()){return JSON.stringify({app:'MyGarden',backupVersion:1,exportedAt:now.toISOString(),state:validState(state)},null,2);}
export function importBackup(text){
 if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw Error('File quá lớn (tối đa 5 MB).');
 let value;try{value=JSON.parse(text);}catch{throw Error('File không phải JSON hợp lệ.');}
 if(value?.app!=='MyGarden'||value.backupVersion!==1)throw Error('File không phải bản sao lưu MyGarden được hỗ trợ.');
 const s=value.state,known=id=>SPECIES.some(p=>p.id===id),integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
 if(!s||s.version!==1||!Array.isArray(s.plots)||!integer(s.plots.length,16,100000)||s.plots.length%16)throw Error('Cấu trúc khu vườn không hợp lệ.');
 if(s.plots.some(p=>p!==null&&(!p||typeof p.id!=='string'||!known(p.species)||!integer(p.minutes,1,180)||!Number.isFinite(p.completedAt)||p.completedAt<0)))throw Error('Dữ liệu sinh vật không hợp lệ.');
 if(!known(s.selectedSpecies)||!integer(s.duration,1,180)||!['rain','stream','ambient'].includes(s.sound)||!Number.isFinite(s.volume)||s.volume<0||s.volume>100)throw Error('Thiết lập bản sao lưu không hợp lệ.');
 if(s.session!==null){const p=s.session;if(!p||typeof p.id!=='string'||!known(p.species)||!integer(p.plot,0,s.plots.length-1)||s.plots[p.plot]!==null||!integer(p.minutes,1,180)||!Number.isFinite(p.startedAt)||p.startedAt<0||p.endsAt!==p.startedAt+p.minutes*60000)throw Error('Phiên tập trung trong file không hợp lệ.');}
 return {state:validState(s),exportedAt:typeof value.exportedAt==='string'&&Number.isFinite(Date.parse(value.exportedAt))?value.exportedAt:null};
}
