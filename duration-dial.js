// Clockwise 270° sweep: lower-left → top → lower-right.
export function minutesFromPoint(x,y,cx,cy){
 const angle=(Math.atan2(x-cx,cy-y)*180/Math.PI+360)%360;
 const sweep=(angle-225+360)%360;
 return Math.round((sweep<=270?sweep:sweep<315?270:0)/270*60);
}
export function dialPosition(minutes){const angle=(225+Math.max(0,Math.min(60,minutes))/60*270)*Math.PI/180;return {x:50+Math.sin(angle)*43.333333,y:50-Math.cos(angle)*43.333333};}
