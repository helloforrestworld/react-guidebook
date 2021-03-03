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

## 组件 & props

### 函数组件与 class 组件

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

```js
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### 渲染组件

上面的 React 元素都只是 DOM 标签，React 元素也可以是用户自定义的组件

```js
const element = <div />;
const element = <Welcome name="Sara" />;
```

### 组合组件

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="Cahal" />
      <Welcome name="Edite" />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

### Props 的只读性

组件无论是使用函数声明还是通过 class 声明，都决不能修改自身的 props。
React 非常灵活，但它也有一个严格的规则：
**所有 React 组件都必须像纯函数一样保护它们的 props 不被更改。**

> 纯函数不会尝试更改入参，且多次调用下相同的入参始终返回相同的结果。

## State & 生命周期

### 正确地使用 State

不要直接修改 State

```js
this.setState({ comment: 'Hello' });
```

State 的更新可能是异步的

```js
this.setState((state, props) => ({
  counter: state.counter + props.increment,
}));
```

数据是向下流动的

## 事件处理

- React 事件的命名采用小驼峰式（camelCase），而不是纯小写。
- 使用 JSX 语法时你需要传入一个函数作为事件处理函数，而不是一个字符串。

### 合成事件

在这里，e 是一个合成事件。React 根据 W3C 规范来定义这些合成事件，默认解决了兼容性问题。
除兼容所有浏览器外，它还拥有和浏览器原生事件相同的接口，包括 `stopPropagation()` 和 `preventDefault()`。
如果因为某些原因，当你需要使用浏览器的底层事件时，只需要使用`nativeEvent`属性来获取即可。

```js
function ActionLink() {
  function handleClick(e) {
    e.preventDefault();
    console.log('The link was clicked.');
  }

  return (
    <a href="#" onClick={handleClick}>
      Click me
    </a>
  );
}
```

> 从 v17 开始，e.persist() 将不再生效，因为 SyntheticEvent 不再放入事件池中。
> 从 v0.14 开始，事件处理器返回 false 时，不再阻止事件传递。你可以酌情手动调用 e.stopPropagation() 或 e.preventDefault() 作为替代方案。

支持的事件
以下的事件处理函数在冒泡阶段被触发。如需注册捕获阶段的事件处理函数，则应为事件名添加 Capture。例如，处理捕获阶段的点击事件请使用 onClickCapture，而不是 onClick。

## 条件渲染

React 中的条件渲染和 JavaScript 中的一样，使用 JavaScript 运算符**if** 或者 **条件运算符** 去创建元素来表现当前的状态，然后让 React 根据它们来更新 UI。

```js
function UserGreeting(props) {
  return <h1>Welcome back!</h1>;
}

function GuestGreeting(props) {
  return <h1>Please sign up.</h1>;
}

function Greeting(props) {
  const isLoggedIn = props.isLoggedIn;
  if (isLoggedIn) {
    return <UserGreeting />;
  }
  return <GuestGreeting />;
}

ReactDOM.render(
  // Try changing to isLoggedIn={true}:
  <Greeting isLoggedIn={false} />,
  document.getElementById('root'),
);
```

元素变量

```js
class LoginControl extends React.Component {
  constructor(props) {
    super(props);
    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
    this.state = { isLoggedIn: false };
  }

  handleLoginClick() {
    this.setState({ isLoggedIn: true });
  }

  handleLogoutClick() {
    this.setState({ isLoggedIn: false });
  }

