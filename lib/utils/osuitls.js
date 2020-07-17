"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OS = void 0;

/* eslint-disable no-useless-escape */
var OS = {
  weixin: navigator.userAgent.indexOf('MicroMessenger') > -1,
  android: /android/i.test(navigator.userAgent.toLowerCase()),
  ios: /(iphone|ipad|ipod|ios)/i.test(navigator.userAgent.toLowerCase()),
  googlePixel: navigator.userAgent.match(/;\sPixel\sBuild\//),
  MiOS: navigator.userAgent.match(/;\sMI\s\d\sBuild\//),
  samsungOS: navigator.userAgent.match(/;\sSM\-\w+\sBuild\//),
  isGooglePixel: function isGooglePixel() {
    return this.googlePixel != null;
  },
  isMiOS: function isMiOS() {
    return this.MiOS != null;
  },
  isSamsung: function isSamsung() {
    return this.samsungOS != null;
  },
  isMobile: function isMobile() {
    return this.android || this.ios;
  },
  isAndroid: function isAndroid() {
    return this.android;
  },
  isiOS: function isiOS() {
    return this.ios;
  },
  isWeixin: function isWeixin() {
    return this.weixin;
  }
};
exports.OS = OS;