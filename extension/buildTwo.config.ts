import { defineConfig } from 'vite';
import { createBaseConfig } from './base.config';

export default defineConfig(() => {
  const baseConfig = createBaseConfig('background/index.ts', 'index.html');

  return {
    ...baseConfig,
    build: {
      ...baseConfig.build,
      rollupOptions: {
        ...baseConfig.build?.rollupOptions,
        input: {
          side_panel: 'index.html',
          background: 'src/background/index.ts',
          dashboard: "dashboard.html",
        },
        output: {
          ...baseConfig.build?.rollupOptions?.output,
          // Use ES module format for service worker and popup
          format: 'es' as const,
        },
      },
      // Don't clear dist - we're building incrementally
      emptyOutDir: false,
    },
  };
});
