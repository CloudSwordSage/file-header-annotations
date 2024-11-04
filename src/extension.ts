import * as vscode from 'vscode';
import * as path from 'path';
import { AddAnnotations, activate_language } from './Annotations';

export function activate(context: vscode.ExtensionContext) {
	console.log(activate_language);
	const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
	fileWatcher.onDidCreate(async uri => {
		try {
			const config = vscode.workspace.getConfiguration('file-header-annotations');
			const disenable_language = config.get<string[]>('disenable.language');
			const document = await vscode.workspace.openTextDocument(uri);
			const filePath = uri.fsPath;
			const file_name = path.basename(filePath);
			const { languageId } = document;
			if (activate_language.includes(languageId) && disenable_language !== undefined && !disenable_language.includes(languageId)) {
				await AddAnnotations(filePath, file_name, languageId);
				vscode.window.showInformationMessage('已创建文件: ' + vscode.workspace.asRelativePath(uri) + ', 语言: ' + languageId + ' 已添加文件头注释');
			} else {
				vscode.window.showInformationMessage('已创建文件: ' + vscode.workspace.asRelativePath(uri) + ', 语言: ' + languageId + ' 已创建文件，未添加文件头注释');
			}
		} catch (error) {
			console.error('Failed to open document:', error);
		}
	});

	let disposable = vscode.commands.registerCommand('file-header-annotations.createFileHeader', async () => {
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
	context.subscriptions.push(disposable);
	context.subscriptions.push(fileWatcher);
}

export function deactivate() {}