  render() {
    const isLoggedIn = this.state.isLoggedIn;
    let button;
    if (isLoggedIn) {
      button = <LogoutButton onClick={this.handleLogoutClick} />;
    } else {
      button = <LoginButton onClick={this.handleLoginClick} />;
    }

    return (
      <div>
        <Greeting isLoggedIn={isLoggedIn} />
        {button}
      </div>
    );
  }
}
```

与运算符 &&
`false`、`null`、`undefined`渲染时会被忽略

```js
function Mailbox(props) {
  const unreadMessages = props.unreadMessages;
  return (
    <div>
      <h1>Hello!</h1>
      {unreadMessages.length > 0 && (
        <h2>You have {unreadMessages.length} unread messages.</h2>
      )}
    </div>
  );
}
```

三目运算符

```js
render() {
  const isLoggedIn = this.state.isLoggedIn;
  return (
    <div>
      {isLoggedIn
        ? <LogoutButton onClick={this.handleLogoutClick} />
        : <LoginButton onClick={this.handleLoginClick} />
      }
    </div>
  );
}
```

阻止组件渲染
可以让 render 方法直接返回 null，而不进行任何渲染。

```js
function WarningBanner(props) {
  if (!props.warn) {
    return null;
  }

  return <div className="warning">Warning!</div>;
}
```

在组件的 render 方法中返回 null 并不会影响组件的生命周期。例如，上面这个示例中，componentDidUpdate 依然会被调用。

## 列表 & Key

### 渲染多个组件

```js
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map(number => <li>{number}</li>);
```

### key

key 帮助 React 识别哪些元素改变了，比如被添加或删除。因此你应当给数组中的每一个元素赋予一个确定的标识。

一个元素的 key 最好是这个元素在列表中拥有的一个独一无二的字符串。通常，我们使用数据中的 id 来作为元素的 key：

```js
const todoItems = todos.map(todo => <li key={todo.id}>{todo.text}</li>);
```

当元素没有确定 id 的时候，万不得已你可以使用元素索引 index 作为 key，如果列表项目的顺序可能会变化，我们不建议使用索引来用作 key 值，因为这样做会导致性能变差，还可能引起组件状态的问题。

key 只是在兄弟节点之间必须唯一，数组元素中使用的 key 在其兄弟节点之间应该是独一无二的。然而，它们不需要是全局唯一的。当我们生成两个不同的数组时，我们可以使用相同的 key 值：

## 表单

### 受控组件

React 的 state 成为“唯一数据源”渲染表单的 React 组件还控制着用户输入过程中表单发生的操作。被 React 以这种方式控制取值的表单输入元素就叫做“受控组件”。

在 HTML 中，表单元素（如`<input>、 <textarea> 和 <select>`）通常自己维护 state，并根据用户输入进行更新。而在 React 中，可变状态（mutable state）通常保存在组件的 state 属性中，并且只能通过使用 setState()来更新。

#### Input 标签

```js
<form onSubmit={this.handleSubmit}>
  <label>
    名字:
    <input type="text" value={this.state.value} onChange={this.handleChange} />
  </label>
  <input type="submit" value="提交" />
</form>
```

#### Textarea 标签

在 HTML 中, `<textarea>` 元素通过其子元素定义其文本:

```js
<textarea>你好， 这是在 text area 里的文本</textarea>
```

而在 React 中，`<textarea>` 使用 value 属性代替。

```js
<textarea value={this.state.value} onChange={this.handleChange} />
```

#### Select 标签

在 HTML 中，`<select>` 创建下拉列表标签。例如，如下 HTML 创建了水果相关的下拉列表：

```js
<select>
  <option value="grapefruit">葡萄柚</option>
  <option value="lime">酸橙</option>
  <option selected value="coconut">
    椰子
  </option>
  <option value="mango">芒果</option>
</select>
```

在 react 中，给 select 标签加上 value 属性，这在受控组件中更便捷，因为您只需要在根标签中更新它。

```js
<select value={this.state.value} onChange={this.handleChange}>
  <option value="grapefruit">葡萄柚</option>
  <option value="lime">酸橙</option>
  <option value="coconut">椰子</option>
  <option value="mango">芒果</option>
</select>
```

### 非受控组件

在大多数情况下，我们推荐使用 受控组件 来处理表单数据。

有时使用受控组件会很麻烦，因为你需要为数据变化的每种方式都编写事件处理函数，并通过一个 React 组件传递所有的输入 state。当你将之前的代码库转换为 React 或将 React 应用程序与非 React 库集成时，这可能会令人厌烦。在这些情况下，你可能希望使用非受控组件, 这是实现输入表单的另一种方式。

不传入 value 值，通过 ref 去获取最终的 value。

```js
class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.input = React.createRef();
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.input.current.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" ref={this.input} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```

在非受控组件中，你经常希望 React 能赋予组件一个初始值，但是不去控制后续的更新。 在这种情况下, 你可以指定一个`defaultValue` 属性，而不是 value。

```js
render() {
  return (
    <form onSubmit={this.handleSubmit}>
      <label>
        Name:
        <input
          defaultValue="Bob"
          type="text"
          ref={this.input} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}
```

## 状态提升

