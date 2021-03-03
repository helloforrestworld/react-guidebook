---
nav:
  title: React基础
  order: 1
title: 高级指引
order: 2
---

## 代码分割

### import()

```js
import('./math').then(math => {
  console.log(math.add(2, 3));
});
```

### React.lazy

React.lazy 函数能让你像渲染常规组件一样处理动态引入（的组件）。
使用之前：

```js
import OtherComponent from './OtherComponent';
```

使用之后：

```js
const OtherComponent = React.lazy(() => import('./OtherComponent'));
```

在 Suspense 组件中渲染 lazy 组件，做优雅降级

```js
import React, { Suspense } from 'react';

const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>} maxduration={300}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

异常捕获边界（Error boundaries）
如果模块加载失败（如网络问题），它会触发一个错误。你可以通过异常捕获边界（Error boundaries）技术来处理这些情况，以显示良好的用户体验并管理恢复事宜。

```js
const MyComponent = () => (
  <div>
    <MyErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <section>
          <OtherComponent />
          <AnotherComponent />
        </section>
      </Suspense>
    </MyErrorBoundary>
  </div>
);
```

### 基于路由的代码分割

```js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
      </Switch>
    </Suspense>
  </Router>
);
```

## Context

Context 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。

### 何时使用 Context

Context 设计目的是为了共享那些对于一个组件树而言是“全局”的数据，例如当前认证的用户、主题或首选语言。

### 使用 Context 之前的考虑

Context 主要应用场景在于很多不同层级的组件需要访问同样一些的数据。请谨慎使用，因为这会使得组件的复用性变差。
**如果你只是想避免层层传递一些属性，组件组合（component composition）有时候是一个比 context 更好的解决方案。**
考虑这样一个`Page`组件，只有深层的子组件`Link`和`Avatar`需要用到`user`和`avatarSize`属性。

```js
<Page user={user} avatarSize={avatarSize} />
// ... 渲染出 ...
<PageLayout user={user} avatarSize={avatarSize} />
// ... 渲染出 ...
<NavigationBar user={user} avatarSize={avatarSize} />
// ... 渲染出 ...
<Link href={user.permalink}>
  <Avatar user={user} size={avatarSize} />
</Link>
```

一种无需使用`context`的解决方案就是讲`Avatar`组件自身传递下去。

```js
function Page(props) {
  const user = props.user;
  const userLink = (
    <Link href={user.permalink}>
      <Avatar user={user} size={props.avatarSize} />
    </Link>
  );
  return <PageLayout userLink={userLink} />;
}
```

这种对组件的`控制反转`减少了在你的应用中要传递的 props 数量，这在很多场景下会使得你的代码更加干净，使你对根组件有更多的把控。
但是，这并不适用于每一个场景，这种将逻辑提升到组件树的更高层次来处理，会使得这些高层组件变得更复杂，并且会强行将低层组件适应这样的形式，这可能不会是你想要的。

### API

- React.createContext
- Context.Provider
- Class.contextType
- Context.Consumer
- Context.displayName

创建`Context`

```js
const MyContext = React.createContext(defaultValue);
```

提供`Context`

```js
<MyContext.Provider value={}></MyContext.Provider>
```

class 组件通过`contextType`和`this.context`去获取 Context

```js
class MyClass extends React.Component {
  // static contextType = MyContext;

  componentDidMount() {
    let value = this.context;
    /* 在组件挂载完成后，使用 MyContext 组件的值来执行一些有副作用的操作 */
  }
  componentDidUpdate() {
    let value = this.context;
    /* ... */
  }
  componentWillUnmount() {
    let value = this.context;
    /* ... */
  }
  render() {
    let value = this.context;
    /* 基于 MyContext 组件的值进行渲染 */
  }
}
MyClass.contextType = MyContext;
```

通过 Consumer 去获取`Context`。

```js
<MyContext.Consumer>
  {value => /* 基于 context 值进行渲染*/}
</MyContext.Consumer>
```

在嵌套组件中更新`Context`。

```js
import React from 'react';
import './styles.css';

export const themes = {
  light: {
    foreground: '#000000',
    background: '#eeeeee',
  },
  dark: {
    foreground: '#ffffff',
    background: '#ccc',
  },
};

export const ThemeContext = React.createContext({
  theme: themes.light,
  toggleTheme: () => {},
});

function ThemeButton() {
  return (
    <ThemeContext.Consumer>
      {({ theme }) => (
        <div style={{ background: theme.background }}>事实上</div>
      )}
    </ThemeContext.Consumer>
  );
}

