# ADR-0006 · Phát hành tự động từ chính commit subject, CI tách ba job

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** NFR-SEC-05 · NFR-PERF-09 · bất biến #17 · ADR-0002

## 1. Bối cảnh

Dự án xuất HTML tĩnh và host trên GitHub Pages (ADR-0002), nên "phát hành" ở đây gồm hai
việc rời nhau: **deploy** trang lên Pages, và **đánh dấu một phiên bản** để sau này còn
biết bản đang chạy là bản nào.

Bốn game anh em trong `web-game/` đã đi qua đường này rồi — `web-game-tetris` là bản chín
nhất, có `ci.yml` + `deploy.yml` + `release.yml` cùng hai script tính phiên bản và soạn
ghi chú phát hành. Không có lý do gì để nghĩ lại từ đầu; câu hỏi thật là **chép được bao
nhiêu và phải sửa chỗ nào**, vì tetris dùng npm + Vite còn dự án này dùng Yarn + Next
static export.

## 2. Quyết định

Chép **nguyên văn** hai script `.github/scripts/next-version.sh` và `release-notes.sh` —
chúng chỉ đọc lịch sử git, không dính gì tới toolchain. Ba workflow viết lại theo Yarn:

- **`ci.yml`** (mỗi pull request) — ba job chạy song song: `verify` (typecheck · lint ·
  unit test · build · in kích thước gzip), `e2e` (Playwright trên bản build tĩnh thật),
  `audit`.
- **`deploy.yml`** (push vào `main`) — typecheck · test · build với `GITHUB_PAGES=true` ·
  đẩy lên Pages. **Không chạy e2e**: commit merge mang đúng cây mà pull request đã kiểm.
- **`release.yml`** (push vào `main`) — tính phiên bản từ commit subject, chạy lại toàn bộ
  kiểm chứng, rồi tạo tag và GitHub Release với ghi chú soạn từ chính các subject đó.

Phiên bản suy ra từ Conventional Commits trên khoảng từ tag trước: `feat:` → minor, còn
lại → patch, `type!:` hoặc footer `BREAKING CHANGE` → theo quy tắc 0.x. Ba dấu tay
`[release minor]` / `[release major]` / `[skip release]` chỉ được đọc **trong subject của
commit HEAD**.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| `gh release create --generate-notes` | Nó liệt kê **pull request đã merge**. Một push gồm các commit trực tiếp sẽ ra ghi chú rỗng, chỉ còn cái link so sánh. Soạn từ commit subject thì đúng trong cả hai trường hợp, và dùng đúng dữ liệu đã dùng để tính số phiên bản — nên số và ghi chú không bao giờ nói khác nhau |
| `semantic-release` / `changesets` | Kéo về cả một cây dependency và một tệp cấu hình để làm đúng việc mà 60 dòng bash đang làm, trong một repo không publish package nào |
| Đọc dấu `[release major]` cả trong thân commit | Thân commit ở dự án này viết dài và **bàn về chính chuyện phát hành**. Đọc cả thân thì viết về một bump major sẽ tạo ra một bump major |
| `yarn audit --level high` để tự gác cổng | Yarn 1 lọc **cái được in**, không lọc **mã thoát** — mã thoát là bitmask cộng mọi mức. Một advisory mức moderate trong một dev tool sẽ chặn mọi pull request. Phải đọc `auditSummary` từ đầu ra JSON mới gác đúng mức high trở lên |
| Gộp audit vào job `verify` | Audit gọi ra registry và không cần `node_modules`; để nó đứng trước test là bắt test xếp hàng sau mạng của người khác |
| Chạy e2e cả ở `deploy.yml` | Nhân đôi job chậm nhất để chứng minh lại đúng cái cây mà CI vừa chứng minh |
| Gác cứng ngưỡng 200KB trong CI | Pack màn đã code-split theo bậc, nên con số đáng nhìn là cụm chunk dùng chung. In ra thì thấy được; gác cứng chỉ nổ đúng vào lúc log này đã nói rồi |

## 4. Hệ quả

**Được:**
- Mỗi push vào `main` tự có một bản phát hành đọc được, không ai phải nhớ viết changelog.
- Số phiên bản và ghi chú sinh từ cùng một nguồn nên không thể lệch nhau.
- Cả hai script chạy được ở máy (`bash .github/scripts/next-version.sh`), nên xem trước
  được một bản phát hành sẽ nói gì **trước khi** nó nói.
- Bộ e2e và bộ kiểm pack chạy ở nơi chúng chặn được merge, không phải sau khi merge.

**Mất / phải chấp nhận:**
- **Commit message trở thành phần của sản phẩm.** Một subject không theo Conventional
  Commits sẽ rơi vào mục "Other" của ghi chú và chỉ tạo ra bump patch.
- CI chậm hơn hẳn các game anh em vì bộ kiểm pack chạy lại solver trên 65 màn. Đó là cái
  giá của bất biến #17, và là cái giá đã chọn.
- GitHub Pages vẫn phải bật **một lần bằng tay** cho repo — `configure-pages` không làm
  thay được, vì `GITHUB_TOKEN` không có quyền tạo site.
- Registry sập thì job audit **báo cảnh báo và pass**. Đổi lại là không bị chặn merge vì
  sự cố của người khác; advisory thật vẫn làm đỏ job.

**Điều kiện xem lại:** nếu repo bắt đầu publish package, hoặc nếu số commit mỗi bản phát
hành lớn tới mức ghi chú theo subject không còn đọc nổi.
