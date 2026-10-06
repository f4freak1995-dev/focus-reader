# Focus Reader

Focus Reader 的产品展示与发布页面：本地桌面阅读器，包含普通阅读、逐句色块、中文 ARSVP 与焦点跟读。

**这是公开的网站仓库，不是阅读器源码仓库。** 原创阅读器实现保持非公开；没有开源授权。网站原创部分的使用范围见 [LICENSE.txt](LICENSE.txt)，开放材料继续按各自许可使用。

## 当前状态

- macOS：0.1.11 Alpha，Apple Silicon。已构建本地测试包；公开下载是否启用以 [release-manifest.json](release-manifest.json) 为准。尚未通过 Apple 公证。
- Windows：接入新修复与原生验收中，未在本仓库提供新版安装器。
- 跨设备同步：尚未实现，需要同协议的两端更新和真实往返测试。

站点采用静态 HTML/CSS/JavaScript，无分析脚本、远程字体或书籍上传。四种模式的交互是网站示意，不是桌面应用截图或阅读时长模型。

## 版权与通知

[版权与使用](copyright.html) · [第三方许可](third-party.html) · [隐私说明](privacy.html)

程序依赖的完整许可与数据来源单独保留；不能把教育部辞典、CC-CEDICT 等第三方材料声明为本项目独占作品。

GitHub Pages 的发布源使用 GitHub Actions，由 `.github/workflows/pages.yml` 在 `main` 分支更新时发布。工作流逐项复制已批准的网站文件，不将整个工作区上传为站点；官方 Actions 固定提交 SHA，构建不保存 Git 凭据，部署沿用 `github-pages` 环境与分支限制。

不要上传阅读器的 `src`、`src-tauri`、源码交接 ZIP、个人书库、字体、凭据或调试 source map。安装包应通过经过核对的 Release 资产提供。
