# AI STOCK HUNTER VN T+ — V2.0 alpha.1

**JavaScript / Node.js 22+, không dependency bên ngoài.** Bot Telegram AI 1 (notification + long polling), bộ máy phân tích định lượng, sổ danh mục nhập tay và replay thử nghiệm. Đây là bản triển khai nền tảng đầu tiên của Master Plan, **không phải bot đã được kiểm chứng sinh lời hoặc có thể giao dịch thật ngay**. Không có mã nguồn bot cũ được cung cấp, nên đây là project mới, không ghi đè project đang chạy.

## 1. Chạy ngay trên Windows

1. Giải nén ZIP. Cài Node.js 22 LTS hoặc mới hơn từ https://nodejs.org/.
2. Mở PowerShell tại thư mục `ai-stock-hunter`.

```powershell
node -v
npm test
npm run demo
Copy-Item .env.example .env
notepad .env
```

Điền giá trị thật (không dùng `abc`, `-xxx`):

```dotenv
TELEGRAM_BOT_TOKEN=123456789:YOUR_REAL_TOKEN
TELEGRAM_CHAT_ID=-1001234567890
TELEGRAM_ADMIN_IDS=123456789
TZ=Asia/Ho_Chi_Minh
DATA_MODE=demo
```

Token lấy từ BotFather; chat ID là chat/group nhận thông báo; admin ID là user ID Telegram của bạn, khác chat ID. Mời bot vào nhóm, bảo đảm quyền gửi tin và gửi `/start` hoặc `/help` (trong nhóm có thể dùng `/help@tenbot`). Không chia sẻ token, không commit `.env`. Nếu bot đang chạy ở server khác, dừng instance đó trước khi chạy polling; không xóa webhook đang phục vụ hệ thống khác một cách tùy tiện. Bot chỉ chấp nhận command từ chat ID và admin ID đã cấu hình. Tin nhắn gửi về chat đã cấu hình, không nhắn riêng admin.

```powershell
npm start
```

Không cần `npm install` vì dùng Node.js built-in. Có thể dùng `start.cmd` hoặc `demo.cmd` để chạy. `npm run demo` chỉ in console, không kết nối Telegram. `npm start` chạy lịch quét + polling, `/scan` chạy quét thủ công bất cứ lúc nào. Trong demo, tất cả dữ liệu đều giả lập, giờ quét giả lập cố định; không thể ghi lệnh, không phát BUY_ZONE, lưu state riêng `.demo`. Lịch scheduler theo giờ Việt Nam, không phụ thuộc TZ của máy. Ctrl+C để dừng.

## 2. Kết nối dữ liệu chứng khoán thật

Token Telegram **chỉ** dùng gửi/nhận tin nhắn, không cung cấp giá chứng khoán. Chưa có thông tin API dữ liệu của bạn, nên không có adapter riêng của VPS/SSI/TCBS hoàn chỉnh trong alpha này. Không dùng endpoint không công bố, không lấy giá giả làm giá thật.

Ba chế độ:

| DATA_MODE | Nguồn | Hành vi |
|---|---|---|
| demo | Dữ liệu tổng hợp 131 mã có sẵn | Không BUY, không ghi sổ lệnh |
| file | `SNAPSHOT_FILE` chứa JSON chuẩn hóa do bạn cung cấp | Quét dữ liệu thật nếu đầy đủ và đúng thời gian; gate vẫn khóa mặc định |
| http | `MARKET_DATA_URL` trả snapshot chuẩn hóa, Bearer token tùy chọn | Kết nối gateway/provider của bạn; tương tự file |

Đọc **docs/DATA_CONTRACT.md** để xây adapter nguồn. `QUOTE_URL` là endpoint riêng trả quote cho vị thế, dùng GET query `symbols=FPT,VCB`. Nếu không có, guardian chỉ chạy ở các lần scan và báo `RISK_MONITOR_15M_ONLY`. Thực tế luồng scan và guardian dùng cùng tiến trình; scan đang chạy có thể trì hoãn guardian, chưa đạt SLA worker độc lập của Master Plan.

