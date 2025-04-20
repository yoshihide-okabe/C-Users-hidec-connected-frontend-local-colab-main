// services/auth.js
export async function login({ username, password }) {
  try {
    // まず変数の中身をログで確認
    console.log("ログイン試行:", { username, password });

    // 変数が正しく渡されていることを確認
    if (!username || !password) {
      throw new Error("ユーザー名とパスワードは必須です");
    }

    // クエリパラメータとしてユーザー名とパスワードを送信
    const url = `http://localhost:8000/api/v1/auth/login?username=${encodeURIComponent(
      username
    )}&password=${encodeURIComponent(password)}`;

    console.log(
      "リクエストURL（パスワードは伏せています）:",
      url.replace(password, "********")
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // ボディは空でもOK（またはクエリに含まれていない追加データがあれば含める）
      // body: JSON.stringify({ /* 他に必要なデータがあればここに */ }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("サーバーからのエラーレスポンス:", errorText);

      try {
        const errorJson = JSON.parse(errorText);
        console.error("エラー詳細:", errorJson);
      } catch (e) {
        // JSONでない場合はそのまま表示
      }

      throw new Error("ログインに失敗しました");
    }

    // レスポンスのJSONを取得
    const data = await response.json();

    // ここからトークン保存処理を追加 -------
    console.log("ログイン成功:", data);

    // トークンとユーザー情報をローカルストレージに保存
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
    }

    if (data.user_id) {
      localStorage.setItem("userId", data.user_id.toString());
    }

    if (data.user_name) {
      localStorage.setItem("userName", data.user_name);
    }
    // トークン保存処理追加ここまで -------

    return data;
  } catch (error) {
    console.error("ログインエラー:", error);
    throw error;
  }
}

// 以下の関数も追加 -------
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function getCurrentUserId() {
  return localStorage.getItem("userId");
}
// 追加ここまで -------

export async function register({
  name,
  password,
  confirm_password,
  categories,
}) {
  try {
    // 変数の検証
    if (!name || !password || !confirm_password) {
      throw new Error("名前とパスワードは必須です");
    }

    if (password !== confirm_password) {
      throw new Error("パスワードが一致しません");
    }

    const response = await fetch("http://localhost:8000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        password,
        confirm_password,
        categories: categories || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("サーバーからのエラーレスポンス:", errorText);

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          throw new Error(`登録エラー: ${JSON.stringify(errorJson.detail)}`);
        }
      } catch (e) {
        // JSONでない場合や他のエラー処理
      }

      throw new Error("ユーザー登録に失敗しました");
    }

    // レスポンスのJSONを取得
    const data = await response.json();

    // 登録成功後もトークンを保存 -------
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
    }

    if (data.user_id) {
      localStorage.setItem("userId", data.user_id.toString());
    }

    if (data.user_name) {
      localStorage.setItem("userName", data.user_name);
    }
    // ここまで追加 -------

    return await response.json();
  } catch (error) {
    console.error("登録エラー:", error);
    throw error;
  }
}
