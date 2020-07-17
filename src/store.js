import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';        // 中间件，用来处理异步数据
import rootReducer from './reducer';

const store = createStore(
    rootReducer,
    compose(
        applyMiddleware(thunk),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    )
);
export default store;
