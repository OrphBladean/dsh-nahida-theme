# dsh-nahida-theme · 纳西妲主题

[![license](https://img.shields.io/badge/license-MIT-4e9b3f)](LICENSE)
[![npm](https://img.shields.io/npm/v/dsh-nahida-theme?label=npm&color=4e9b3f)](https://www.npmjs.com/package/dsh-nahida-theme)
[![GitHub stars](https://img.shields.io/github/stars/OrphBladean/dsh-nahida-theme?color=4e9b3f)](https://github.com/OrphBladean/dsh-nahida-theme)
[![Made with DSH](https://img.shields.io/badge/made%20with-DeepSeek%20Harness-4e9b3f)](https://github.com/deepseek-ai/dsh)
[![dsh plugin](https://img.shields.io/badge/dsh-plugin-4e9b3f)](https://github.com/deepseek-ai/dsh)

![纳西妲主题横幅](docs/banner.svg)

把 DSH Web GUI 换成《原神》纳西妲（Nahida）的草元素绿意主题：侧边栏与欢迎页的小鱼换成她，主色、画布与侧边栏换成草元素配色，输入框下方多一句轮换的祝福语，框架里飘着几片半透明的草叶。全部是 CSS 变量与插槽渲染，不改宿主布局、不碰其他插件的 DOM，卸载即还原。

> **English** — A dendro-green Nahida skin for the DSH Web GUI: a small alias-token layer over the active light/dark theme, an original chibi “little radish” brand mark, a rotating localized blessing line below the composer, and click-through drifting leaves. Theme-token overrides only; uninstalling restores everything.
>
> Install (npm): `dsh plugin --profile web add dsh-nahida-theme` — or from GitHub: `dsh plugin --profile web add github:OrphBladean/dsh-nahida-theme`. Reload the page afterwards. UI text follows the DSH locale (zh / en / ja).

> **Made with DSH · 由 DSH 制作**
> 这个插件的代码、文案、原创图标、测试与仓库文档，全部都写在 [DeepSeek Harness](https://github.com/deepseek-ai/dsh) 里：由 DSH agent 编写、在本机 `web` profile 安装、通过插槽与令牌验证，再整理成这个仓库。仓库组织与 README 体例参考了社区里的另一份主题插件 [dsh-cyrene-theme](https://github.com/berhbro/dsh-cyrene-theme)。

## 能力

| 部分 | 实现 |
| --- | --- |
| 主题配色 | 浏览器半端通过 `ctx.theme.overrideTokens()` 叠加一层别名令牌：主品牌色 / 主按钮常态·悬停·禁用、成功状态色、应用画布、侧边栏底色。只加覆盖层，不注册新主题，设置里的「浅色 / 深色 / 跟随系统」照常工作。 |
| 品牌徽记 | 原创「小萝卜」纳西妲徽记：24px 侧边栏品牌位（以 `priority: -10` 覆盖官方小鱼标志）和空白会话欢迎页的品牌位，共用同一个 React 组件。停用插件后官方标志自动回来。 |
| 祝福语 | 注册 `conversation.composer.dock`，在输入框下方显示五瓣小花 + 一句祝福语；每 16 秒淡入轮换，跟随界面语言（zh / en / ja，其他语言回退英文）。 |
| 飘落叶片 | 注册 `shell.overlay` 的一层 `pointer-events: none` 固定画布，5 片原创草叶在视口边缘缓慢摇曳；`prefers-reduced-motion` 下自动静止。 |
| 插件列表 | 独立 `locale/*.json`（en / zh / ja）标题与描述、原创 `icon.svg`；安装后在「设置 → 插件」里可辨认。 |
| 自还原 | 令牌层与全部插槽注册都挂在插件自己的 context/effect 上，停用、卸载或刷新都能完整回收。 |

## 安装

### npm（推荐）

```bash
dsh plugin --profile web add dsh-nahida-theme
```

### GitHub 源（跟随最新提交）

```bash
dsh plugin --profile web add github:OrphBladean/dsh-nahida-theme
```

### 本地目录（开发时）

```bash
dsh plugin --profile web add /path/to/dsh-nahida-theme
```

也可以在 DSH 里用插件管理器 `install_bundle` 安装本目录。安装/启用后刷新一次页面即可看到效果；「设置 → 插件」里会出现带纳西妲图标的「纳西妲主题」。

## 预览

![插件图标](icon.svg)

仓库里的横幅与图标都是为这个主题原创的插画，不是界面截图。本仓库目前不包含 UI 截图：生成它的 DSH 会话运行在无浏览器渲染控制的远程环境里，无法截取真实界面；如果你在本地装好，欢迎把 `docs/screenshots/` 补上真实截图。

## 使用

- 打开任意会话即生效，不需要在设置里切换主题。
- 「浅色 / 深色 / 跟随系统」由 DSH 自己的外观设置控制，本插件会同时覆盖两套色板。
- 祝福语按界面语言切换；文案、轮换间隔、渐变底色都在 `lib/client.js` 顶部集中定义，便于二次修改。
- 系统开启「减少动态效果」时，叶片与祝福语的过渡动画自动关闭，文字与配色仍然保留。
- 不想用时：在「设置 → 插件」停用本插件，或在 profile 里移除 `dsh-nahida-theme`，官方品牌标志与原始配色立即恢复。

## 主题令牌

覆盖层只改动这几个别名令牌（`light` / `dark` 成对给出，避免切到另一套色板时对比度失控）：

| 令牌 | light | dark | 用途 |
| --- | --- | --- | --- |
| `--dsw-alias-brand-primary` | `#3b7a36` | `#9adb6e` | 主品牌色、主按钮填充 |
| `--dsw-alias-button-primary-hover` | `#2f6329` | `#b6ef98` | 主按钮悬停 |
| `--dsw-alias-button-primary-dimmed` | `#e2f1d8` | `#3a4a32` | 主按钮禁用 |
| `--dsw-alias-state-success-primary` | `#3e9b4f` | `#7fd86a` | 成功状态 |
| `--dsw-alias-bg-base` | `#f7fbf1` | `#0f1410` | 应用画布 |
| `--dsw-specific-sidebar-fill` | `#eef6e6` | `#151c14` | 侧边栏底色 |

文字、边框、代码块等令牌保持宿主默认值；插件自己的文字只使用 `--dsw-alias-label-secondary`、`--dsw-alias-border-l2`、`--dsw-alias-state-success-primary` 这类主题令牌，插画才使用固定颜色。

## 结构

```text
dsh-nahida-theme/
├── lib/
│   ├── index.js          # Host 半端：把 bundle 暴露给 Loader（无自有能力）
│   └── client.js         # Client 半端：令牌层、徽记、祝福语、飘落叶片
├── locale/
│   ├── en.json           # 插件管理器元数据：标题 / 描述
│   ├── zh.json
│   └── ja.json
├── docs/
│   └── banner.svg        # 原创主题横幅（插画，不是界面截图）
├── test/
│   ├── smoke.mjs         # 清单 / 资源 / Client 半端插槽与令牌冒烟测试
│   └── contrast.mjs      # 覆盖令牌的 WCAG 对比度检查
├── cordis.patch.yml      # bundle patch：插入 ui-nahida-theme 行
├── icon.svg              # 原创插件图标
├── package.json
├── README.md
└── LICENSE
```

## 自检

不装插件、不开浏览器也能跑：

```bash
node test/smoke.mjs      # manifest、locale、icon、Host 半端、Client 半端 4 处插槽注册
node test/contrast.mjs   # 6 个覆盖令牌 × 深浅两套色板的 WCAG AA 对比度
```

`smoke.mjs` 用 `node:vm` 加一个假的 `__ModuleLoader__`、最小 React stub 和记录型 Cordis context 执行 `lib/client.js`，会真正调用 `apply()` 并渲染 4 个插槽组件，能抓到模块导出、插槽名、优先级、id 与组件渲染层面的低级错误。

## 兼容与已知限制

- 只面向 Web 客户端（`platform: web`），不包含 Host 侧路由或存储；DSH 的 `immediately: true` 立即加载。
- 依赖宿主已有的 `slots`、`theme`、`locale` 服务；服务缺失时插件不会激活，不会影响其他插件。
- 侧边栏品牌位是以更低 `priority` 覆盖官方标志的，属于该插槽允许的替换方式；若未来宿主改了座位或出现同优先级的其他覆盖者，本插件只跳过该处装饰，其余效果不受影响。
- 飘落叶片层为 `pointer-events: none`，不拦截点击；对系统「减少动态效果」做了降级。
- 本仓库不含界面截图，原因见「预览」。
- 与其他主题插件共存时，令牌覆盖层按加载顺序叠加；本插件不修改宿主主题注册表。

## 版权与致谢

- **Unofficial fan project.** 纳西妲（Nahida）及《原神》相关名称、角色设定 © HoYoverse / miHoYo。本插件与 HoYoverse、miHoYo、DeepSeek 均无隶属或背书关系。
- 徽记、叶片、花朵、横幅与插件图标均为本仓库原创的向量插画，**没有使用任何游戏内素材**；角色形象只做了低分辨率 Q 版示意。
- **Made with DSH**: 本项目由 DeepSeek Harness 的 agent 完成编码、安装、验证与文档整理；仓库组织与 README 结构参考了 [dsh-cyrene-theme](https://github.com/berhbro/dsh-cyrene-theme)。感谢 DSH 把插槽、主题令牌与插件管理器开放到可以被这样改造。
- 感谢纳西妲角色带来的灵感。

## 目录

- [能力](#能力)
- [安装](#安装)
- [预览](#预览)
- [使用](#使用)
- [主题令牌](#主题令牌)
- [结构](#结构)
- [自检](#自检)
- [兼容与已知限制](#兼容与已知限制)
- [版权与致谢](#版权与致谢)

## License

[MIT](LICENSE)
