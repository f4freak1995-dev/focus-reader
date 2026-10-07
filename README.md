# Focus Reader

Focus Reader 的产品展示与发布页面：本地桌面阅读器，包含普通阅读、逐句色块、中文 ARSVP 与焦点跟读。

**这是公开的网站仓库，不是阅读器源码仓库。** 原创阅读器实现保持非公开；没有开源授权。网站原创部分的使用范围见 [LICENSE.txt](LICENSE.txt)，开放材料继续按各自许可使用。

## 当前状态

- macOS：0.1.11 Alpha，Apple Silicon。已构建本地测试包；公开下载是否启用以 [release-manifest.json](release-manifest.json) 为准。尚未通过 Apple 公证。
- Windows：0.1.26 Alpha，x64。已在安装后的程序验证五种格式、四种阅读模式、冷热文件递送和重启保存；安装器未做 Authenticode 发布签名。下载和 SHA256 见 [release-manifest.json](release-manifest.json)。原创阅读核心使用发布混淆，用户书库未加密，开放词典及许可保持可读取。
- 跨设备同步：尚未实现，需要同协议的两端更新和真实往返测试。

站点采用静态 HTML/CSS/JavaScript，无分析脚本、远程字体或书籍上传。四种模式的交互是网站示意，不是桌面应用截图或阅读时长模型。

## 中英文网站

首页、下载/安装教程、FAQ、版权、许可与隐私页面均有静态英文版本，位于 `en/`。初次访问默认按浏览器语言偏好显示中文或英文；未支持的语言回退英文，直接访问英文路径也可查看英文。右上角 **中文 / English** 可手动切换，选择通过浏览器 localStorage 保存，优先于自动检测。`?lang=en` / `?lang=zh` 可覆盖当前选择；切换保留页面及锚点。禁用存储时显式语言参数仍可随内部导航保留，禁用 JavaScript 时页面保持各自的静态语言。

不查询 IP/地理位置，不调用翻译 API。网站语言不改变安装包版本、客户端语言或书籍内容。Windows 下载已更新为 0.1.26 公共 Alpha 安装器；Mac 仍为 0.1.11。Windows 新增英文自适应词库、拼音和脚注导航；焦点渲染性能已在本机合成长篇测试验证。

中文页面为编辑源；英文文案在 `translations.en.json` 中维护，运行 `python scripts/build-english.py` 生成四个静态英文页面。发现未翻译中文时生成失败；不使用运行时 `innerHTML` 替换。发布白名单只包含网站文件，不包含阅读器源码或私人数据。

2026-10-06 本地验证：生成四页英文及 JavaScript 语法检查通过。真实 Edge 浏览器验证英文/简体/繁体/其他语言首次选择、手动覆盖与跨页保持、下载锚点、存储禁用、JavaScript 禁用时的静态阅读和中英文链接、英文示意播放/暂停/键盘操作/外观标签；四个英文页面在 320、390、1440px 下无整页横向溢出。未改变下载 manifest 和应用版本。

## 给朋友下载安装

分享 [官网下载安装入口](https://f4freak1995-dev.github.io/focus-reader/#download)。Mac 用户点“下载 Mac 安装包”，下载一个完整 DMG，约 90 MB，适用于 M 系列 Mac；Windows 用户点“下载 Windows 安装包”，下载一个 EXE，按安装向导完成。

安装只需三步：双击下载的 DMG → 把 Focus Reader 拖到 Applications（应用程序）→ 从“应用程序”打开。源码 ZIP、许可附件和校验文件都不是安装必需品。首次打开可能受 macOS 拦截：当前测试版尚未通过 Apple 公证，具体提示处理见官网说明。

遇到“Apple 无法检查其是否包含恶意软件”，见下载区的 [Mac 首次打开详细教程](https://f4freak1995-dev.github.io/focus-reader/#mac-open-help)。包含六步操作、系统设置路径、找不到“仍要打开”时的排查，以及与“已损坏”提示的区别；按 Apple 官方说明整理。

## 版权与通知

[版权与使用](copyright.html) · [第三方许可](third-party.html) · [隐私说明](privacy.html)

程序依赖的完整许可与数据来源单独保留；不能把教育部辞典、CC-CEDICT 等第三方材料声明为本项目独占作品。

GitHub Pages 的发布源使用 GitHub Actions，由 `.github/workflows/pages.yml` 在 `main` 分支更新时发布。工作流逐项复制已批准的网站文件，不将整个工作区上传为站点；官方 Actions 固定提交 SHA，构建不保存 Git 凭据，部署沿用 `github-pages` 环境与分支限制。

不要上传阅读器的 `src`、`src-tauri`、源码交接 ZIP、个人书库、字体、凭据或调试 source map。安装包应通过经过核对的 Release 资产提供。


2026-10-07：Windows 0.1.26 发布，下载一个 EXE 即可安装。保留源码私有，网站提交不包含私人书籍或用户数据库。发布验证与安装器哈希见 release-manifest.json 和 GitHub Release。
