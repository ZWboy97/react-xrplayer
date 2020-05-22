const ENABLE_EFFECT_CONTAINER = "ENABLE_EFFECT_CONTAINER";
const EFFECT_DATA = "EFFECT_DATA";

// 初始state中的数据
const initialState = {
    is_effect_displaying: false,
    effect_data: {}
}

//reducer, 根据action对state进行处理，返回新的state
export function player(state = initialState, action) {
    switch (action.type) {
        case ENABLE_EFFECT_CONTAINER:
            return { ...state, is_effect_displaying: action.payload };
        case EFFECT_DATA:
            return { ...state, effect_data: action.payload };
        default:
            return state;
    }
}

//actionCreator， 创建action对象
function enableEffectContainerAction(data) {
    return {
        payload: data,
        type: ENABLE_EFFECT_CONTAINER
    }
}

function effectDataAction(data) {
    return {
        payload: data,
        type: EFFECT_DATA
    }
}

//在组件中调用的dispatch action的函数
export function enableEffectContainer(enable) {
    return dispatch => {
        dispatch(enableEffectContainerAction(enable))
    }
}

export function setEffectData(data) {
    return dispatch => {
        dispatch(effectDataAction(data));
    }
}




