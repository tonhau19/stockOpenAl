import {readFileSync} from 'node:fs';
const read=name=>JSON.parse(readFileSync(new URL(`../config/${name}.json`,import.meta.url),'utf8'));
export const universe=read('universe'); export const policy=read('policy'); export const calendar=read('calendar');
const bool=k=>process.env[k]==='true';
export const config={mode:process.env.DATA_MODE||'demo', file:process.env.SNAPSHOT_FILE||'data/snapshot.json', url:process.env.MARKET_DATA_URL, token:process.env.MARKET_DATA_TOKEN,quoteUrl:process.env.QUOTE_URL,calendarVerified:bool('CALENDAR_VERIFIED'),feesVerified:bool('FEES_VERIFIED'),approved:bool('STRATEGIES_APPROVED'),reversalEnabled:bool('REVERSAL_ENABLED'),stateFile:process.env.STATE_FILE||'data/state.json',telegramToken:process.env.TELEGRAM_BOT_TOKEN||'',chatId:process.env.TELEGRAM_CHAT_ID||'',admins:(process.env.TELEGRAM_ADMIN_IDS||'').split(',').filter(Boolean),tz:'Asia/Ho_Chi_Minh',port:Number(process.env.PORT||0)};
