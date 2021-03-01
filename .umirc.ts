import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'React GuideBook',
  mode: 'site',
  base: '/react-guidebook',
  publicPath: '/react-guidebook/',
  exportStatic: {}, // 将所有路由输出为 HTML 目录结构，以免刷新页面时 404
  // more config: https://d.umijs.org/config
});
