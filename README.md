# file-header-annotations README

这是一个用于在创建文件时自动在文件头部添加注释的插件。

Author: CloudSwordSage

## Extension Settings

- file-header-annotations.enable.time：是否启用时间注释，bool，默认为true
- file-header-annotations.enable.author：是否启用作者注释，bool，默认为true
- file-header-annotations.enable.file：是否启用文件名注释，bool，默认为true
- file-header-annotations.enable.description：是否启用描述注释，bool，默认为true
- file-header-annotations.author：作者注释内容，string，默认为空
- file-header-annotations.disenable.language：禁止添加注释的语言，string数组，默认为空

## Command

- `create file header`：创建文件头

## Known Issues

欢迎提交issue，我会尽快修复。

## Release Notes

### 0.0.1

初始版本，完成了文件头部注释的添加。

### 0.0.2

添加了语言支持，添加 `create file header` 命令来创建文件头

### 0.0.3

添加插件元数据，并修改关键词

### v0.0.4

bug 修复，具体见 [CHANGELOG.mg](./CHANGELOG.md)

**Done!**