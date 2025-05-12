// app/components/navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 相対パスでのインポートに変更
import { getCurrentUser, logout } from "../services/auth";

// TypeScriptの型定義を追加
type User = {
  userId: string;
  userName: string;
} | null;

export default function Navbar() {
  // 型を明示的に指定
  const [user, setUser] = useState<User>(null);
  const router = useRouter();

  // 修正/追加: Toast機能を利用
  const { toast } = useToast();

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
  }, []);

  // 修正/追加: ログアウト処理を行うハンドラー関数
  const handleLogout = () => {
    logout(); // 強化されたlogout関数を呼び出し
    setUser(null);

    // 修正/追加: ログアウト成功通知
    toast({
      title: "ログアウト成功",
      description: "ログアウトしました",
      variant: "default",
    });

    router.push("/login");
  };

  return (
    <nav>
      <div className="flex justify-between items-center">
        <Link href="/">ホーム</Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span>こんにちは、{user.userName}さん</span>
            <Link href="/profile">プロフィール</Link>

            {/* 修正/追加: ログアウトボタン */}
            <button
              onClick={handleLogout}
              className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login">ログイン</Link>
            <Link href="/register">新規登録</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
