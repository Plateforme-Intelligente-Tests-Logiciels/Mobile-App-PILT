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
            "@/features": "./src/features",
            "@/components": "./src/components",
            "@/hooks": "./hooks",
            "@/constants": "./src/constants",
            "@/types": "./src/types",
            "@/lib": "./src/lib",
            "@": "./src",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
