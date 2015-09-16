import {bindActionCreators, createStore} from 'redux';
import SingletonMixin from 'singleton-mixin';

import ScreenActionCreators from 'actions/ScreenActionCreators';
import rootReducer from 'reducers';


class AppStore {

  constructor() {
    this._store = createStore(rootReducer);
    this._dispatchers = Object.assign(
      {},
      bindActionCreators(ScreenActionCreators, this._store.dispatch)
    );
  }

  get store() {
    return this._store;
  }

  get dispatchers() {
    return this._dispatchers;
  }
}

Object.assign(AppStore, SingletonMixin);

export default AppStore;