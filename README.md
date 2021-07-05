# babel-plugin-transform-default-anonymous-function

name your default exported anonymous function

# Background

React fast refresh are not well supported with anonymous arrow functions as default export.

Assuming source code:

```jsx
export default () => {
  return <div />;
};
```

## Before use this plugin

```jsx
export default () => {
  return /*#__PURE__*/ React.createElement("div", null);
};
```

## After use this plugin

```jsx
export default function Transformed_default_name_() {
  return /*#__PURE__*/ React.createElement("div", null);
}
_c = Transformed_default_name_;

var _c;

$RefreshReg$(_c, "Transformed_default_name_");
```

# Install

```
npm install --save-dev babel-plugin-transform-default-anonymous-function
```

or (you use yarn)

```
yarn add --save-dev babel-plugin-transform-default-anonymous-function
```

# Usage

```js
// babel.config.js
module.exports = {
  presets: ["@babel/preset-react"],
  plugins: [
    "react-refresh/babel",
    "babel-plugin-transform-default-anonymous-function",
  ],
};
```

# LICENSE

MIT
