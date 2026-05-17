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
    if (!projectInfo || !projectInfo.projectPaths) {
      return;
    }
    // vona.arrayProjectRoot
    vscode.commands.executeCommand('setContext', 'vona.arrayProjectRoot', projectInfo.projectPaths);
    // vona.arrayProjectSrc
    vscode.commands.executeCommand(
      'setContext',
      'vona.arrayProjectSrc',
      projectInfo.projectPaths.map(item => path.join(item, 'src')),
    );
  }
}
