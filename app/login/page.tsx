"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { login } from "@/services/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // バックエンドAPIを使用した認証
      await login({ username, password });

      // ログイン成功後、ホームページにリダイレクト
      router.push("/");
    } catch (error: any) {
      // エラーメッセージの表示
      if (error.response?.status === 401) {
        setError("無効なユーザー名またはパスワード");
      } else {
        setError(
          "ログイン中にエラーが発生しました。後でもう一度お試しください。"
        );
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between bg-gradient-to-b from-lightgreen-50 to-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-lightgreen-200 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-lightgreen-800">ログイン</h1>
      </header>

      {/* メイン */}
      <main className="flex flex-col items-center justify-start px-4 pt-16 flex-1">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-lightgreen-200 p-6">
          <h2 className="text-xl font-semibold text-lightgreen-800 mb-4 text-center">
            ログイン
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm text-lightgreen-700 mb-1"
              >
                ユーザー名
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-3 py-2 border border-lightgreen-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightgreen-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-lightgreen-700 mb-1"
              >
                パスワード
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-lightgreen-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightgreen-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-lightgreen-500 hover:bg-lightgreen-600 text-white font-semibold rounded-full shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-lightgreen-700">
              アカウントをお持ちでない方はこちら
            </p>
            <Button
              variant="outline"
              className="mt-2 border-lightgreen-300 text-lightgreen-700 hover:bg-lightgreen-100 w-full rounded-full"
              onClick={() => router.push("/register")}
              disabled={isLoading}
            >
              新規登録
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
