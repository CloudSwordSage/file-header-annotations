import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const commentFormats: { [key: string]: string[] } = {
    'c': ['/* ', '*', '*/'],
    'cpp': ['/* ', '*', '*/'],
    'java': ['/**', '*', '**/'],
    'javascript': ['/*', '*', '*/'],
    'typescript': ['/*', '*', '*/'],
    'css': ['/* ', '*', '*/'],
    'kotlin': ['/**', '*', '**/'],
    'python': ['# -*- coding: utf-8 -*-', '#', ''],
};

export function AddAnnotations(file_path: string, file_name: string, languageId: string) {
    const annotations = GenerateAnnotations(file_name, languageId);
    try {
        fs.appendFileSync(file_path, annotations);
    } catch (error) {
        console.log(error);
    }
}
function GenerateAnnotations(file_name: string, languageId: string) {
    const config = vscode.workspace.getConfiguration('FileHeaderAnnotations');
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