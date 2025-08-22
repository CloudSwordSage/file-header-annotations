/*
* @Time    : 2025/8/22 15:20:52
* @Author  : 墨烟行(GitHub UserName: CloudSwordSage)
* @File    : Annotations.ts
* @License : MIT
* @Desc    : 实现注释添加功能
*/

import * as vscode from 'vscode';
import { promises as fs } from 'fs';

const { readFile, writeFile, access } = fs;

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

interface LicenseRule {
    name: string;
    patterns: RegExp[];
    version?: string;
}

const licenseRules: LicenseRule[] = [
    { name: 'MIT', patterns: [/mit\s+license/i, /permission\s+is\s+hereby\s+granted/i] },
    { name: 'GPL-3.0', patterns: [/gnu\s+general\s+public\s+license/i, /version\s+3,\s+29\s+June\s+2007/i] },
    { name: 'GPL-2.0', patterns: [/gnu\s+general\s+public\s+license/i, /version\s+2,\s+June\s+1991/i] },
    { name: 'Apache-2.0', patterns: [/apache\s+license/i, /version\s+2\.0/i] },
    { name: 'BSD-3-Clause', patterns: [/bsd\s+3-clause/i, /contributors\s+may\s+be\s+used/i] },
    { name: 'BSD-2-Clause', patterns: [/bsd\s+2-clause/i, /redistribution\s+and\s+use\s+in\s+source/i] },
    { name: 'MPL-2.0', patterns: [/mozilla\s+public\s+license/i, /version\s+2\.0/i] },
    { name: 'LGPL-3.0', patterns: [/gnu\s+lesser\s+general\s+public\s+license/i, /lgpl-3\.0/i] },
    { name: 'Unlicense', patterns: [/unlicense/i, /unencumbered\s+software\s+released/i] },
    { name: 'AGPL-3.0', patterns: [/gnu\s+affero\s+general\s+public\s+license/i, /version\s+3,\s+29\s+november\s+2007/i] },
    { name: 'EPL-2.0', patterns: [/eclipse\s+public\s+license/i, /version\s+2\.0/i] },
    { name: 'CC-BY-4.0', patterns: [/creative\s+commons\s+attribution/i, /version\s+4\.0/i] },
    { name: 'CC0-1.0', patterns: [/creative\s+commons\s+zero/i, /public\s+domain\s+dedication/i] },
    { name: 'CC-BY-SA-4.0', patterns: [/creative\s+commons\s+attribution-sharealike/i, /version\s+4\.0/i] }
];


const licenseFiles = [
    'LICENSE', 'LICENSE.txt', 'LICENSE.md',
    'COPYING', 'COPYING.txt', 'COPYING.md',
    'license', 'copying',
    'LICENCE', 'LICENCE.txt', 'LICENCE.md'
];

function normalizeContent(content: string): string {
    return content.replace(/\s+/g, ' ').toLowerCase();
}

async function DetectLicenseType(workspaceRoot: string): Promise<string | null> {
    for (const file of licenseFiles) {
        const filePath = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), file).fsPath;
        try {
            await access(filePath);
            const raw = await readFile(filePath, 'utf8');
            const content = normalizeContent(raw);

            for (const rule of licenseRules) {
                if (rule.patterns.every(p => p.test(content))) {
                    return rule.version ? `${rule.name}-${rule.version}` : rule.name;
                }
            }
            return 'Unknown';
        } catch {
            continue;
        }
    }
    return null;
}

async function GenerateAnnotations(file_name: string, languageId: string) {
    const config = vscode.workspace.getConfiguration('file-header-annotations');
    const enable_time = config.get<boolean>('enable.time');
    const enable_author = config.get<boolean>('enable.author');
    const enable_file = config.get<boolean>('enable.file');
    const enable_license = config.get<boolean>('enable.license');
    const enable_description = config.get<boolean>('enable.description');

    const author_name = config.get<string>('author') ?? '';

    const comment_format = commentFormats[languageId] ?? ['/*', '*', '*/'];

    const annotations_array: string[] = [];
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

    if (enable_license) {
        const { workspaceFolders } = vscode.workspace;
        if (workspaceFolders?.length) {
            const licenseType = await DetectLicenseType(workspaceFolders[0].uri.fsPath);
            if (licenseType) {
                annotations_array.push(`${comment_format[1]} @License : ${licenseType}`);
            }
        }
    }

    if (enable_description) {
        annotations_array.push(`${comment_format[1]} @Desc    : `);
    }

    annotations_array.push(comment_format[2]);
    annotations_array.push('');

    return annotations_array.join('\n');
}

export async function AddAnnotations(file_path: string, file_name: string, languageId: string) {
    const annotations = await GenerateAnnotations(file_name, languageId);
    const timeout_ms = languageId === 'java' ? 500 : 10;
    try {
        await new Promise(resolve => setTimeout(resolve, timeout_ms));
        const originalContent = await readFile(file_path, 'utf8');
        const newContent = annotations + originalContent;
        await writeFile(file_path, newContent, 'utf8');
    } catch (error) {
        console.error(error);
    }
}
