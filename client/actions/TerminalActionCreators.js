import _s from 'underscore.string';

import ActionTypes from 'consts/ActionTypes';
import ShellInputModes from 'consts/ShellInputModes';
import AppModel from 'containers/AppModel';
import { parse } from 'lib/command-parser';
import { PLAYER_STATE_CODES } from 'models/GameModel';


export function _selectShellInputMode(playerStateCode) {
  return ShellInputModes[({
    [PLAYER_STATE_CODES.ADVENTURING]: ShellInputModes.ADVENTURE,
    [PLAYER_STATE_CODES.BATTLING]: ShellInputModes.BATTLE,
  }[playerStateCode]) || ShellInputModes.DEFAULT];
}


const SHELL_INPUT_MODE_ALIASES = {
  _test: [
    [/ba/, 'ba_to_baz'],
    [/baz/, ''],
  ],

  [ShellInputModes.WIZARD]: [
    [/^adv/, '_wizard adventuring'],
    [/^bat/, '_wizard battling'],
  ],
};

export function _applyShellInputModeAliasesToInput(shellInputMode, input) {
  const filters = SHELL_INPUT_MODE_ALIASES[shellInputMode] || [];
  filters.some(([matcher, replacement]) => {
    const replaced = input.replace(matcher, replacement);
    if (replaced !== input) {
      input = replaced;
      return true;
    }
    return false;
  });
  return input;
}


const COMMAND_DEFINITION = {
  commands: {
    _wizard: {
      default: 'on',
      commands: {
        adventuring: null,
        battling: null,
        off: null,
        on: null,
      },
    },
    alias: null,
    character: {
      default: 'index',
      commands: {
        index: null,
        list: null,
        select: null,
        show: null,
      }
    },
    config: null,
    dictionary: null,
    guild: null,
    help: {
      default: 'welcome',
      commands: {
        welcome: null,
      }
    },
    item: {
      default: 'index',
      commands: {
        index: null,
        list: null,
        show: null,
      }
    },
    recruit: null,
  },
};

const MINIMIST_OPTIONS_FOR_COMMAND = {
};

const COMMANDS = {

  '_wizard-adventuring': function wizardAdventuring() {
    const { game } = AppModel.getInstance();
    game._isAdventuring = true;
    game._isBattling = false;
    return {
      type: ActionTypes.APPLY_COMMAND_EXECUTION,
      newShellInputMode: _selectShellInputMode(game.getPlayerStateCode()),
    };
  },

  '_wizard-battling': function wizardBattling() {
    const { game } = AppModel.getInstance();
    game._isAdventuring = true;
    game._isBattling = true;
    return {
      type: ActionTypes.APPLY_COMMAND_EXECUTION,
      newShellInputMode: _selectShellInputMode(game.getPlayerStateCode()),
    };
  },

  '_wizard-off': function wizardOn() {
    return {
      type: ActionTypes.APPLY_COMMAND_EXECUTION,
      newShellInputMode: ShellInputModes.DEFAULT,
    };
  },

  '_wizard-on': function wizardOn() {
    return {
      type: ActionTypes.APPLY_COMMAND_EXECUTION,
      newShellInputMode: ShellInputModes.WIZARD,
    };
  },

  'help-welcome': function helpIndex() {
    return {
      type: ActionTypes.APPLY_COMMAND_EXECUTION,
      output: [
        '{magenta-fg}HAKUSURA{/} - A text-based hack & slash RPG',
        '',
        'If you are a beginner, please execute the `{green-fg}tutorial{/}` command.',
      ].join('\n')
    };
  },
};


const TerminalActionCreators = {

  deleteCharacterFromShell(options = {}) {
    options = Object.assign({
      position: null,
    }, options);
    return {
      type: ActionTypes.DELETE_CHARACTER_FROM_SHELL,
      position: options.position,
    };
  },

  executeCommand(shellInputMode, rawInput) {

    const input = _applyShellInputModeAliasesToInput(shellInputMode, rawInput);

    if (_s.trim(input) === '') {
      return {
        type: ActionTypes.APPLY_COMMAND_EXECUTION,
        input: '',
      };
    }

    const { commandId, commandOptions } = parse(COMMAND_DEFINITION, MINIMIST_OPTIONS_FOR_COMMAND, input);

    const command = COMMANDS[commandId] || null;
    if (command) {
      let action = command(commandOptions);
      if (action.type === ActionTypes.APPLY_COMMAND_EXECUTION && action.input === undefined) {
        Object.assign(action, {
          input: rawInput,
        });
      }
      return action;
    }

    return {
      type: ActionTypes.APPLY_COMMAND_EXECUTION,
      input: rawInput,
      output: '{red-fg}Invalid command{/}',
    };
  },

  inputToShell(input, options = {}) {
    options = Object.assign({
      position: null,
    }, options);
    return {
      type: ActionTypes.INPUT_TO_SHELL,
      input,
      position: options.position,
    };
  },

  moveCursor(position) {
    return {
      type: ActionTypes.MOVE_CURSOR,
      position,
    };
  },

  moveCursorByRelative(relativePosition) {
    return {
      type: ActionTypes.MOVE_CURSOR,
      relativePosition,
    };
  },
};

export default TerminalActionCreators;
