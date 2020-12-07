
const EVENT_PRIORITY_LOW = 0;
const EVENT_PRIORITY_HIGH = 5000;
/**
 * @class
 * @name EventBus
 * @description XRPlayer内部的事件总线，用于全局的事件传递
 */
class EventBus {

    constructor() {
        this.handlers = {};
        console.log('EventBus Init,', EVENT_PRIORITY_HIGH);
    }

    /**
     * @function
     * @name EventBus#getInstance
     * @description ES6单例模式实现，在import时候自动调用
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new EventBus();
        }
        return this.instance;
    }

    /**
     * @function
     * @name EventBus#on
     * @description 注册事件监听和处理
     * @param {Events} type 事件类型
     * @param {Function} listener 事件的处理函数
     * @param {Object} scope 处理函数所属的实例，传递方法的上下文
     * @param {Number} priority 优先级，范围[0,5000]
     */
    on = (type, listener, scope, priority = EVENT_PRIORITY_LOW) => {

        if (!type) {
            throw new Error('event type cannot be null or undefined');
        }
        if (!listener || typeof (listener) !== 'function') {
            throw new Error('listener must be a function: ' + listener);
        }

        if (this.getHandlerIdx(type, listener, scope) >= 0) return;

        this.handlers[type] = this.handlers[type] || [];

        const handler = {
            callback: listener,
            scope: scope,
            priority: priority
        };

        const inserted = this.handlers[type].some((item, idx) => {
            if (item && priority > item.priority) {
                this.handlers[type].splice(idx, 0, handler);
                return true;
            } else {
                return false;
            }
        });

        if (!inserted) {
            this.handlers[type].push(handler);
        }
    }

    /**
     * @function
     * @name EventBus#off
     * @param {Events} type 事件类型
     * @param {Function} listener 事件的处理函数
     * @param {Object} scope 处理函数所属的实例，传递方法的上下文
     * @description 注销事件监听和处理
     */
    off = (type, listener, scope) => {
        if (!type || !listener || !this.handlers[type]) return;
        const idx = this.getHandlerIdx(type, listener, scope);
        if (idx < 0) return;
        this.handlers[type][idx] = null;
    }

    /**
     * @function
     * @name EventBus#trigger
     * @param {Events} type 事件类型
     * @param {Object} payload 在传递事件的同时携带相关参数和数据
     * @description 触发指定类型的事件
     */
    trigger = (type, payload) => {
        if (!type || !this.handlers[type]) return;

        payload = payload || {};

        if (payload.hasOwnProperty('type')) throw new Error('\'type\' is a reserved word for event dispatching');

        payload.type = type;

        this.handlers[type] = this.handlers[type].filter((item) => item);
        this.handlers[type].forEach(handler => handler && handler.callback.call(handler.scope, payload));
    }

    /**
     * @function
     * @name EventBus#reset
     * @description 清空已有的事件监听和处理
     */
    reset = () => {
        this.handlers = {};
    }

    /** 内部私有方法 **/

    getHandlerIdx = (type, listener, scope) => {

        let idx = -1;

        if (!this.handlers[type]) return idx;

        this.handlers[type].some((item, index) => {
            if (item && item.callback === listener && (!scope || scope === item.scope)) {
                idx = index;
                return true;
            } else {
                return false;
            }
        });
        return idx;
    }
}

export default EventBus.getInstance();