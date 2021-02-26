import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'Algorithm GuideBook',
  mode: 'site',
  base: '/algorithm-guidebook',
  publicPath: '/algorithm-guidebook/',
  exportStatic: {}, // 将所有路由输出为 HTML 目录结构，以免刷新页面时 404
  // more config: https://d.umijs.org/config
});
