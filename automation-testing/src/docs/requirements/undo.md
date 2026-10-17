# UNDO — Hoàn tác, làm lại, chơi lại

- **REQ-UNDO-01** Hoàn tác (`Z`, `Ctrl+Z`, nút `Hoàn tác`) lùi đúng một nước; bộ đếm `Bước`/`Đẩy` lùi theo (FR-02, US-02).
- **REQ-UNDO-02** Hoàn tác một cú đẩy trả **cả** thùng lẫn nhân vật về trạng thái trước nước đó — lùi lịch sử, không đi ngược (invariant #13).
- **REQ-UNDO-03** Nút `Hoàn tác` chỉ bấm được khi còn nước để lùi; nút `Làm lại` chỉ bấm được khi còn nước vừa hoàn tác (FR-02).
- **REQ-UNDO-04** Làm lại (`Y`, `Ctrl+Shift+Z`, nút `Làm lại`) đi lại đúng nước vừa hoàn tác, kể cả cú đẩy; đi một nước mới thì nhánh đã hoàn tác mất (FR-02).
- **REQ-UNDO-05** Chơi lại (`R`, nút `Chơi lại`) đưa bàn cờ về đúng trạng thái đầu màn, bộ đếm và đồng hồ về 0 (FR-02, US-02 "Chơi lại… đồng hồ reset").
