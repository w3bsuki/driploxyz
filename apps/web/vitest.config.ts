import { defineConfig, mergeConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import appConfig from '@repo/testing/vitest.config.app';

export default mergeConfig(
  appConfig,
  defineConfig({
    plugins: [sveltekit()],
    test: {
      environment: 'happy-dom'
    }
  })
);
