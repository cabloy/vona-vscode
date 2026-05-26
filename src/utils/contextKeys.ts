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
    // vona.arrayProjectRoot/arrayProjectSrc
    vscode.commands.executeCommand('setContext', 'vona.arrayProjectRoot', [
      projectInfo.projectPath,
    ]);
    const projectSrcPath = path.join(projectInfo.projectPath, 'src');
    vscode.commands.executeCommand('setContext', 'vona.arrayProjectSrc', [projectSrcPath]);
  }
}
