module.exports = function (api) {
  if (api && typeof api.cache === "function") {
    api.cache(true);
  }
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          cwd: "babelrc",
          alias: {
            "@/screens": "./src/screens",
            "@/components": "./src/components",
            "@/hooks": "./src/hooks",
            "@/constants": "./src/constants",
            "@/types": "./src/types",
            "@/services": "./src/services",
            "@/context": "./src/context",
            "@/config": "./src/config",
            "@/utils": "./src/utils",
            "@/navigation": "./src/navigation",
            "@": "./src",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};

