"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.basic = basic;
exports.fetchLiveConfigure = fetchLiveConfigure;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Action Types
var GET_LIVE_CONFIGURE = "GET_LIVE_CONFIGURE"; // 初始state中的数据

var initialState = {
  live_configure: ""
}; //reducer, 根据action对state进行处理，返回新的state

function basic() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case GET_LIVE_CONFIGURE:
      return _objectSpread({}, state, {
        live_configure: action.payload
      });

    default:
      return state;
  }
} //actionCreator， 创建action对象


function liveConfigureAction(data) {
  return {
    payload: data,
    type: GET_LIVE_CONFIGURE
  };
} //在组件中调用的dispatch action的函数


function fetchLiveConfigure(channel_id) {
  return function (dispatch) {
    _axios.default.get("http://114.116.180.115:9000/channel/info/?lid=lc205").then(function (res) {
      var data = res.data;

      if (data.code === 200) {
        dispatch(liveConfigureAction(data.data));
      }
    });
  };
}