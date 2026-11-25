# Normalized market snapshot v0.1

Nguồn được phép sử dụng phải chuẩn hóa snapshot trước khi đưa vào bot. Đừng gửi token vào URL query. Giá cổ phiếu VND/cp, index điểm, volume cổ phiếu, matchedValue VND. Tất cả timestamp ISO 8601 có offset hoặc Z. `asOf` là thời điểm dữ liệu được biết, không phải thời điểm máy đọc file. Snapshot thật phải cập nhật thường xuyên; không sửa timestamp để qua stale gate. `final` nghĩa là snapshot/slot đã hoàn thành (không đồng nghĩa ngày đã đóng), `realtime` phải đúng theo entitlement và độ trễ thực tế. `source` là tên feed thực. Dữ liệu demo không được đổi nhãn thành dữ liệu thật.

Cấu trúc (rút gọn, **không đủ lịch sử để qua validation**):

```json
{
  "asOf": "2026-11-25T09:30:10+07:00",
  "source": "licensed-provider-name",
  "realtime": true,
  "final": true,
  "market": {
    "daily": [{"time":"2026-11-24T15:00:00+07:00","open":1500,"high":1510,"low":1490,"close":1505,"volume":500000000,"closed":true}],
    "price": 1510,
    "matchedValue": 3100000000000,
    "foreignNet": -210000000000,
    "negotiatedValue": 240000000000,
    "liquidityRatio": 1.08
  },
  "stocks": {
    "FPT": {
      "meta": {"exchange":"HOSE","securityType":"STOCK","status":"NORMAL","verified":true,"materialRisk":false,"qualityScore":80,"qualityCoverage":1,"marketCap":100000000000000,"cluster":"technology","asOf":"2026-11-25T09:25:00+07:00","source":"licensed-provider / reviewed evidence"},
      "daily": [{"time":"2026-11-24T15:00:00+07:00","open":44000,"high":44500,"low":43500,"close":44200,"volume":1500000,"matchedValue":66000000000,"closed":true}],
      "weekly": [],
      "monthly": [],
      "intraday": [{"time":"2026-11-25T09:30:00+07:00","open":44200,"high":44400,"low":44100,"close":44300,"volume":50000,"closed":true}],
      "quote": {"price":44300,"time":"2026-11-25T09:30:09+07:00","spread":0.002,"sellable":true}
    }
  }
}
```

Yêu cầu: daily 120+ nến đóng, weekly 60+, monthly 12+, intraday 30+ nhưng nên đủ 20 phiên cùng slot (RVOL cần tối thiểu 10 mẫu trước đó). Timestamps tăng dần, không duplicate, không future. Nến daily `matchedValue` là GT **khớp**, không gồm thỏa thuận. `market.liquidityRatio` do gateway tính GT lũy kế / median GT lũy kế cùng mốc của 20 phiên trước. `foreignNet` và `negotiatedValue` nullable; không tự điền 0 khi thiếu. Meta `verified` là xác nhận có bằng chứng; metadata snapshot mới trong 24h có thể tham chiếu báo cáo tài chính cũ còn hiệu lực. Không tự điền qualityScore=80 cho mọi mã thật. `quote.sellable` phải được nguồn xác thực có đối ứng, không có nghĩa vị thế đã khả dụng. spread là (ask-bid)/mid, số thập phân. Cần lưu adjusted historical và reconcile về cùng thang giá thực tại asOf trước khi đưa vào alpha; bot chưa có adjustment engine, không hỗ trợ lịch sử có corporate action chưa reconcile.

Danh sách seed không phải security master. Provider cung cấp đủ mã trong config; khi loại mã, duyệt thay đổi universe và lưu version theo ngày. Không trộn ATO/ATC/thỏa thuận vào bar continuous. Tại 14:46, dùng daily/intraday đã xác nhận và quote đóng cửa; nếu chưa có dữ liệu final, đặt `final:false` hoặc không trả snapshot mới. Không có dữ liệu slot thì không forward-fill. Không dùng bar D/W/M chưa hoàn thành.

Quote endpoint: GET `QUOTE_URL?symbols=FPT,VCB` trả `{"FPT":{"price":44300,"time":"2026-11-25T09:30:09+07:00","spread":0.002,"sellable":true}}`. Chỉ đọc dữ liệu, không đặt lệnh. Nguồn HTTP được gọi tối đa một lần mỗi scan (timeout 25s); gateway chịu trách nhiệm cache, rate limits, entitlement, retry, source provenance. Không tích hợp broker API thật trong alpha.

Để tạo file dữ liệu giả lập kiểm thử contract:

```bash
node examples/export-demo.js
```

File tạo ra chỉ dùng thử offline. Snapshot ghi `SYNTHETIC_DEMO`, `realtime:false`.
