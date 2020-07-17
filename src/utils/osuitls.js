/* eslint-disable no-useless-escape */
export var OS = {
    weixin: navigator.userAgent.indexOf('MicroMessenger') > -1,
    android: /android/i.test(navigator.userAgent.toLowerCase()),
    ios: /(iphone|ipad|ipod|ios)/i.test(navigator.userAgent.toLowerCase()),
    googlePixel: navigator.userAgent.match(/;\sPixel\sBuild\//),
    MiOS: navigator.userAgent.match(/;\sMI\s\d\sBuild\//),
    samsungOS: navigator.userAgent.match(/;\sSM\-\w+\sBuild\//),
    isGooglePixel: function () {
        return this.googlePixel != null;
    },
    isMiOS: function () {
        return this.MiOS != null;
    },
    isSamsung: function () {
        return this.samsungOS != null;
    },
    isMobile: function () {
        return this.android || this.ios;
    },

    isAndroid: function () {
        return this.android;
    },

    isiOS: function () {
        return this.ios;
    },

    isWeixin: function () {
        return this.weixin;
    }
}