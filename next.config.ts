import type { NextConfig } from "next";

/**
 * GitHub Pages phục vụ trang ở đường dẫn con /<tên-repo>, còn khi chạy ở máy thì ở
 * gốc. Đường dẫn đó đến từ NEXT_PUBLIC_BASE_PATH (chỉ workflow deploy đặt); để
 * trống nghĩa là gốc. Cùng biến này cũng là nguồn của redirect_uri đăng nhập
 * Ducker ID, nên không có bản sao hardcode nào ở đây.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : undefined;

const nextConfig: NextConfig = {
  /** Game chạy hoàn toàn phía client nên xuất được ra HTML tĩnh — không cần máy chủ Node. */
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true }
};

export default nextConfig;
