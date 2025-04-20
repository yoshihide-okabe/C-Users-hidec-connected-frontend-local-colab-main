// services/auth.ts
import axios from 'axios';

// API URLの設定
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  { username: '鈴木太郎', password: 'password1', id: 1 },
  { username: '佐藤花子', password: 'password2', id: 2 },
  { username: '田中誠', password: 'password3', id: 3 },
  { username: '山田優子', password: 'password4', id: 4 },
  { username: '伊藤健太', password: 'password5', id: 5 }
];

// ダミーのログイン関数
export const login = async (credentials: LoginCredentials): Promise<void> => {
  try {
    console.log("ダミー認証: ログイン試行", credentials);
    
    // 1秒の遅延を追加してAPIコールを模倣
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // ダミーユーザーデータから認証
    const user = dummyUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
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
    localStorage.setItem('token', mockToken);
    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('userName', user.username);
    localStorage.setItem('isLoggedIn', 'true');
    
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// ダミーのユーザー登録関数
export const register = async (data: RegisterData): Promise<void> => {
  try {
    console.log("ダミー認証: ユーザー登録", data);
    
    // 1.5秒の遅延を追加
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // パスワード確認チェック
    if (data.password !== data.confirm_password) {
      throw new Error("パスワードが一致しません");
    }
    
    // ユーザー名の重複チェック
    if (dummyUsers.some(user => user.username === data.name)) {
      throw new Error("このユーザー名は既に使用されています");
    }
    
    // 新規ユーザーID
    const newId = Math.max(...dummyUsers.map(u => u.id)) + 1;
    
    // ダミーユーザーリストに追加（実際はメモリ内のみ）
    dummyUsers.push({
      username: data.name,
      password: data.password,
      id: newId
    });
    
    // 模擬トークンの生成
    const mockToken = `dummy-token-${Math.random().toString(36).substring(2)}`;
    
    // ローカルストレージに認証情報を保存
    localStorage.setItem('token', mockToken);
    localStorage.setItem('userId', String(newId));
    localStorage.setItem('userName', data.name);
    localStorage.setItem('isLoggedIn', 'true');
    
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// ダミーのユーザー情報更新関数
export const updateUserInfo = async (data: UpdateUserData): Promise<void> => {
  try {
    console.log("ダミー認証: ユーザー情報更新", data);
    
    // 1秒の遅延を追加
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('認証情報がありません。再度ログインしてください。');
    }
    
    const userIndex = dummyUsers.findIndex(u => u.id === parseInt(userId));
    if (userIndex === -1) {
      throw new Error('ユーザーが見つかりません');
    }
    
    // 名前の更新
    if (data.name) {
      dummyUsers[userIndex].username = data.name;
      localStorage.setItem('userName', data.name);
    }
    
    // パスワードの更新
    if (data.password && data.confirm_password) {
      if (data.password !== data.confirm_password) {
        throw new Error("パスワードが一致しません");
      }
      dummyUsers[userIndex].password = data.password;
    }
    
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

// トークンからユーザー情報を取得
export const getCurrentUser = (): { userId: string; userName: string } | null => {
  if (typeof window === 'undefined') {
    return null; // サーバーサイドレンダリング時は null を返す
  }
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  
  if (token && userId && userName) {
    return { userId, userName };
  }
  
  return null;
};

// ログアウト関数
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('isLoggedIn');
};