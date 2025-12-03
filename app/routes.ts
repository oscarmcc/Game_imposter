import { type RouteConfig, index } from "@react-router/dev/routes";

export default [index("routes/home.tsx"),
    { path: "setup", file: "routes/setup.tsx" },
  { path: "names", file: "routes/names.tsx" },
  { path: "game", file: "routes/game.tsx" }
] satisfies RouteConfig;
