/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Caminho do site no GitHub Pages (= nome do repositório). O workflow define BASE_PATH
  // a partir do nome real do repositório; localmente vale o padrão abaixo.
  base: process.env.BASE_PATH ?? '/tele-recados/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
