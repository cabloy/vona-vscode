import { Uri, window, workspace } from 'vscode';
import {
  combineCliResourcePath,
  extractCommandPathInfo,
  preparePathResource,
  trimPathPrefixs,
} from '../../utils/vona.js';
import { LocalConsole } from '../../utils/console.js';
import path from 'node:path';
import { invokeVonaCli } from '../../utils/commands.js';
import { showTextDocument } from '../../utils/global.js';

export async function createDto(resource: Uri) {
  await createGeneral_common(resource, 'dto', 'What is the dto name?');
}

export async function createEntity(resource: Uri) {
  await createGeneral_common(resource, 'entity', 'What is the entity name?');
}

export async function createModel(resource: Uri) {
  await createGeneral_common(resource, 'model', 'What is the model name?');
}

export async function createService(resource: Uri) {
  await createGeneral_common(resource, 'service', 'What is the service name?');
}

export async function createController(resource: Uri) {
  await createGeneral_common(
    resource,
    'controller',
    'What is the controller name?'
  );
}

export async function createGeneral_common(
  resource: Uri,
  sceneName: string,
  prompt: string
) {
  const { fromPalette, fsPath } = preparePathResource(resource);
  if (!fsPath) {
    return;
  }
  // name
  const name = await window.showInputBox({ prompt });
  if (!name) {
    return;
  }
  // commandPathInfo
  const commandPathInfo = extractCommandPathInfo(fsPath);
  if (fromPalette) {
    commandPathInfo.pathResource = '';
  }
  // pathResource
  const pathResource = trimPathPrefixs(
    combineCliResourcePath(commandPathInfo.pathResource, name),
    [`src/${sceneName}/`, 'src/']
  );
  // invoke
  await invokeVonaCli(
    [
      `:create:${sceneName}`,
      pathResource,
      `--module=${commandPathInfo.moduleName}`,
    ],
    commandPathInfo.projectCurrent
  );
  // open
  const fileDest = path.join(
    commandPathInfo.moduleRoot,
    `src/${sceneName}/${pathResource}.ts`
  );
  showTextDocument(path.join(commandPathInfo.projectCurrent, fileDest));
}
