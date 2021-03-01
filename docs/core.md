---
nav:
  title: React基础
  order: 1
title: 核心概念
order: 1
---

## JSX

### JSX 也是一个表达式

在编译之后，JSX 表达式会被转为普通 JavaScript 函数调用，并且对其取值后得到 JavaScript 对象。

```js
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
```

### JSX 特定属性

因为 JSX 语法上更接近 JavaScript 而不是 HTML，所以 React DOM 使用 camelCase（小驼峰命名）来定义属性的名称，而不使用 HTML 属性名称的命名约定。
例如，JSX 里的 class 变成了 className，而 tabindex 则变为 tabIndex。

### JSX 防止注入攻击

React DOM 在渲染所有输入内容之前，默认会进行转义。

### JSX 表示对象

以下两种示例代码完全等效：

```js
const element = <h1 className="greeting">Hello, world!</h1>;
```

```js
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, world!',
);
```

React.createElement() 会预先执行一些检查，以帮助你编写无错代码，但实际上它创建了一个这样的对象：

```js
// 注意：这是简化过的结构
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!',
  },
};
```

## 元素渲染

### 将一个元素渲染为 DOM

```js
const element = <h1>Hello, world</h1>;
ReactDOM.render(element, document.getElementById('root'));
```

### 更新已渲染的元素

React 元素是**不可变对象**。一旦被创建，你就无法更改它的子元素或者属性。一个元素就像电影的单帧：它代表了某个特定时刻的 UI。
根据我们已有的知识，更新 UI 唯一的方式是创建一个全新的元素，并将其传入 ReactDOM.render()。

> 在实践中，大多数 React 应用只会调用一次 ReactDOM.render()。在下一个章节，我们将学习如何将这些代码封装到**有状态组件中**。

### React 只更新它需要更新的部分

```js
function tick() {
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  );
  ReactDOM.render(element, document.getElementById('root'));
}

setInterval(tick, 1000);
```

尽管每一秒我们都会新建一个描述整个 UI 树的元素，React DOM 只会更新实际改变了的内容，也就是例子中的文本节点。
