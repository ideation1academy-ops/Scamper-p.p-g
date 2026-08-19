import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

  return {
    plugins: [react(), tailwindcss()],
    // Local/custom-domain builds use '/'. GitHub Actions automatically uses '/<repo-name>/'.
    base:
      process.env.VITE_BASE ||
      (isGitHubActions && repoName ? `/${repoName}/` : "/"),
    build: {
      sourcemap: false,
    },
  };
});