Lịch ngày nghỉ `config/calendar.json` mặc định rỗng, **chưa được xác minh**. Phí mẫu trong `config/policy.json` chưa phải phí VPS thực tế. Để nghiên cứu dữ liệu thật, để `CALENDAR_VERIFIED`, `FEES_VERIFIED`, `STRATEGIES_APPROVED` = false; dữ liệu thật vẫn phân tích được nhưng không đề xuất mua mới. Chỉ chuyển true sau khi đối chiếu lịch, phí, dữ liệu và kiểm chứng strategy riêng. `REVERSAL_ENABLED` tắt mặc định. Không bật đơn thuần để có tín hiệu mua.

Nguồn tham khảo để tích hợp chính thức (không phải nguồn đang kết nối trong project): SSI Developer Portal https://developers.ssi.com.vn/en/docs/api-reference/data-ohlc và https://developers.ssi.com.vn/docs/faq/market-data ; Telegram https://core.telegram.org/bots/api và https://core.telegram.org/bots/faq .

## 3. Lịch chạy / lệnh Telegram

| Giờ | Hoạt động |
|---|---|
| 09:15, 09:30, 09:45…11:30 | Quét sáng; báo cáo đầy đủ 09:30, 11:30 |
| 13:15, 13:30…14:30 | Quét chiều; báo cáo đầy đủ 13:30, 14:00 |
| 14:46, 15:10 | Kiểm tra sau ATC / EOD; không mua mới |
| Mỗi 45 giây | Guardian nếu có quote endpoint và vị thế, trong giờ giao dịch |

Mỗi slot có cửa sổ kích hoạt 2 phút; không chạy bù slot bị lỡ vì máy tắt. Nến daily/weekly/monthly phải là nến đã đóng. Gate `canBuy` chặn giờ nghỉ và ATC. 09:15 cần nguồn tách ATO; hợp đồng dữ liệu yêu cầu chỉ dùng nến continuous đã đóng, không trộn đấu giá. Các phiên khác ngoài HOSE/HNX không mở mua.

| Lệnh | Mục đích |
|---|---|
| `/help`, `/start` | Hướng dẫn |
| `/scan` | Quét ngay, trả bản tin |
| `/status` | Chế độ, thời điểm scan, nguồn quote |
| `/watch`, `/avoid` | Xem danh sách gần nhất |
| `/portfolio` | Sổ danh mục, NAV/cash |
| `/pause`, `/resume` | Khóa/mở entry, không bỏ các hard gate |
| `/buy FPT 100 44000 42500 HOSE` | Ghi nhận lệnh mua đã khớp do người dùng xác nhận, **giá VND** |
| `/available FPT 100` | Xác nhận số lượng đã khả dụng trên broker; không trước T+2 |
| `/sell FPT 100 47000` | Ghi lệnh bán đã khớp, không đặt lệnh |
| `/cash` | Xác nhận các khoản tiền bán đủ T+2 đã về |

Ví dụ giá ở đây hoàn toàn minh họa. Không dùng bot làm nguồn sổ duy nhất, cần đối chiếu broker. Nhập lệnh đúng ngày khớp, theo múi giờ Việt Nam. Alpha chưa hỗ trợ chỉnh lệnh lịch sử, mua bồi, nhập danh mục tồn, nạp/rút, điều chỉnh corporate action, lệnh lô lẻ, ứng trước tiền bán. Lệnh mua ghi sổ chỉ kiểm tra quy tắc tối thiểu và cash, không phải bộ phê duyệt lệnh từ broker. `EXIT` là cảnh báo, không xác nhận bán. `EXIT_PENDING` giữ cờ ngay cả khi giá hồi. Bán không được mô phỏng/ghi trước khi xác nhận số lượng khả dụng. Không nới SL sau khi mua. Chi phí, stress 2 phiên sàn và số lượng là giả thuyết nghiên cứu, không bảo đảm lỗ tối đa.

