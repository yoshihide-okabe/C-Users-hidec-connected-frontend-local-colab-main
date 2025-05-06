"use client";

import type React from "react";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
// ====== getTroubleCategories をインポート ======
import { getTroubleCategories, TroubleCategory } from "@/services/trouble";

interface Project {
  project_id: number;
  title: string;
}

// ====== 修正: Category型をTroubleCategoryに置き換える（不要なので削除） ======
//interface Category {
//  category_id: number;
//  name: string;
//}

export default function CreateTrouble() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    project_id: "",
    category_id: "",
    description: "",
    status: "未解決", // デフォルト値
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<TroubleCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  // ====== 追加: ローディング状態を管理 ======
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ユーザーIDをローカルストレージから取得
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      localStorage.setItem("userId", "1"); // 仮の値
      setUserId(1);
    } else {
      setUserId(Number.parseInt(storedUserId, 10));
    }

    // プロジェクト一覧を取得
    fetchProjects();

    // カテゴリー一覧を取得
    // ====== 修正: fetchCategoriesの代わりにfetchTroubleCategories関数を呼び出す ======
    fetchTroubleCategories();

    // セッションストレージからプロジェクトIDを取得（前画面から遷移した場合）
    const currentProjectId = sessionStorage.getItem("currentProjectId");
    if (currentProjectId) {
      setFormData((prev) => ({
        ...prev,
        project_id: currentProjectId,
      }));
    }
  }, []);

  const fetchProjects = async () => {
    try {
      // ====== 追加: ローディング状態を設定 ======
      setIsLoading(true);

      const token = localStorage.getItem("token");
      // ====== 追加: tokenがない場合のエラーハンドリング ======
      if (!token) {
        throw new Error("認証情報がありません");
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/projects/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        setError("プロジェクトの取得に失敗しました");
      }
    } catch (error) {
      console.error("プロジェクト取得エラー:", error);
      setError("プロジェクトの取得中にエラーが発生しました");

      // ====== 追加: エラー時にモックデータを設定 ======
      setProjects([
        { project_id: 1, title: "オンライン学習プラットフォーム - フクロウ" },
        { project_id: 2, title: "地域コミュニティアプリ - タヌキ" },
        { project_id: 3, title: "健康管理サービス - キツネ" },
      ]);
    } finally {
      // ====== 追加: ローディング状態の終了 ======
      setIsLoading(false);
    }
  };

  // ====== 修正: fetchCategories関数の代わりにfetchTroubleCategories関数を追加 ======
  const fetchTroubleCategories = async () => {
    try {
      setIsLoading(true);
      // 実際のAPIからカテゴリーを取得
      const categoriesData = await getTroubleCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("カテゴリー取得エラー:", error);
      setError("カテゴリーの取得中にエラーが発生しました");

      // エラー時はデフォルトカテゴリーを設定
      setCategories([
        { category_id: 1, name: "技術問題" },
        { category_id: 2, name: "設計・企画" },
        { category_id: 3, name: "UI/UXデザイン" },
        { category_id: 4, name: "コンテンツ制作" },
        { category_id: 5, name: "モバイル開発" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  // ====== ここまで追加 ======

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // 入力検証
    if (
      !formData.project_id ||
      !formData.category_id ||
      !formData.description
    ) {
      setError("必須項目を入力してください");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("認証情報がありません。再ログインしてください");
        router.push("/login");
        return;
      }

      // 新しいエンドポイントを使用
      const response = await fetch(
        "http://localhost:8000/api/v1/troubles/simple?" +
          new URLSearchParams({
            project_id: formData.project_id,
            category_id: formData.category_id,
            description: formData.description,
            status: formData.status || "未解決",
          }),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "お困りごとの登録に失敗しました");
      }

      const data = await response.json();

      // 成功メッセージ
      toast.success("お困りごとが正常に登録されました");

      // ここで現在のプロジェクトIDを保持
      const currentProjectId = formData.project_id;

      // 登録成功後にモーダルを表示する
      setShowModal(true);
    } catch (err) {
      console.error("お困りごと登録エラー:", err);
      setError(
        err instanceof Error
          ? err.message
          : "お困りごとの登録中にエラーが発生しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // モーダルボタン処理を追加
  const handleYes = () => {
    // 現在のプロジェクトIDを保持してフォームだけリセット
    const currentProjectId = formData.project_id;

    setFormData({
      project_id: currentProjectId, // プロジェクトIDは維持
      category_id: "",
      description: "",
      status: "未解決",
    });

    setShowModal(false);
    // 同じページにとどまる（フォームだけリセット）
  };

  const handleNo = () => {
    setShowModal(false);
    router.push("/"); // ホーム画面へ遷移
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">お困りごと登録</h1>
        <p className="text-gray-600">
          プロジェクトに関するお困りごとを登録してください
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border-l-4 border-red-600 mb-6">
          {error}
        </div>
      )}

      {/* ====== 修正: ローディング状態に応じて表示を切り替え ====== */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-lightgreen-600">読み込み中...</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="project_id"
              className="block font-medium text-gray-700"
            >
              プロジェクト <span className="text-red-500">*</span>
            </label>
            <select
              id="project_id"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">-- プロジェクトを選択 --</option>
              {projects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block font-medium text-gray-700"
            >
              お困りごと内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="お困りごとの詳細を入力してください"
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <p className="text-sm text-gray-500">
              ※具体的な問題点や解決したいことを詳しく記載してください
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category_id"
              className="block font-medium text-gray-700"
            >
              お困りごとカテゴリー <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">-- カテゴリーを選択 --</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="block font-medium text-gray-700">
              ステータス
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="未解決">未解決</option>
              <option value="解決">解決</option>
            </select>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "登録中..." : "登録する"}
            </Button>
          </div>
        </form>
      )}

      {/* 成功後のモーダル */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogTitle>登録完了</DialogTitle>

          <div className="text-lg font-medium mb-4">
            もう1件お困りごとを登録しますか？
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleNo}>
              いいえ
            </Button>
            <Button onClick={handleYes}>はい</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
