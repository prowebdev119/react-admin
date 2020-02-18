import { combineReducers } from 'redux';
import ids from './ids';
import idsForQuery from './idsForQuery';
import loadedOnce from './loadedOnce';
import params from './params';
import selectedIds from './selectedIds';
import total from './total';
import totalForQuery from './totalForQuery';
import validity from './validity';

const defaultReducer = () => null;

export default combineReducers({
    /**
     * ts-jest does some aggressive module mocking when unit testing reducers individually.
     * To avoid 'No reducer provided for key "..."' warnings,
     * we pass default reducers. Sorry for legibility.
     *
     * @see https://stackoverflow.com/questions/43375079/redux-warning-only-appearing-in-tests
     */
    ids: ids || defaultReducer,
    idsForQuery: idsForQuery || defaultReducer,
    loadedOnce: loadedOnce || defaultReducer,
    params: params || defaultReducer,
    selectedIds: selectedIds || defaultReducer,
    total: total || defaultReducer,
    totalForQuery: totalForQuery || defaultReducer,
    validity: validity || defaultReducer,
});