通常，多个组件需要反映相同的变化数据，这时我们建议将共享状态提升到最近的共同父组件中去。让我们看看它是如何运作的。
在 React 应用中，任何可变数据应当只有一个相对应的唯一“数据源”。

state 都是首先添加到需要渲染数据的组件中去。然后，如果其他组件也需要这个 state，那么你可以将它提升至这些组件的最近共同父组件中。你应当依靠自上而下的数据流，而不是尝试在不同组件间同步 state。

如果某些数据可以由 props 或 state 推导得出，那么它就不应该存在于 state 中。

## 组合 vs 继承

React 有十分强大的组合模式。我们推荐使用组合而非继承来实现组件间的代码重用。

### 包含关系

有些组件无法提前知晓它们子组件的具体内容。在 Sidebar（侧边栏）和 Dialog（对话框）等展现通用容器（box）的组件中特别容易遇到这种情况。

```js
function FancyBorder(props) {
  return (
    <div className={'FancyBorder FancyBorder-' + props.color}>
      {props.children}
    </div>
  );
}
```

这使得别的组件可以通过 JSX 嵌套，将任意组件作为子组件传递给它们

```js
function WelcomeDialog() {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">Welcome</h1>
      <p className="Dialog-message">Thank you for visiting our spacecraft!</p>
    </FancyBorder>
  );
}
```

少数情况下，你可能需要在一个组件中预留出几个“洞”。这种情况下，我们可以不使用 children，而是自行约定：将所需内容传入 props，并使用相应的 prop。

```js
function SplitPane(props) {
  return (
    <div className="SplitPane">
      <div className="SplitPane-left">{props.left}</div>
      <div className="SplitPane-right">{props.right}</div>
    </div>
  );
}

function App() {
  return <SplitPane left={<Contacts />} right={<Chat />} />;
}
```

### 特例关系

有些时候，我们会把一些组件看作是其他组件的特殊实例，比如 WelcomeDialog 可以说是 Dialog 的特殊实例。
在 React 中，我们也可以通过组合来实现这一点。“特殊”组件可以通过 props 定制并渲染“一般”组件：

```js
function Dialog(props) {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">{props.title}</h1>
      <p className="Dialog-message">{props.message}</p>
    </FancyBorder>
  );
}

function WelcomeDialog() {
  return (
    <Dialog title="Welcome" message="Thank you for visiting our spacecraft!" />
  );
}
```

## React 哲学

- 第一步：将设计好的 UI 划分为组件层级

根据单一功能原则来判定组件的范围。也就是说，一个组件原则上只能负责一个功能。如果它需要负责更多的功能，这时候就应该考虑将它拆分成更小的组件。

- 第二步：用 React 创建一个静态版本

在构建应用的静态版本时，我们需要创建一些会重用其他组件的组件，然后通过 props 传入所需的数据。props 是父组件向子组件传递数据的方式。即使你已经熟悉了 state 的概念，也完全不应该使用 state 构建静态版本。state 代表了随时间会产生变化的数据，应当仅在实现交互时使用。所以构建应用的静态版本时，你不会用到它。

你可以自上而下或者自下而上构建应用：自上而下意味着首先编写层级较高的组件（比如 FilterableProductTable），自下而上意味着从最基本的组件开始编写（比如 ProductRow）。当你的应用比较简单时，使用自上而下的方式更方便；对于较为大型的项目来说，自下而上地构建，并同时为低层组件编写测试是更加简单的方式。

- 确定 UI state 的最小（且完整）表示

只保留应用所需的可变 state 的最小集合，其他数据均由它们计算产生。

你可以逐个检查相应数据是否属于 state: 1.该数据是否是由父组件通过 props 传递而来的？如果是，那它应该不是 state。 2.该数据是否随时间的推移而保持不变？如果是，那它应该也不是 state。 3.你能否根据其他 state 或 props 计算出该数据的值？如果是，那它也不是 state。

- 第四步：确定 state 放置的位置

  1.找到根据这个 state 进行渲染的所有组件。 2.找到他们的共同所有者（common owner）组件（在组件层级上高于所有需要该 state 的组件）。 3.该共同所有者组件或者比它层级更高的组件应该拥有该 state。 4.如果你找不到一个合适的位置来存放该 state，就可以直接创建一个新的组件来存放该 state，并将这一新组件置于高于共同所有者组件层级的位置。

- 第五步：添加反向数据流（改变 state 的回调）