function ThemeControlBar() {
  return (
    <ThemeContext.Consumer>
      {({ toggleTheme }) => <button onClick={toggleTheme}>改变主题</button>}
    </ThemeContext.Consumer>
  );
}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.toggleTheme = () => {
      this.setState(state => {
        return {
          theme: state.theme === themes.dark ? themes.light : themes.dark,
        };
      });
    };

    this.state = {
      theme: themes.light,
      toggleTheme: this.toggleTheme,
    };
  }

  render() {
    return (
      <div>
        <ThemeContext.Provider value={this.state}>
          <ThemeControlBar />
          <ThemeButton />
        </ThemeContext.Provider>
      </div>
    );
  }
}
```

## 错误边界

部分 UI 的 JavaScript 错误不应该导致整个应用崩溃，为了解决这个问题，React 16 引入了一个新的概念 —— 错误边界。

错误边界是一种 React 组件，这种组件**可以捕获并打印发生在其子组件树任何位置的 JavaScript 错误，并且，它会渲染出备用 UI**，而不是渲染那些崩溃了的子组件树。错误边界在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误。

> 错误边界无法捕获以下场景中产生的错误：
>
> - 事件处理
> - 异步代码（例如 setTimeout 或 requestAnimationFrame 回调函数）
> - 服务端渲染
> - 它自身抛出来的错误（并非它的子组件）

- 只有 class 组件可以作为 ErrorBoundary
- 当抛出错误后，请使用 static getDerivedStateFromError() 渲染备用 UI ，使用 componentDidCatch() 打印错误信息。
- 错误边界仅可以捕获其子组件的错误，它无法捕获其自身的错误。
- 组件栈追踪可以追踪，这在`create-react-app`默认开启。

```js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

## Ref 转发

Ref 转发是一个可选特性，其允许某些组件接收 ref，并将其向下传递（换句话说，“转发”它）给子组件。

### 转发 refs 到 DOM 组件

```js
const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;

const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));
```

### 在高阶组件中转发 refs

```js
function someProps(WrappedComponent, someProp) {
  return forwardRef((props, ref) => (
    <WrappedComponent {...props} ref={ref} someProp={someProp} />
  ));
}
```

## 高阶组件

高阶组件（HOC）是 React 中用于复用组件逻辑的一种高级技巧。HOC 自身不是 React API 的一部分，它是一种基于 React 的组合特性而形成的设计模式。

具体而言，`高阶组件是参数为组件，返回值为新组件的函数。`

```js
// 此函数接收一个组件...
function withSubscription(WrappedComponent, selectData) {
  // ...并返回另一个组件...
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.state = {
        data: selectData(DataSource, props),
      };
    }

    componentDidMount() {
      // ...负责订阅相关的操作...
      DataSource.addChangeListener(this.handleChange);
    }

    componentWillUnmount() {
      DataSource.removeChangeListener(this.handleChange);
    }

    handleChange() {
      this.setState({
        data: selectData(DataSource, this.props),
      });
    }

    render() {
      // ... 并使用新数据渲染被包装的组件!
      // 请注意，我们可能还会传递其他属性
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };
}
```

一些原则：

- 不要改变原始组件。使用组合。
- 将不相关的 props 传递给被包裹的组件
- 最大化可组合性，如`connect`方法，结合`compose` 可以灵活组合
- 包装显示名称以便轻松调试

一些注意事项：

- 不要在 render 方法中使用 HOC
- 务必复制静态方法，使用`hoist-non-react-statics`

## 动态组件

```js
import React from 'react';
import { PhotoStory, VideoStory } from './stories';

const components = {
  photo: PhotoStory,
  video: VideoStory,
};

function Story(props) {
  // 正确！JSX 类型可以是大写字母开头的变量。
  const SpecificStory = components[props.storyType];
  return <SpecificStory story={props.story} />;
}
```

## Portals

Portal 提供了一种将子节点渲染到存在于父组件以外的 DOM 节点的优秀的方案。

- 通过 Portal 进行事件冒泡（虽然不在同一个 DOM 上，但在同一个 React 树上，仍然能冒泡）

