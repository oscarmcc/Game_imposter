import type { Config } from "@react-router/dev/config";
import path from "path";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  routes: [
    {
      path: "/",
      file: "./app/root.tsx",
      children: [
        { index: true, file: "./app/routes/home.tsx" },
        { path: "setup", file: "./app/routes/setup.tsx" },
        { path: "names", file: "./app/routes/names.tsx" },
        { path: "game", file: "./app/routes/game.tsx" },
      ],
    }
  ]
} as unknown as Config;
