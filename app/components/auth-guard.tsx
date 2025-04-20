// app/components/auth-guard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../services/auth";

export default function AuthGuard({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
  
    useEffect(() => {
      // ここで認証チェック用の処理を実行
      // 例）axiosで /api/auth/me を叩いて、認証済かどうかを確認
      // 認証されていれば setIsAuthorized(true)、
      // されていなければ router.push("/login");
      (async () => {
        try {
          // ここで実際にaxiosを使うならこんなイメージ
          // const { data } = await axios.get("/api/auth/me");
          // if (data.ok) {
          //   setIsAuthorized(true);
          // } else {
          //   router.push("/login");
          // }
          
          // 仮の認証チェック
          setIsAuthorized(true);
        } catch (error) {
          router.push("/login");
        }
      })();
    }, [router]);
  
    // 認証がまだ完了していない間はローディング表示やスピナーなどを出す
    if (!isAuthorized) {
      return <>ローディング中…</>;
    }
  
    // 認証OKなら子コンポーネントを描画
    return <>{children}</>;
  }