```js
// 在 DOM 中有两个容器是兄弟级 （siblings）
const appRoot = document.getElementById('app-root');
const modalRoot = document.getElementById('modal-root');

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    // 在 Modal 的所有子元素被挂载后，
    // 这个 portal 元素会被嵌入到 DOM 树中，
    // 这意味着子元素将被挂载到一个分离的 DOM 节点中。
    // 如果要求子组件在挂载时可以立刻接入 DOM 树，
    // 例如衡量一个 DOM 节点，
    // 或者在后代节点中使用 ‘autoFocus’，
    // 则需添加 state 到 Modal 中，
    // 仅当 Modal 被插入 DOM 树中才能渲染子元素。
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}

class Parent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicks: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    // 当子元素里的按钮被点击时，
    // 这个将会被触发更新父元素的 state，
    // 即使这个按钮在 DOM 中不是直接关联的后代
    this.setState(state => ({
      clicks: state.clicks + 1,
    }));
  }

  render() {
    return (
      <div onClick={this.handleClick}>
        <p>Number of clicks: {this.state.clicks}</p>
        <p>
          Open up the browser DevTools to observe that the button is not a child
          of the div with the onClick handler.
        </p>
        <Modal>
          <Child />
        </Modal>
      </div>
    );
  }
}

function Child() {
  // 这个按钮的点击事件会冒泡到父元素
  // 因为这里没有定义 'onClick' 属性
  return (
    <div className="modal">
      <button>Click</button>
    </div>
  );
}

ReactDOM.render(<Parent />, appRoot);
```

## Profiler

Profiler 测量渲染一个 React 应用多久渲染一次以及渲染一次的“代价”，它的目的是识别出应用中渲染较慢的部分，或是可以使用类似`memoization 优化`的部分，并从相关优化中获益。

> 生产构建禁用

- 添加 ID
- 添加 onRender 回调

```js
render(
  <App>
    <Profiler id="Navigation" onRender={callback}>
      <Navigation {...props} />
    </Profiler>
    <Main {...props} />
  </App>,
);
```

### onRender

Profiler 需要一个 onRender 函数作为参数。 React 会在 profile 包含的组件树中任何组件 “提交” 一个更新的时候调用这个函数。 它的参数描述了渲染了什么和花费了多久。

```js
function onRenderCallback(
  id, // 发生提交的 Profiler 树的 “id”
  phase, // "mount" （如果组件树刚加载） 或者 "update" （如果它重渲染了）之一
  actualDuration, // 本次更新 committed 花费的渲染时间
  baseDuration, // 估计不使用 memoization 的情况下渲染整颗子树需要的时间
  startTime, // 本次更新中 React 开始渲染的时间
  commitTime, // 本次更新中 React committed 的时间
  interactions, // 属于本次更新的 interactions 的集合
) {
  // 合计或记录渲染时间。。。
}
```

## 协调

React 的 “diffing” 算法过程中所作出的设计决策，以保证组件更新可预测，且在繁杂业务场景下依然保持应用的高性能。

在某一时间节点调用 React 的 render() 方法，会创建一棵由 React 元素组成的树。在下一次 state 或 props 更新时，相同的 render() 方法会返回一棵不同的树。React 需要基于这两棵树之间的差别来判断如何高效的更新 UI，以保证当前 UI 与最新的树保持同步。

此算法有一些通用的解决方案，即生成将一棵树转换成另一棵树的最小操作次数。然而，即使使用最优的算法，该算法的复杂程度仍为 O(n 3 )，其中 n 是树中元素的数量。

如果在 React 中使用该算法，那么展示 1000 个元素则需要 10 亿次的比较。这个开销实在是太过高昂。于是 React 在以下两个假设的基础之上提出了一套 O(n) 的启发式算法：

- 两个不同类型的元素会产生出不同的树；
- 开发者可以通过设置 key 属性，来告知渲染哪些子元素在不同的渲染下可以保存不变；

### Diffing 算法

- 对比不同类型的元素
  当根节点为不同类型的元素时，React 会拆卸原有的树并且建立起新的树。
- 对比同一类型的元素
  当对比两个相同类型的 React 元素时，React 会保留 DOM 节点，仅比对及更新有改变的属性。
- 对比同类型的组件元素
  组件实例会保持不变，React 将更新该组件实例的 props 以保证与最新的元素保持一致，并且调用该实例的 UNSAFE_componentWillReceiveProps()、UNSAFE_componentWillUpdate() 以及 componentDidUpdate() 方法。
- 列表对比，添加 key 去标识元素，以最小的 DOM 节点改动去更新列表

key 应该是稳定的、唯一的（仅在列表唯一即可）。
这里展示了用索引去当作 key 时的一些问题，https://zh-hans.reactjs.org/redirect-to-codepen/reconciliation/index-used-as-key
当然如果你能确保列表是稳定的（个数、顺序不会变），用索引下标去添加 key 也是没问题的。

## Refs and the DOM

### 何时使用 Refs

- 管理焦点，文本选择或媒体播放。
- 触发强制动画。
- 集成第三方 DOM 库。

避免使用 refs 来做任何可以通过声明式实现来完成的事情。

### 创建 Refs

```js
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }
  render() {
    return <div ref={this.myRef} />;
  }
}
```

### 访问 Refs

