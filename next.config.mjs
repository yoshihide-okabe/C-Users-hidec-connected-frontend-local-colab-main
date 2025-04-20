let userConfig = undefined;
try {
  //userConfig = await import("./v0-user-next.config");
  // 修正点1: モジュールがデフォルトエクスポートを持っている場合は、そのデフォルトプロパティを使用
  //userConfig = userConfig.default || userConfig;
} catch (e) {
  // ignore error
  // 修正点2: エラーメッセージをログに出力（デバッグに役立つ）
  console.log("User config not found or invalid:", e.message);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

// 修正点3: mergeConfig 関数を呼び出して結果を保存する（元のコードでは結果を保存していなかった）
const finalConfig = mergeConfig(nextConfig, userConfig);

function mergeConfig(nextConfig, userConfig) {
  // 修正点4: userConfig が存在しない場合は元の設定を返す（元のコードでは何も返していなかった）
  if (!userConfig) {
    return nextConfig;
  }

  // 修正点5: 新しいオブジェクトを作成して元の設定をコピー（元のコードでは元のオブジェクトを直接変更していた）
  const mergedConfig = { ...nextConfig };

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === "object" &&
      !Array.isArray(nextConfig[key]) &&
      // 修正点6: null チェックを追加して安全性を高める
      mergedConfig[key] !== null
    ) {
      mergedConfig[key] = {
        ...mergedConfig[key],
        ...userConfig[key],
      };
    } else {
      mergedConfig[key] = userConfig[key];
    }
  }

  // 修正点7: マージされた設定を返す（元のコードでは何も返していなかった）
  return mergedConfig;
}

// 修正点8: 最終的な設定をエクスポート（元のコードでは潜在的に未変更の設定をエクスポートしていた）
export default finalConfig;
