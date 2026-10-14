declare namespace NodeJS {
  interface ProcessEnv {
    /** Đường dẫn con khi deploy (vd. "/web-game-duck-push"); trống = gốc. */
    readonly NEXT_PUBLIC_BASE_PATH?: string;
    /** Cờ bật đăng nhập Ducker ID — chỉ đúng chuỗi "true" mới bật. */
    readonly NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN?: string;
    readonly NEXT_PUBLIC_DUCKER_ISSUER?: string;
    readonly NEXT_PUBLIC_DUCKER_CLIENT_ID?: string;
    readonly NEXT_PUBLIC_DUCKER_SCOPE?: string;
    readonly NEXT_PUBLIC_DUCKER_PROFILE_PATH?: string;
  }
}
