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
    },

    isSafari: function () {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('applewebkit') > -1 && ua.indexOf('mobile') > -1 && ua.indexOf('safari') > -1 &&
            ua.indexOf('linux') === -1 && ua.indexOf('android') === -1 && ua.indexOf('chrome') === -1 &&
            ua.indexOf('ios') === -1 && ua.indexOf('browser') === -1) {
            return true;
        } else {
            return false;
        }
    }
}