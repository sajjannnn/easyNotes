import type { UserConfig } from 'vite';
import { resolve } from 'path';
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export function createBaseConfig(...files: string[]): UserConfig {
  const root = resolve(__dirname, 'src');

  const input: Record<string, string> = {};
  files.forEach((file) => {
    const fileName = file.split('/').pop()?.replace(/\.[^/.]+$/, '') || file;
    // Handle HTML files differently
    if (file.endsWith('.html')) {
      input[fileName] = resolve(__dirname, file);
    } else {
      input[fileName] = resolve(root, file);
    }
  });

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          entryFileNames: "[name].js",
        },
      },
    },
  };
}
