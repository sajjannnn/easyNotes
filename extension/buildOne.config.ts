import { defineConfig } from 'vite';
import { createBaseConfig } from './base.config';

export default defineConfig(() => {
  const baseConfig = createBaseConfig('content/index.tsx');

  return {
    ...baseConfig,
    build: {
      ...baseConfig.build,
      rollupOptions: {
        ...baseConfig.build?.rollupOptions,
        input: {
          content: 'src/content/index.tsx',
        },
        output: {
          ...baseConfig.build?.rollupOptions?.output,
          // Bundle everything into a single file for content script
          // Use IIFE format to avoid module issues
          format: 'iife' as const,
          manualChunks: undefined,
        },
      },
    },
  };
});
