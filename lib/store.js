"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _redux = require("redux");

var _reduxThunk = _interopRequireDefault(require("redux-thunk"));

var _reducer = _interopRequireDefault(require("./reducer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 中间件，用来处理异步数据
var store = (0, _redux.createStore)(_reducer.default, (0, _redux.compose)((0, _redux.applyMiddleware)(_reduxThunk.default), window.devToolsExtension ? window.devToolsExtension() : function (f) {
  return f;
}));
var _default = store;
exports.default = _default;