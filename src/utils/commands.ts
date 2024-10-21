import { commands, ExtensionContext, window } from 'vscode';
import { logger } from './outputChannel.js';
import { LocalConsole } from './console.js';
import { ProcessHelper } from '@cabloy/process-helper';
import { getWorkspaceRootDirectory } from './vona.js';
import { existsSync } from 'fs-extra';
import path from 'node:path';
import { toolsMetadata } from '../commands/tools/metadata.js';
import { initConfig } from '../commands/init/config.js';
import { initConstant } from '../commands/init/constant.js';
import { initLocale } from '../commands/init/locale.js';
import { initError } from '../commands/init/error.js';
import { initMonkey } from '../commands/init/monkey.js';
import { createModule } from '../commands/create/module.js';
import { createSuite } from '../commands/create/suite.js';

const extensionCommands = [
  // create
  { command: 'vona.createModule', function: createModule },
  { command: 'vona.createSuite', function: createSuite },
  // init
  { command: 'vona.initConfig', function: initConfig },
  { command: 'vona.initConstant', function: initConstant },
  { command: 'vona.initLocale', function: initLocale },
  { command: 'vona.initError', function: initError },
  { command: 'vona.initMonkey', function: initMonkey },
  // refactor
  // tools
  { command: 'vona.toolsMetadata', function: toolsMetadata },
];

export class Commands {
  context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  initialize() {
    for (const { command, function: commandFunction } of extensionCommands) {
      this.context.subscriptions.push(
        commands.registerCommand(
          command,
          wrapperCommand(command, commandFunction)
        )
      );
    }
  }
}

function wrapperCommand(command, fn) {
  return async function (...args) {
    try {
      await fn(...args);
    } catch (err) {
      // need not logger.log to avoid log the same error twice
      // logger.log(`command: ${command} Error: ${err.message}`);
      window.showInformationMessage(err.message);
    }
  };
}

export async function invokeVonaCli(
  args: string[],
  projectCurrent: string,
  forceGlobalCli?: boolean
) {
  const console = new LocalConsole();
  const processHelper = new ProcessHelper(projectCurrent, console);
  const workspaceFolder = getWorkspaceRootDirectory();
  args = args.concat('--vscode');
  let res;
  if (
    !forceGlobalCli &&
    existsSync(path.join(workspaceFolder, 'packages-cli'))
  ) {
    await processHelper.spawnCmd({
      cmd: 'tsc',
      args: ['-b'],
      options: {
        stdio: 'pipe',
        cwd: path.join(workspaceFolder, 'packages-cli'),
        shell: true,
      },
    });
    res = await processHelper.spawnExe({
      cmd: 'node',
      args: [
        path.join(workspaceFolder, 'packages-cli/cli/dist/bin/vona.js'),
      ].concat(args),
      options: {
        stdio: 'pipe',
        cwd: projectCurrent,
        shell: true,
      },
    });
  } else {
    // spawn
    res = await processHelper.spawnCmd({
      cmd: 'vona',
      args,
      options: {
        stdio: 'pipe',
        cwd: projectCurrent,
        shell: true,
      },
    });
  }
  return res;
}
