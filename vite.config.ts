import { defineConfig, loadEnv, type AliasOptions } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Security guard: local auth mock is strictly disabled during production builds
  const useLocalAuth = mode !== 'production' && env.VITE_USE_LOCAL_AUTH === '1';

  const alias: AliasOptions = useLocalAuth
    ? {
        '@clerk/clerk-react': path.resolve(__dirname, './src/auth/LocalClerkMock.tsx'),
      }
    : {};


  return {
    plugins: [react()],
    resolve: { alias },
    server: { port: 5174, host: true },
  };
});


