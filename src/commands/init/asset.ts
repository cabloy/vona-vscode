import { Uri, window } from 'vscode';
import {
  extractCommandPathInfo,
  preparePathResource,
} from '../../utils/vona.js';
import { invokeVonaCli } from '../../utils/commands.js';
import path from 'node:path';
import { showTextDocument } from '../../utils/global.js';

export async function initAsset(resource?: Uri) {
  const { fsPath } = preparePathResource(resource);
  if (!fsPath) {
    return;
  }
  // scene
  const scene = await window.showInputBox({
    prompt: 'What is the asset scene name?',
  });
  if (!scene) {
    return;
  }
  // commandPathInfo
  const commandPathInfo = extractCommandPathInfo(fsPath);
  if (!commandPathInfo.moduleName) {
    return;
  }
  // invoke
  await invokeVonaCli(
    [':init:asset', scene, `--module=${commandPathInfo.moduleName}`],
    commandPathInfo.projectCurrent
  );
  // // open
  // const fileDest = path.join(commandPathInfo.moduleRoot, `static/img/vona.png`);
  // showTextDocument(path.join(commandPathInfo.projectCurrent, fileDest));
}
