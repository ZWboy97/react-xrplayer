import { combineReducers } from 'redux';
import { player } from './redux/player.redux';
const rootReducer = combineReducers({
    player
});
export default rootReducer;