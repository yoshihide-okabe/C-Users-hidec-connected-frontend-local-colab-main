// services/auth.ts
import axios from "axios";

// API URLの設定
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ログイン用インターフェース
export interface LoginCredentials {
  username: string;
  password: string;
}

// ユーザー登録用インターフェース
export interface RegisterData {
  name: string;
  password: string;
  confirm_password: string;
  categories: string[];
}

// ユーザー情報更新用インターフェース
export interface UpdateUserData {
  name?: string;
  password?: string;
  confirm_password?: string;
  categories?: string[];
}

// レスポンスデータの型
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  user_name: string;
}

// ダミーユーザーデータ
const dummyUsers = [
  { username: "鈴木太郎", password: "password1", id: 1 },
  { username: "佐藤花子", password: "password2", id: 2 },
  { username: "田中誠", password: "password3", id: 3 },
  { username: "山田優子", password: "password4", id: 4 },
  { username: "伊藤健太", password: "password5", id: 5 },
];

// ダミーのログイン関数
export const login = async (credentials: LoginCredentials): Promise<void> => {
  try {
    console.log("ダミー認証: ログイン試行", credentials);

    // 1秒の遅延を追加してAPIコールを模倣
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 入力値の検証 - 改善点1: 基本的なバリデーションを追加
    if (!credentials.username.trim()) {
      throw new Error("ユーザー名を入力してください");
    }

    if (!credentials.password.trim()) {
      throw new Error("パスワードを入力してください");
    }

    // ダミーユーザーデータから認証
    const user = dummyUsers.find(
      (u) =>
        u.username === credentials.username &&
        u.password === credentials.password
    );

    if (!user) {
      console.error("認証失敗: ユーザーまたはパスワードが不正");
      throw new Error("ユーザー名またはパスワードが無効です");
    }

    // 認証成功
    console.log("ダミー認証成功:", user);

    // 模擬トークンの生成
    const mockToken = `dummy-token-${Math.random().toString(36).substring(2)}`;

    // ローカルストレージに認証情報を保存
    localStorage.setItem("token", mockToken);
    localStorage.setItem("userId", String(user.id));
    localStorage.setItem("userName", user.username);
    localStorage.setItem("isLoggedIn", "true");
  } catch (error: any) {
    // 改善点3: 型指定の追加
    console.error("Login error:", error);
    // 改善点4: エラーオブジェクトをそのまま渡す（message プロパティを保持）
    throw error;
  }
};

// ダミーのユーザー登録関数
export const register = async (data: RegisterData): Promise<void> => {
  try {
    console.log("ダミー認証: ユーザー登録", data);

    // 1.5秒の遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 改善点5: 入力値の検証を追加
    if (!data.name.trim()) {
      throw new Error("ユーザー名を入力してください");
    }

    if (!data.password.trim()) {
      throw new Error("パスワードを入力してください");
    }

    if (!data.confirm_password.trim()) {
      throw new Error("確認用パスワードを入力してください");
    }

    // パスワード確認チェック
    if (data.password !== data.confirm_password) {
      throw new Error("パスワードが一致しません");
    }

    // ユーザー名の重複チェック
    if (dummyUsers.some((user) => user.username === data.name)) {
      throw new Error("このユーザー名は既に使用されています");
    }

    // 新規ユーザーID
    const newId = Math.max(...dummyUsers.map((u) => u.id)) + 1;

    // ダミーユーザーリストに追加（実際はメモリ内のみ）
    dummyUsers.push({
      username: data.name,
      password: data.password,
      id: newId,
    });

    // 模擬トークンの生成
    const mockToken = `dummy-token-${Math.random().toString(36).substring(2)}`;

    // ローカルストレージに認証情報を保存
    localStorage.setItem("token", mockToken);
    localStorage.setItem("userId", String(newId));
    localStorage.setItem("userName", data.name);
    localStorage.setItem("isLoggedIn", "true");
  } catch (error: any) {
    // 改善点6: 型指定の追加
    console.error("Registration error:", error);
    throw error;
  }
};

// ダミーのユーザー情報更新関数
export const updateUserInfo = async (data: UpdateUserData): Promise<void> => {
  try {
    console.log("ダミー認証: ユーザー情報更新", data);

    // 1秒の遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("認証情報がありません。再度ログインしてください。");
    }

    const userIndex = dummyUsers.findIndex((u) => u.id === parseInt(userId));
    if (userIndex === -1) {
      throw new Error("ユーザーが見つかりません");
    }

    // 名前の更新
    if (data.name) {
      // 改善点7: 名前が空でないことを確認
      if (!data.name.trim()) {
        throw new Error("ユーザー名を入力してください");
      }

      // 改善点8: 重複チェック
      if (
        dummyUsers.some(
          (user) => user.username === data.name && user.id !== parseInt(userId)
        )
      ) {
        throw new Error("このユーザー名は既に使用されています");
      }

      dummyUsers[userIndex].username = data.name;
      localStorage.setItem("userName", data.name);
    }

    // パスワードの更新
    if (data.password && data.confirm_password) {
      // 改善点9: 空でないことを確認
      if (!data.password.trim()) {
        throw new Error("パスワードを入力してください");
      }

      if (!data.confirm_password.trim()) {
        throw new Error("確認用パスワードを入力してください");
      }

      if (data.password !== data.confirm_password) {
        throw new Error("パスワードが一致しません");
      }
      dummyUsers[userIndex].password = data.password;
    }
  } catch (error: any) {
    // 改善点10: 型指定の追加
    console.error("Update user error:", error);
    throw error;
  }
};

// トークンからユーザー情報を取得
export const getCurrentUser = (): {
  userId: string;
  userName: string;
} | null => {
  if (typeof window === "undefined") {
    return null; // サーバーサイドレンダリング時は null を返す
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  if (token && userId && userName) {
    return { userId, userName };
  }

  return null;
};

// ログアウト関数
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("isLoggedIn");

  // 修正/追加: プロジェクト関連のデータクリア
  localStorage.removeItem("selectedProjectId");
  localStorage.removeItem("selectedProjectTitle");
  localStorage.removeItem("selectedProjectDescription");
  localStorage.removeItem("selectedProjectOwner");
  localStorage.removeItem("selectedProjectCategory");

  // 修正/追加: お困りごと関連のデータクリア
  localStorage.removeItem("selectedTroubleId");
  localStorage.removeItem("selectedTroubleDescription");
  localStorage.removeItem("selectedTroubleStatus");
  localStorage.removeItem("selectedTroubleCategory");

  // 修正/追加: ユーザー情報のクリア
  localStorage.removeItem("currentUserId");
  localStorage.removeItem("currentUserName");

  // 修正/追加: その他のアプリケーション固有のデータクリア
  // アプリケーション内で使用している他のストレージアイテムがあれば追加

  // 修正/追加: セッションストレージもクリア
  sessionStorage.clear();

  // 注: localStorage.clear()は他のアプリのデータも消す可能性があるため使用しない
  console.log(
    "ログアウト処理完了: すべてのローカルストレージデータをクリアしました"
  );
};
