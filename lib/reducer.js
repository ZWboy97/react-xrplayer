"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _redux = require("redux");

var _basic = require("./redux/basic.redux");

var rootReducer = (0, _redux.combineReducers)({
  basic: _basic.basic
});
var _default = rootReducer;
exports.default = _default;