当 ref 被传递给 render 中的元素时，对该节点的引用可以在 ref 的 current 属性中被访问。

- 当 ref 属性用于 HTML 元素时，构造函数中使用 React.createRef() 创建的 ref 接收底层 DOM 元素作为其 current 属性。
- 当 ref 属性用于自定义 class 组件时，ref 对象接收组件的挂载实例作为其 current 属性。
- 你不能在函数组件上使用 ref 属性，因为他们没有实例。

### Refs 与函数组件

默认情况下，你不能在函数组件上使用 ref 属性，因为它们没有实例：

如果要在函数组件中使用 ref，你可以使用 `forwardRef`（可与 `useImperativeHandle` 结合使用），或者可以将该组件转化为 class 组件。

### 回调 Refs

React 也支持另一种设置 refs 的方式，称为“回调 refs”。它能助你更精细地控制何时 refs 被设置和解除。

不同于传递 createRef() 创建的 ref 属性，你会传递一个函数。这个函数中接受 React 组件实例或 HTML DOM 元素作为参数，以使它们能在其他地方被存储和访问。

```js
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = null;

    this.setTextInputRef = element => {
      this.textInput = element;
    };

    this.focusTextInput = () => {
      // 使用原生 DOM API 使 text 输入框获得焦点
      if (this.textInput) this.textInput.focus();
    };
  }

  componentDidMount() {
    // 组件挂载后，让文本框自动获得焦点
    this.focusTextInput();
  }

  render() {
    // 使用 `ref` 的回调函数将 text 输入框 DOM 节点的引用存储到 React
    // 实例上（比如 this.textInput）
    return (
      <div>
        <input type="text" ref={this.setTextInputRef} />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}
```

```js
function CustomTextInput(props) {
  return (
    <div>
      <input ref={props.inputRef} />
    </div>
  );
}

class Parent extends React.Component {
  render() {
    return <CustomTextInput inputRef={el => (this.inputElement = el)} />;
  }
}
```

## Render Props

具有 render prop 的组件接受一个返回 React 元素的函数，并在组件内部通过调用此函数来实现自己的渲染逻辑。

更具体地说，render prop 是一个用于告知组件需要渲染什么内容的函数 prop。

一个复用获取鼠标位置的例子：

```js
class Cat extends React.Component {
  render() {
    const mouse = this.props.mouse;
    return (
      <img
        src="/cat.jpg"
        style={{ position: 'absolute', left: mouse.x, top: mouse.y }}
      />
    );
  }
}

class Mouse extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY,
    });
  }

  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
        {/*
          使用 `render`prop 动态决定要渲染的内容，
          而不是给出一个 <Mouse> 渲染结果的静态表示
        */}
        {this.props.render(this.state)}
      </div>
    );
  }
}

class MouseTracker extends React.Component {
  render() {
    return (
      <div>
        <h1>移动鼠标!</h1>
        <Mouse render={mouse => <Cat mouse={mouse} />} />
      </div>
    );
  }
}
```

关于 render prop 一个有趣的事情是你可以使用带有 render prop 的常规组件来实现大多数高阶组件 (HOC)。

```js
// 如果你出于某种原因真的想要 HOC，那么你可以轻松实现
// 使用具有 render prop 的普通组件创建一个！
function withMouse(Component) {
  return class extends React.Component {
    render() {
      return (
        <Mouse render={mouse => <Component {...this.props} mouse={mouse} />} />
      );
    }
  };
}
```

使用 Props 而非 render。

**将 Render Props 与 React.PureComponent 一起使用时要小心**

```js
class Mouse extends React.PureComponent {
  // 与上面相同的代码......
}

class MouseTracker extends React.Component {
  render() {
    return (
      <div>
        <h1>Move the mouse around!</h1>

        {/*
          这是不好的！
          每个渲染的 `render` prop的值将会是不同的。
        */}
        <Mouse render={mouse => <Cat mouse={mouse} />} />
      </div>
    );
  }
}
```

应该定义一个实例方法，类似这样。

```js
class MouseTracker extends React.Component {
  // 定义为实例方法，`this.renderTheCat`始终
  // 当我们在渲染中使用它时，它指的是相同的函数
  renderTheCat(mouse) {
    return <Cat mouse={mouse} />;
  }

  render() {
    return (
      <div>
        <h1>Move the mouse around!</h1>
        <Mouse render={this.renderTheCat} />
      </div>
    );
  }
}
```

## 使用 PropTypes 进行类型检查

> 自 React v15.5 起，React.PropTypes 已移入另一个包中。请使用 prop-types 库 代替。我们提供了一个 codemod 脚本来做自动转换。
