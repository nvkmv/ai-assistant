/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Генерируем статические файлы в /out
  distDir: 'out', // Папка для статических файлов
  images: {
    unoptimized: true, // Отключаем оптимизацию изображений
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Игнорируем ошибки ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // Игнорируем ошибки TypeScript
  },
  trailingSlash: true,
};


export default nextConfig;
