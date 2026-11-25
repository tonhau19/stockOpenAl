import {calendar} from './config.js';
export const slots=['09:15','09:30','09:45','10:00','10:15','10:30','10:45','11:00','11:15','11:30','13:15','13:30','13:45','14:00','14:15','14:30','14:46','15:10'];
export const mainSlots=new Set(['09:30','11:30','13:30','14:00','14:46','15:10']);
export const local=(d=new Date())=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).map(x=>[x.type,x.value]));return {date:`${p.year}-${p.month}-${p.day}`,hm:`${p.hour}:${p.minute}`};};
export const isTradingDay=(date,cal=calendar)=>cal.extraTradingDays.includes(date)||(!cal.holidays.includes(date)&&![0,6].includes(new Date(date+'T12:00:00Z').getUTCDay()));
export const addDays=(date,n)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
export function settlement(date,cal=calendar){let n=0;while(n<2){date=addDays(date,1);if(isTradingDay(date,cal))n++;}return date+'T13:00:00+07:00';}
export function sessionCount(from,to,cal=calendar){let n=0;for(let d=from;d<to;){d=addDays(d,1);if(isTradingDay(d,cal))n++;}return n;}
export const canBuy=(d,cal=calendar)=>{const {date,hm}=local(d);return isTradingDay(date,cal)&&((hm>='09:15'&&hm<'11:30')||(hm>='13:00'&&hm<'14:30'));};
export const canMonitor=d=>{const {date,hm}=local(d);return isTradingDay(date)&&((hm>='09:00'&&hm<='11:30')||(hm>='13:00'&&hm<='14:46'));};
export const dueSlot=d=>{const {date,hm}=local(d);if(!isTradingDay(date))return null;const m=s=>Number(s.slice(0,2))*60+Number(s.slice(3));return slots.find(s=>m(hm)>=m(s)&&m(hm)-m(s)<2)||null;};
