# Implementation status — alpha.1

Đã triển khai: 131 seed, data adapter interface, demo fixture, lịch quét/polling, data validation cơ bản, MA20/50/ATR/RSI (RSI simple-window), RVOL cùng thời điểm, phân tích ngành/regime, rule cung cầu, bottom watch B0/B1/B2/B3/B4/B5/B7, các biến thể đơn giản S01–S06, S07 watch, RS dùng rank/ngành, S09 chưa bật, quality gate (đọc metadata bên ngoài), shortlist/avoid, RR/size/fee/stress, manual ledger/T+2, quote guardian, SL latch, time-stop/trailing cơ bản, audit/outbox, snapshot replay và unit tests.

Một số quy tắc là bản đơn giản hóa, **không tương đương đầy đủ Master Plan**:

- Không có API vendor thực tế/credential, gateway cần viết theo data contract. Không xác minh 131 mã hiện đang niêm yết hay quality. Calendar rỗng, fee mẫu. Không kiểm chứng thông tin pháp lý/doanh nghiệp, VN30 membership, event feed và fundamental scoring nội bộ.
- Daily/weekly/monthly do nguồn cung cấp. Chưa aggregate theo lịch chính thức, chưa corporate action engine, chưa kiểm đầy đủ lịch nến intraday, gap/auction, tick và adjustment provenance. RSI simple-window chưa phải Wilder smoothing; ATR simple mean. Market regime chưa hysteresis đầy đủ hoặc concentration, sector chưa correlation rolling. Ngưỡng score heuristic, không xác suất.
- S01–S06 là phiên bản seed: chưa có đầy đủ lịch sử base/retest 1–5 phiên hoặc pivot swing xác nhận, market recovery nhiều nến, time-stop theo từng strategy. Bottom state chưa có B6/đủ expiry theo phiên; chỉ tiến khi có bar mới, chưa replay toàn bộ nến bị bỏ lỡ. S08 chưa là layer riêng. S09 research-only chưa code.
- Không có quản lý reservation/TTL xuyên scan hoặc CANCEL_BUY event đầy đủ; shortlist là đề xuất tại thời điểm scan, không phải lệnh đang treo; khi thao tác phải quét lại. Exit PROTECT chưa giảm vị thế tự động, trail đơn giản, không tự sell. Guardian dùng chung event loop, scan dài có thể trì hoãn. Không có broker reconciliation, portfolio import, corporate action, deposit/withdraw. Cash receipt confirmation nhập tay. Stress là kịch bản 2 lần giảm sàn, không phải worst case.
- Dữ liệu/metadata đầy đủ phụ thuộc gateway; chưa có kiểm chứng tính chính xác nguồn. `CALENDAR_VERIFIED`, `FEES_VERIFIED`, `STRATEGIES_APPROVED` mặc định false. Reversal default disabled. Không bật cờ trên tiền thật nếu chưa nghiệm thu.
- Replay chỉ là simulator thử nghiệm; chưa đầy đủ orderbook/queue, next-bar fill uncertainty, point-in-time universe, walk-forward, paper trading dài hạn, kiểm chứng hiệu suất. Không có kết quả backtest thị trường thật.
- JSON local store, chưa DB/locking/recovery đa process, chưa webhook, dashboard web, container deployment, alert monitoring độc lập, secret manager hay kiểm thử Telegram bằng token thật. Bot chỉ rule-based, không có LLM hay tự huấn luyện. Không quảng cáo như AI đã thay thế toàn bộ chuyên gia.

## Roadmap tiếp theo

1. Chọn nhà cung cấp dữ liệu, hợp đồng quyền sử dụng, cài adapter thực tế, kiểm tra chéo giá/volume 15m và dữ liệu doanh nghiệp.
2. Hoàn thiện chuẩn session/holiday/corporate actions, timestamps, feed health và snapshot point-in-time; tích hợp broker read-only/ledger reconcile.
3. Hoàn thiện từng chiến lược theo MASTER_PLAN, state transitions, reservation/TTL/cancel, exit engine và position worker độc lập. Mở rộng test tới 108+ trường hợp trong plan.
4. Backtest walk-forward, kiểm chứng theo từng regime, phí, gap, T+2; paper trading; review độc lập. Chỉ khi đạt tiêu chuẩn mới xem xét bật cờ chiến lược.
5. Cải tiến notification, dashboard, DB, quản trị phiên bản và rollback. Không tự thay đổi rule theo vài giao dịch.
