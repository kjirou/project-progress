import chalk from 'chalk';

import AppStore from 'store/AppStore';


export function onError(err) {
  //const {dispatchers} = AppStore.getInstance();
  console.error(chalk.red(err.stack));
  //ScreenActionCreators.throwRuntimeError(err);
}