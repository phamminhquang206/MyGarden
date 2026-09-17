import {deflateSync} from 'node:zlib';
import {writeFileSync} from 'node:fs';
function crc(b){let c=0xffffffff;for(const x of b){c^=x;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([len,t,data,sum]);}
function render(size){const pixels=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++){for(let x=0;x<size;x++){const u=x/size*512,v=y/size*512;let color=[55,125,112];if((u-256)**2+(v-256)**2<175**2)color=[68,137,121];if(((u-256)/130)**2+((v-365)/37)**2<1)color=[180,199,125];if(u>243&&u<269&&v>260&&v<366)color=[118,94,64];const upper=v>=100&&v<=221&&Math.abs(u-256)<(v-100)*84/121;const lower=v>=200&&v<=320&&Math.abs(u-256)<(v-160)*116/160;if(upper||lower)color=u<256?[213,233,167]:[167,198,122];const i=y*(size*4+1)+1+x*4;pixels[i]=color[0];pixels[i+1]=color[1];pixels[i+2]=color[2];pixels[i+3]=255;}}const h=Buffer.alloc(13);h.writeUInt32BE(size);h.writeUInt32BE(size,4);h[8]=8;h[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);}
writeFileSync(new URL('../icons/icon-192.png',import.meta.url),render(192));
writeFileSync(new URL('../icons/icon-512.png',import.meta.url),render(512));
writeFileSync(new URL('../icons/icon-maskable-512.png',import.meta.url),render(512));
