/*
* @Time    : 2024/11/11 19:25:29
* @Author  : 墨烟行(GitHub UserName: CloudSwordSage)
* @File    : Annotations.ts
* @Desc    : 实现注释添加功能
*/

import * as vscode from 'vscode';
import * as fs from 'fs';
import { promisify } from 'util';
const { readFile, writeFile } = { readFile: promisify(fs.readFile), writeFile: promisify(fs.writeFile) };

const commentFormats: { [key: string]: string[] } = {
    'c': ['/*', '*', '*/'],
    'cpp': ['/*', '*', '*/'],
    'java': ['/**', '*', '**/'],
    'javascript': ['/*', '*', '*/'],
    'typescript': ['/*', '*', '*/'],
    'css': ['/*', '*', '*/'],
    'kotlin': ['/**', '*', '**/'],
    'python': ['# -*- coding: utf-8 -*-', '#', ''],
    'ruby': ['=begin', '*', '=end'],
    'php': ['/*', '*', '*/'],
    'swift': ['/*', '*', '*/'],
    'go': ['/*', '*', '*/'],
    'rust': ['/*', '*', '*/'],
    'objective-c': ['/*', '*', '*/'],
    'scala': ['/*', '*', '*/'],
    'shellscript': ['#', '#', ''],
    'perl': ['=pod', '*', '=cut'],
    'lua': ['--', '--', ''],
    'haskell': ['{-', '*', '-}'],
    'r': ['# -*- mode: R -*-', '#', ''],
    'matlab': ['%%', '%', ''],
    'vb': ['\'\'\'', '\'', ''],
};

export const activate_language = Object.keys(commentFormats);

export async function AddAnnotations(file_path: string, file_name: string, languageId: string) {
    const annotations = GenerateAnnotations(file_name, languageId);
    const timeout_ms = languageId === 'java' ? 500 : 10;
    try {
        await new Promise(resolve => setTimeout(resolve, timeout_ms));
        const originalContent = await readFile(file_path, 'utf8');
        const newContent = annotations + originalContent;
        await writeFile(file_path, newContent, 'utf8');
    } catch (error) {
        console.log(error);
    }
}
function GenerateAnnotations(file_name: string, languageId: string) {
    const config = vscode.workspace.getConfiguration('file-header-annotations');
    const enable_time = config.get<boolean>('enable.time');
    const enable_author = config.get<boolean>('enable.author');
    const enable_file = config.get<boolean>('enable.file');
    const enable_description = config.get<boolean>('enable.description');
    
    const author_name = config.get<string>('author');

    let annotations_array: string[] = [];
    const comment_format = commentFormats[languageId];
    annotations_array.push(comment_format[0]);
    if (enable_time) {
        const data_time = new Date().toLocaleString();
        const time_info = `${comment_format[1]} @Time    : ${data_time}`;
        annotations_array.push(time_info);
    }
    if (enable_author) {
        const author_info = `${comment_format[1]} @Author  : ${author_name}`;
        annotations_array.push(author_info);
    }
    if (enable_file) {
        const file_info = `${comment_format[1]} @File    : ${file_name}`;
        annotations_array.push(file_info);
    }
    if (enable_description) {
        const description_info = `${comment_format[1]} @Desc    : `;
        annotations_array.push(description_info);
    }
    annotations_array.push(comment_format[2]);
    annotations_array.push('');
    annotations_array.push('');
    return annotations_array.join('\n');
}