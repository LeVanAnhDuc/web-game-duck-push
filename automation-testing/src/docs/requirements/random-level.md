# RANDOMLEVEL — Màn ngẫu nhiên và seed trên đường dẫn

- **REQ-RANDOMLEVEL-01** Nút `Màn ngẫu nhiên · <bậc>` sinh một màn mới đúng bậc đang chọn, mở thẳng vào màn đó kèm số đẩy tối ưu (FR-08, US-03).
- **REQ-RANDOMLEVEL-02** Seed của màn nằm trên URL (`?seed=<n>&d=<bậc>`) và trên dòng phụ (`<bậc> · Seed <n>`), hai con số khớp nhau (FR-11, ux-feedback F-06).
- **REQ-RANDOMLEVEL-03** Mở lại đúng đường dẫn đó ở máy khác cho ra **đúng màn đó**; seed giống nhưng bậc khác là màn khác (FR-11, US-03).
- **REQ-RANDOMLEVEL-04** Seed hỏng trên đường dẫn → về trang chủ kèm lời nhắn đọc được, không nổ trắng trang (US-03 "Điều gì có thể sai", NFR-SEC-07).
- **REQ-RANDOMLEVEL-05** Sinh màn không bao giờ chạy trên luồng chính: chạy trong Web Worker, trang vẫn trả lời trong lúc sinh (NFR-PERF-08).
- **REQ-RANDOMLEVEL-06** Sinh một màn xong trong trần cứng 2,5 giây ở mọi bậc; không có trạng thái chờ vô hạn (NFR-PERF-06, NFR-REL-03).
- **REQ-RANDOMLEVEL-07** Trình duyệt không có Worker vẫn sinh được màn (đường lui) (US-03 "Điều gì có thể sai").
- **REQ-RANDOMLEVEL-08** Trong lúc sinh, nút hiện trạng thái chờ `Đang sinh màn…` (FR-08 "có trạng thái chờ").
