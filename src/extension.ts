/*
* @Time    : 2025/8/22 15:21:13
* @Author  : 墨烟行(GitHub UserName: CloudSwordSage)
* @File    : extension.ts
* @License : MIT
* @Desc    : 注册命令及文件创建监听
*/

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AddAnnotations, activate_language } from './Annotations';

async function isFile(file_path: string) {
	try {
		const stats = await fs.promises.stat(file_path);
		return stats.isFile();
	} catch (error) {
		return false;
	}
}

async function getFileMetadata(file_path: string): Promise<fs.Stats> {
	try {
		return await fs.promises.stat(file_path);
	} catch (error) {
		throw error;
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log(activate_language);
	let disposableFileWatcher = vscode.workspace.onDidCreateFiles(async (event) => {
		try {
			const Uri = event.files[0];
			const filePath = Uri.fsPath;
			// 排除非文件
			if (await isFile(filePath)) {
			} else {
				return;
			}
			// 排除复制行为创建的文件
			const stats = await getFileMetadata(filePath);
			const createTime = stats.ctime.toLocaleString();
			const nowTime = new Date().toLocaleString();
			if (createTime !== nowTime) {
				return;
			}
			// 开始创建文件头注释
			const config = vscode.workspace.getConfiguration('file-header-annotations');
			const disenable_language = config.get<string[]>('disenable.language');
			const document = await vscode.workspace.openTextDocument(Uri);
			const file_name = path.basename(filePath);
			const { languageId } = document;
			if (activate_language.includes(languageId) && disenable_language !== undefined && !disenable_language.includes(languageId)) {
				await AddAnnotations(filePath, file_name, languageId);
				vscode.window.showInformationMessage('已创建文件: ' + vscode.workspace.asRelativePath(Uri) + ', 语言: ' + languageId + ', 已添加文件头注释');
			} else {
				vscode.window.showInformationMessage('已创建文件: ' + vscode.workspace.asRelativePath(Uri) + ', 语言: ' + languageId + ', 已创建文件，未添加文件头注释');
			}
		} catch (error) {
			console.error('Failed to open document:', error);
		}
	});

	let disposableCommand = vscode.commands.registerCommand('file-header-annotations.createFileHeader', async () => {
		const config = vscode.workspace.getConfiguration('file-header-annotations');
		const disenable_language = config.get<string[]>('disenable.language');
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('当前未打开编辑器');
			return;
		}
		const {document} = editor;
		if (!document) {
			vscode.window.showErrorMessage('当前未打开文件');
			return;
		}
		const { languageId } = document;
		const filePath = document.fileName;
		const file_name = path.basename(filePath);
		if (activate_language.includes(languageId) && disenable_language !== undefined && !disenable_language.includes(languageId)) {
			await AddAnnotations(filePath, file_name, languageId);
			vscode.window.showInformationMessage('已添加文件头注释');
		} else {
			vscode.window.showInformationMessage('当前语言: ' + languageId + ' 未在配置中激活，未添加文件头注释');
		}
	});
	context.subscriptions.push(disposableCommand);
	context.subscriptions.push(disposableFileWatcher);
}

export function deactivate() {}
