import { Uri, window } from 'vscode';
import {
  extractCommandPathInfo,
  preparePathResource,
} from '../../utils/vona.js';
import { invokeVonaCli } from '../../utils/commands.js';
import path from 'node:path';
import { showTextDocument } from '../../utils/global.js';

export async function initAppMonkey(resource?: Uri) {
  const { fsPath } = preparePathResource(resource);
  if (!fsPath) {
    return;
  }
  // commandPathInfo
  const commandPathInfo = extractCommandPathInfo(fsPath);
  // invoke
  await invokeVonaCli([':init:appMonkey'], commandPathInfo.projectCurrent);
  // open
  const fileDest = `src/backend/config/monkey.ts`;
  showTextDocument(path.join(commandPathInfo.projectCurrent, fileDest));
}
