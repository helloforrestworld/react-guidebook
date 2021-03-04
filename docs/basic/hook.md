---
nav:
  title: React基础
  order: 1
title: Hook
order: 3
---

Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

## Hook 使用规则

- 只能在函数最外层调用 Hook。不要在循环、条件判断或者子函数中调用。
- 只能在 React 的函数组件中调用 Hook。不要在其他 JavaScript 函数中调用。（还有一个地方可以调用 Hook —— 就是自定义的 Hook 中，我们稍后会学习到。）

## useEffect 与定时器

有时候，你的 effect 可能会使用一些频繁变化的值。你可能会忽略依赖列表中 state，但这通常会引起 Bug：

```js
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // 这个 effect 依赖于 `count` state
    }, 1000);
    return () => clearInterval(id);
  }, []); // 🔴 Bug: `count` 没有被指定为依赖

  return <h1>{count}</h1>;
}
```

传入空的依赖数组 []，意味着该 hook 只在组件挂载时运行一次，并非重新渲染时。但如此会有问题，在 setInterval 的回调中，count 的值不会发生变化。因为当 effect 执行时，我们会创建一个闭包，并将 count 的值被保存在该闭包当中，且初值为 0。每隔一秒，回调就会执行 setCount(0 + 1)，因此，count 永远不会超过 1。

指定 [count] 作为依赖列表就能修复这个 Bug，但会导致每次改变发生时定时器都被重置。事实上，每个 setInterval 在被清除前（类似于 setTimeout）都会调用一次。但这并不是我们想要的。要解决这个问题，我们可以使用 setState 的函数式更新形式。它允许我们指定 state 该 如何 改变而不用引用 当前 state：

```js
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1); // ✅ 在这不依赖于外部的 `count` 变量
    }, 1000);
    return () => clearInterval(id);
  }, []); // ✅ 我们的 effect 不使用组件作用域中的任何变量

  return <h1>{count}</h1>;
}
```

## useReducer

useState 的替代方案。它接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法。（如果你熟悉 Redux 的话，就已经知道它如何工作了。）

在某些场景下，useReducer 会比 useState 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等。并且，使用 useReducer 还能给那些会触发深更新的组件做性能优化，因为你可以向子组件传递 dispatch 而不是回调函数 。

```js
import React, { useEffect, useState, useReducer } from 'react';
import './styles.css';

/* eslint-disable default-case */
function scanReducer(state, [type, payload]) {
  switch (type) {
    case 'a':
      return { ...state, count: state.count + payload * 10 };
    case 'b':
      return { ...state, count: state.count + payload * 100 };
  }
  return state;
}

const initState = { pendding: false, count: 0 };

export default function App() {
  const [state, dispatch] = useReducer(scanReducer, initState);

  return (
    <div className="App">
      <h1>count is {state.count}</h1>
      <button onClick={() => dispatch(['a', 1])}>+10</button>
      <button onClick={() => dispatch(['b', 1])}>+100</button>
    </div>
  );
}
```

## useContext

接收一个 context 对象（React.createContext 的返回值）并返回该 context 的当前值。

当组件上层最近的 <MyContext.Provider> 更新时，该 Hook 会触发重渲染。

即使祖先使用 React.memo 或 shouldComponentUpdate，也会在组件本身使用 useContext 时重新渲染。

> useContext(MyContext) 只是让你能够读取 context 的值以及订阅 context 的变化。你仍然需要在上层组件树中使用 `<MyContext.Provider>` 来为下层组件提供 context。

调用了 useContext 的组件总会在 context 值变化时重新渲染。如果重渲染组件的开销较大，你可以 通过使用 [memoization](https://github.com/facebook/react/issues/15156#issuecomment-474590693) 来优化。

选择一：拆分 context

```js
function Button() {
  let appContextValue = useContext(appContext);
  // The rest of your rendering logic
  return <ExpensiveTree className={appContextValue.theme} />;
}

function Button() {
  let theme = useContext(themeContext);
  // The rest of your rendering logic
  return <ExpensiveTree className={theme} />;
}
```

选择二：拆分组件，其中一个组件用 memo 包裹

```js
function Button() {
  let appContextValue = useContext(AppContext);
  let theme = appContextValue.theme; // Your "selector"
  return <ThemedButton theme={theme} />;
}

const ThemedButton = memo(({ theme }) => {
  // The rest of your rendering logic
  return <ExpensiveTree className={theme} />;
});
```

选择三：在单个组件内使用`useMemo`

```js
function Button() {
  let appContextValue = useContext(AppContext);
  let theme = appContextValue.theme; // Your "selector"

  return useMemo(() => {
    // The rest of your rendering logic
    return <ExpensiveTree className={theme} />;
  }, [theme]);
}
```

## useCallback

返回一个 memoized 回调函数。

```js
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

useCallback(fn, deps) 相当于 useMemo(() => fn, deps)。

## useMemo

返回一个 memoized 值。

```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

## useRef

useRef() 比 ref 属性更有用。它可以很方便地保存任何可变值，其类似于在 class 中使用实例字段的方式。
这是因为它创建的是一个普通 Javascript 对象。而 useRef() 和自建一个 {current: ...} 对象的唯一区别是，useRef 会在每次渲染时返回同一个 ref 对象。

```js
function Example(props) {
  // 把最新的 props 保存在一个 ref 中
  const latestProps = useRef(props);
  useEffect(() => {
    latestProps.current = props;
  });

  useEffect(() => {
    function tick() {
      // 在任何时候读取最新的 props
      console.log(latestProps.current);
    }

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []); // 这个 effect 从不会重新执行
}
```

## useImperativeHandle

useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值。在大多数情况下，应当避免使用 ref 这样的命令式代码。useImperativeHandle 应当与 forwardRef 一起使用：

```js
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />;
}
FancyInput = forwardRef(FancyInput);
```

## useLayoutEffect

其函数签名与 useEffect 相同，但它会在所有的 DOM 变更之后同步调用 effect。

useLayoutEffect 会在 function render 完，DOM 更新完，画面 render 之前执行，也就是 DOM 更新完成后，可以再更新一次 state，或者做其他事情，可以避免多一次 reflow、repaint(不访问少数会造成 force reflow 的 DOM attribute: offsetTop、offsetWidth…等等)。
不过如果在 useLayoutEffect 做太多事情的话，会阻塞 UI render，所以官方推荐大多情況使用 useEffect 就好。

[React 的 useEffect 与 useLayoutEffect 执行机制剖析](https://www.cnblogs.com/fulu/p/13470126.html)
[一个关于 useLayoutEffect 和 useEffect 区别的例子](https://juejin.cn/post/6844904008402862094)
[梳理 useEffect 和 useLayoutEffect 的原理与区别](https://segmentfault.com/a/1190000039087645)
