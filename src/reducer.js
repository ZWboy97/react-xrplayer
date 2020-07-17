import { combineReducers } from 'redux';
import { basic } from './redux/basic.redux';
import { player } from './redux/player.redux';
const rootReducer = combineReducers({
    basic, player
});
export default rootReducer;