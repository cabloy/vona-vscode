import { commands, ExtensionContext, window } from 'vscode';
import {
  beanGlobal,
  beanAop,
  beanAopMethod,
  beanMiddleware,
  beanMiddlewareSystem,
  beanGuard,
  beanInterceptor,
  beanPipe,
  beanFilter,
  beanSocketConnection,
  beanSocketPacket,
  beanSummerCache,
  beanSsrSite,
  beanSsrMenuGroup,
  beanSsrMenuItem,
  beanSsrMenuItems,
  beanStartup,
  beanQueue,
  beanBroadcast,
  beanSchedule,
  beanEvent,
  beanEventListener,
  beanDatabaseDialect,
  beanCacheMem,
  beanCacheRedis,
  beanAuthProvider,
  beanMetaIndex,
  beanMetaVersion,
  beanMetaStatus,
  beanMetaRedlock,
  beanMetaElection,
  beanMetaStatic,
  beanMetaPrintTip,
  createEntity,
  createModel,
  createDto,
  createService,
  createController,
} from '../commands/create/bean.js';
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
import { initMain } from '../commands/init/main.js';
import { initStatic } from '../commands/init/static.js';
import { createModule } from '../commands/create/module.js';
import { createSuite } from '../commands/create/suite.js';
import { createTest } from '../commands/create/test.js';

const extensionCommands = [
  // create
  { command: 'vona.createModule', function: createModule },
  { command: 'vona.createSuite', function: createSuite },
  { command: 'vona.createDto', function: createDto },
  { command: 'vona.createEntity', function: createEntity },
  { command: 'vona.createModel', function: createModel },
  { command: 'vona.createService', function: createService },
  { command: 'vona.createController', function: createController },
  { command: 'vona.createTest', function: createTest },
  // bean
  { command: 'vona.beanGlobal', function: beanGlobal },
  { command: 'vona.beanAop', function: beanAop },
  { command: 'vona.beanAopMethod', function: beanAopMethod },
  { command: 'vona.beanMiddleware', function: beanMiddleware },
  { command: 'vona.beanMiddlewareSystem', function: beanMiddlewareSystem },
  { command: 'vona.beanGuard', function: beanGuard },
  { command: 'vona.beanInterceptor', function: beanInterceptor },
  { command: 'vona.beanPipe', function: beanPipe },
  { command: 'vona.beanFilter', function: beanFilter },
  { command: 'vona.beanSocketConnection', function: beanSocketConnection },
  { command: 'vona.beanSocketPacket', function: beanSocketPacket },
  { command: 'vona.beanSummerCache', function: beanSummerCache },
  { command: 'vona.beanSsrSite', function: beanSsrSite },
  { command: 'vona.beanSsrMenuGroup', function: beanSsrMenuGroup },
  { command: 'vona.beanSsrMenuItem', function: beanSsrMenuItem },
  { command: 'vona.beanSsrMenuItems', function: beanSsrMenuItems },
  { command: 'vona.beanStartup', function: beanStartup },
  { command: 'vona.beanQueue', function: beanQueue },
  { command: 'vona.beanBroadcast', function: beanBroadcast },
  { command: 'vona.beanSchedule', function: beanSchedule },
  { command: 'vona.beanEvent', function: beanEvent },
  { command: 'vona.beanEventListener', function: beanEventListener },
  { command: 'vona.beanDatabaseDialect', function: beanDatabaseDialect },
  { command: 'vona.beanCacheMem', function: beanCacheMem },
  { command: 'vona.beanCacheRedis', function: beanCacheRedis },
  { command: 'vona.beanAuthProvider', function: beanAuthProvider },
  { command: 'vona.beanMetaIndex', function: beanMetaIndex },
  { command: 'vona.beanMetaVersion', function: beanMetaVersion },
  { command: 'vona.beanMetaStatus', function: beanMetaStatus },
  { command: 'vona.beanMetaRedlock', function: beanMetaRedlock },
  { command: 'vona.beanMetaElection', function: beanMetaElection },
  { command: 'vona.beanMetaStatic', function: beanMetaStatic },
  { command: 'vona.beanMetaPrintTip', function: beanMetaPrintTip },
  // init
  { command: 'vona.initConfig', function: initConfig },
  { command: 'vona.initConstant', function: initConstant },
  { command: 'vona.initLocale', function: initLocale },
  { command: 'vona.initError', function: initError },
  { command: 'vona.initMonkey', function: initMonkey },
  { command: 'vona.initMain', function: initMain },
  { command: 'vona.initStatic', function: initStatic },
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
    res = await processHelper.spawnExe({
      cmd: 'node',
      args: [
        '--experimental-transform-types',
        path.join(workspaceFolder, 'packages-cli/cli/src/bin/vona.ts'),
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
