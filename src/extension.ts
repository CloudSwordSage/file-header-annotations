import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "file-header-annotations" is now active!');

	const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
	fileWatcher.onDidCreate(async uri => {
		try {
        const document = await vscode.workspace.openTextDocument(uri);
        const { languageId } = document;
        console.log('File created: ' + uri.fsPath);
        vscode.window.showInformationMessage('已创建文件: ' + vscode.workspace.asRelativePath(uri) + ', 语言: ' + languageId);
    } catch (error) {
        console.error('Failed to open document:', error);
    }
	});

	const disposable = vscode.commands.registerCommand('file-header-annotations.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from 文件头部注释!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(fileWatcher);
}

export function deactivate() {}