## 4. Kiến trúc

```text
config/universe.json (131 seed) / policy.json / calendar.json
        ↓
Provider (demo / JSON / HTTP) → Features (D W M 15m, MA20/50, RSI, ATR, RVOL)
        ↓
Market Regime + Sector Rotation → Supply/Demand → Bottom State + S01…S06
        ↓
Quality & Data Gates → Trade Plan (zone/SL/TP/RR) → Joint Risk Allocation
        ↓
Notification + audit + persistent state → Telegram AI 1
        ↑
Position Guardian ← quote / ledger / T+2 / STOP latch
        ↓
Snapshot Replay (experimental) / node:test
```

| File | Mục đích |
|---|---|
| `src/index.js` | Scheduler, polling, command, orchestration, outbox |
| `src/provider.js` | Adapter demo/file/http |
| `src/features.js` | Kiểm tra OHLCV, MA, wick, ATR, RSI, RVOL cùng giờ |
| `src/market.js` | Regime và sức mạnh ngành |
| `src/strategies.js` | Supply/demand, state săn đáy, 6 setup |
| `src/engine.js` | Gate, score, shortlist, tránh mua |
| `src/risk.js` | Tick, no-chase, SL, RR sau phí, sizing |
| `src/portfolio.js` | Ledger, cash/receivable, guardian, exit |
| `src/telegram.js` | Bot API, polling, chat/admin allowlist |
| `src/store.js` | JSON atomic write và audit JSONL |
| `src/backtest.js` | Replay snapshot theo thời điểm |
| `docs/MASTER_PLAN.md` | Master Plan nguyên bản |

## 5. Backtest & kiểm thử

```powershell
npm test
npm run backtest -- data/historical.jsonl
```

Mỗi dòng JSONL là một snapshot đúng hợp đồng, theo thứ tự thời gian tăng dần. Replay xét fill trên quote quan sát tiếp theo, không dùng chính giá đóng tạo tín hiệu; có phí, slippage, cash lock, T+2 và drawdown. Không mô hình hóa order queue, depth, fill từng phần hay biến động giữa hai snapshot; khả dụng mô phỏng bằng lịch + sellable, không phải xác nhận broker. Chưa có dữ liệu lịch sử thật để chạy đánh giá lợi nhuận, chưa có walk-forward/calibration. Dữ liệu historical phải là point-in-time và universe lịch sử đúng thời điểm, không dùng danh sách hiện tại để kết luận hiệu quả lịch sử. `test/core.test.js` chứa bộ test tự động của alpha; 108 case Master Plan là backlog, không phải số test đã thực thi.

## 6. Vận hành & an toàn

Một process / một state file. Không chạy hai instance chung token/state; JSON state chưa có lock liên tiến trình. Outbox lưu trước khi gửi, retry nếu lỗi; nếu crash sau khi Telegram nhận nhưng trước khi lưu trạng thái có thể gửi lại. Không bảo đảm exactly-once. Giữ bản sao `data/state.json` và audit; không xóa state khi có vị thế. Audit có thông tin tài khoản nhập tay, cần bảo mật. Không expose gateway token. Không có đặt lệnh tự động, LLM/AI API hay tự động học online; quyết định là rule-based có giải thích. Khi API lỗi, kiểm tra broker trực tiếp. Không thể bảo đảm khớp SL, đặc biệt khi hàng chờ về, gap hoặc giảm sàn.

## 7. Phần chưa hoàn thành so với Master Plan

Xem `docs/IMPLEMENTATION_STATUS.md`. Đây là bản alpha để kiểm tra luồng đầu-cuối. Các tham số chưa hiệu chỉnh, không cam kết tỷ suất 166,67%/năm. Không sử dụng tín hiệu với tiền thật khi chưa nghiệm thu dữ liệu, quy tắc, backtest và paper trading.
