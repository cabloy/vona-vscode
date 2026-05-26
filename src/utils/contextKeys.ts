import path from 'node:path';
import * as vscode from 'vscode';

import { hasVonaProject, IProjectInfo } from './vona.js';

export class ContextKeys {
  async initialize() {
    const projectInfo = await this._setProjectInfo();
    if (!projectInfo) {
      return;
    }
    return projectInfo;
  }

  async _setProjectInfo() {
    const projectInfo = await hasVonaProject();
    // vona.hasVonaProject
    vscode.commands.executeCommand('setContext', 'vona.hasVonaProject', !!projectInfo);
    // more keys
    await this._setMoreKeys(projectInfo);
    // ok
    return projectInfo;
  }

  async _setMoreKeys(projectInfo?: IProjectInfo) {
    if (!projectInfo || !projectInfo.projectPath) {
      return;
    }
    // vona.projectPath/projectSrcPath
    vscode.commands.executeCommand('setContext', 'vona.projectPath', projectInfo.projectPath);
    vscode.commands.executeCommand(
      'setContext',
      'vona.projectSrcPath',
      path.join(projectInfo.projectPath, 'src'),
    );
  }
}
