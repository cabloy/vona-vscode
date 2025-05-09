import { Uri, window } from 'vscode';
import {
  extractCommandPathInfo,
  preparePathResource,
} from '../../utils/vona.js';
import { invokeVonaCli } from '../../utils/commands.js';
import path from 'node:path';
import { showTextDocument } from '../../utils/global.js';

export async function toolsMetadata(resource?: Uri) {
  const { fsPath } = preparePathResource(resource);
  if (!fsPath) {
    return;
  }
  // commandPathInfo
  const commandPathInfo = extractCommandPathInfo(fsPath);
  // invoke
  const args = [':tools:metadata'];
  if (commandPathInfo.moduleName) {
    args.push(commandPathInfo.moduleName);
  } else {
    args.push('--force');
  }
  await invokeVonaCli(args, commandPathInfo.projectCurrent);
  // open
  if (commandPathInfo.moduleName) {
    const fileDest = path.join(
      commandPathInfo.moduleRoot,
      `src/.metadata/index.ts`
    );
    showTextDocument(path.join(commandPathInfo.projectCurrent, fileDest));
  } else {
    window.showInformationMessage('Generate .metadata successfully!');
  }
}

export async function toolsCrud(resource?: Uri) {
  const { fsPath } = preparePathResource(resource);
  if (!fsPath) {
    return;
  }
  // name
  const name = await window.showInputBox({
    prompt: 'What is the resource name?',
  });
  if (!name) {
    return;
  }
  // commandPathInfo
  const commandPathInfo = extractCommandPathInfo(fsPath);
  // invoke
  await invokeVonaCli(
    [`:tools:crud`, name, `--module=${commandPathInfo.moduleName}`],
    commandPathInfo.projectCurrent
  );
  // open
  const fileDest = path.join(
    commandPathInfo.moduleRoot,
    `src/controller/${name}.ts`
  );
  showTextDocument(path.join(commandPathInfo.projectCurrent, fileDest));
}
