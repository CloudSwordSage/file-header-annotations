import * as vscode from 'vscode';
import * as path from 'path';
import { AddAnnotations } from './Annotations';

export function activate(context: vscode.ExtensionContext) {

	const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
	fileWatcher.onDidCreate(async uri => {
		try {
			const config = vscode.workspace.getConfiguration('FileHeaderAnnotations');
			const enable_language = config.get<string[]>('enable.language');
			const document = await vscode.workspace.openTextDocument(uri);
			const filePath = uri.fsPath;
			const fileExtension = path.extname(filePath);
			const file_name = path.basename(filePath);
			const { languageId } = document;
			if (enable_language !== undefined && enable_language.includes(languageId)) {
         		AddAnnotations(filePath, file_name, languageId);
   			}
			vscode.window.showInformationMessage('已创建文件: ' + vscode.workspace.asRelativePath(uri) + ', 语言: ' + languageId);
		} catch (error) {
			console.error('Failed to open document:', error);
		}
	});

	context.subscriptions.push(fileWatcher);
}

export function deactivate() {}
