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

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
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
            <button onClick={handleLogout}>ログアウト</button>
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