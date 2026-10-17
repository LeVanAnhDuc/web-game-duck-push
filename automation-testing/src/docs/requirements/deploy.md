# DEPLOY — Bản xuất tĩnh và base path của GitHub Pages

- **REQ-DEPLOY-01** Bản xuất tĩnh tải đủ mọi tài nguyên của trang chủ, các pack màn và màn chơi — không request nào lỗi hay trả ≥ 400 (ADR-0002).
- **REQ-DEPLOY-02** Mọi request của site nằm dưới base path của nó (`/` ở dev, `/web-game-duck-push/` trên GitHub Pages) — không tài nguyên nào trỏ về gốc domain (ADR-0002, `NEXT_PUBLIC_BASE_PATH`).
