/**
 * Nahida theme — browser half.
 *
 * A presentation-only package: it paints the DSH Web GUI with a taste of the
 * Dendro Archon while leaving the host's layout, controls, and behaviour
 * untouched.
 *
 *   1. Palette  — a small alias-token layer (dendro green accent, warm canvas,
 *                 pale-green sidebar) stacked over the active light/dark theme
 *                 through `ctx.theme.overrideTokens`; no theme is registered,
 *                 so the user's Appearance preference keeps working.
 *   2. Marks    — an original four-leaf-clover emblem replaces the sidebar brand
 *                 mark and fills the blank-session hero mark.
 *   3. Blessing — a quiet rotating line with a five-petal flower below the
 *                 composer, in the user's locale.
 *   4. Leaves   — a few slow, click-through leaves drifting in the frame-wide
 *                 overlay; disabled automatically under reduced motion.
 *   5. Wallpaper— an optional chat-area wallpaper the user picks in the theme's
 *                 own settings page. The picker is reachable from Settings →
 *                 Nahida theme and from a floating clover button at the
 *                 bottom-right of the chat area, and the choice persists in
 *                 browser storage. Only the conversation body is painted.
 *
 * Artwork uses its own literal colours (it is artwork); every container, text
 * colour, and ornament derives from `--dsw-alias-*` theme tokens, so light and
 * dark palettes stay legible. All resources are registered through the plugin
 * context and disposed with it.
 */
window.__ModuleLoader__.load({
  id: 'dsh-nahida-theme',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    // Optional: the theme must keep working where React DOM is not on the table.
    let ReactDOM = null;
    try {
      ReactDOM = require('react-dom');
    } catch (error) {
      ReactDOM = null;
    }
    const asset = typeof require.asset === 'function'
      ? function resolveAsset(reference) { return require.asset(reference); }
      : function plainReference(reference) { return reference; };

    /** Locale namespace owned by this package. */
    const NS = 'nahida-theme';
    /** Theme-token layer identity (one layer per source). */
    const PKG = 'dsh-nahida-theme';

    /** Browser-storage key for the wallpaper choice; bumped when the shape changes. */
    const STORAGE_KEY = 'dsh-nahida-theme:wallpaper:v1';
    const DEFAULT_VEIL = 35;
    const MAX_VEIL = 80;

    /**
     * Alias-token overrides. Each value is a { light, dark } pair because a
     * single value would go illegible in the other colour scheme. Only tokens
     * the theme inspector lists are touched; text and border tokens stay as
     * shipped so contrast and hierarchy are unchanged.
     */
    const TOKENS = {
      '--dsw-alias-brand-primary': { light: '#3b7a36', dark: '#9adb6e' },
      '--dsw-alias-button-primary-hover': { light: '#2f6329', dark: '#b6ef98' },
      '--dsw-alias-button-primary-dimmed': { light: '#e2f1d8', dark: '#3a4a32' },
      '--dsw-alias-state-success-primary': { light: '#3e9b4f', dark: '#7fd86a' },
      '--dsw-alias-bg-base': { light: '#f7fbf1', dark: '#0f1410' },
      '--dsw-specific-sidebar-fill': { light: '#eef6e6', dark: '#151c14' }
    };

    /** Runtime dictionaries; the registered locale service falls back to `en`. */
    const DICTS = {
      zh: {
        quote1: '愿智慧之种，在你心中悄悄开花。',
        quote2: '知识如林，行路的人从不孤单。',
        quote3: '小小的新芽，也终会撑起一片绿荫。',
        nav: '纳西妲主题',
        title: '纳西妲主题',
        subtitle: '给聊天区铺一层草元素的绿意。',
        wallpaper: '聊天区壁纸',
        wallpaperHint: '只在聊天区显示，侧边栏与设置页保持清爽。',
        veil: '柔化遮罩',
        veilHint: '壁纸较花时调高，聊天文字更清楚。',
        creditToggle: '余额与上下文卡片',
        creditToggleHint: '在侧边栏账户按钮上方显示主题自带的余额/上下文卡。如果原来的余额/上下文插件也启用，两张卡会并排；建议先禁用原插件，或在这里关闭主题卡。',
        open: '打开纳西妲主题设置',
        close: '关闭',
        done: '完成',
        inUse: '使用中',
        preview: '预览',
        reset: '恢复默认',
        applyNow: '选择后立即生效',
        emptyTitle: '暂无壁纸',
        emptyHint: '这张图没有加载出来，刷新页面后再试。',
        wallNone: '无壁纸',
        wallBookAfternoon: '书页间的午后',
        wallSumeruLumine: '须弥的合影 · 荧',
        wallSumeruAether: '须弥的合影 · 空',
        wallFlowerSea: '花海与兰那罗',
        wallDreamBubble: '梦泡里的午睡',
        wallFlowerSwing: '花藤秋千',
        wallPaimonStroll: '与派蒙的散步',
        wallDendroLight: '草元素的光',
        wallBlessingLifted: '被托起的祝福',
        wallSwingForTwo: '两个人的秋千',
        wallForestCompanions: '森林里的伙伴',
        wallBarefootGrove: '林间的赤足',
        wallWisdomCradle: '智慧之神的摇篮',
        wallAranaraAfternoon: '兰那罗的午后',
        wallGrassRest: '草地上的小憩'
      },
      en: {
        quote1: 'May the seed of wisdom bloom quietly in your heart.',
        quote2: 'In the forest of knowledge, no traveller walks alone.',
        quote3: 'Even the smallest sprout grows into a canopy of shade.',
        nav: 'Nahida theme',
        title: 'Nahida theme',
        subtitle: 'Let a little dendro green into your chat.',
        wallpaper: 'Chat wallpaper',
        wallpaperHint: 'Shown only in the chat area; the sidebar and settings stay clean.',
        veil: 'Soft veil',
        veilHint: 'Raise it for busy art so chat text stays legible.',
        creditToggle: 'Balance and context card',
        creditToggleHint: 'Show the theme’s balance/context card above the account button. If the old balance/context plugin is also enabled, the two cards sit side by side; disable the old plugin for the intended look.',
        open: 'Open Nahida theme settings',
        close: 'Close',
        done: 'Done',
        inUse: 'In use',
        preview: 'Preview',
        reset: 'Reset',
        applyNow: 'Changes apply immediately',
        emptyTitle: 'No wallpaper',
        emptyHint: 'This image could not load. Refresh the page and try again.',
        wallNone: 'No wallpaper',
        wallBookAfternoon: 'An afternoon among pages',
        wallSumeruLumine: 'Sumeru group · Lumine',
        wallSumeruAether: 'Sumeru group · Aether',
        wallFlowerSea: 'Aranara in the flower sea',
        wallDreamBubble: 'A nap inside a dream bubble',
        wallFlowerSwing: 'The flower-vine swing',
        wallPaimonStroll: 'A walk with Paimon',
        wallDendroLight: 'Dendro light',
        wallBlessingLifted: 'A blessing lifted',
        wallSwingForTwo: 'A swing for two',
        wallForestCompanions: 'Companions in the forest',
        wallBarefootGrove: 'Barefoot in the grove',
        wallWisdomCradle: 'The cradle of wisdom',
        wallAranaraAfternoon: 'An afternoon with Aranara',
        wallGrassRest: 'A rest on the grass'
      },
      ja: {
        quote1: '知恵の種が、あなたの心にそっと花ひらきますように。',
        quote2: '知識の森では、旅人はひとりぼっちじゃない。',
        quote3: '小さな芽も、いつか大きな木陰になる。',
        nav: 'ナヒーダテーマ',
        title: 'ナヒーダテーマ',
        subtitle: 'チャットに草元素の緑をそっと。',
        wallpaper: 'チャットの壁紙',
        wallpaperHint: 'チャット欄だけに表示。サイドバーと設定はそのまま。',
        veil: 'やわらかいベール',
        veilHint: '絵が賑やかなときは上げると読みやすくなります。',
        creditToggle: '残高とコンテキストのカード',
        creditToggleHint: 'サイドバーのアカウントボタン上に、テーマ内蔵の残高/コンテキストカードを表示します。元の残高/コンテキストプラグインも有効な場合、2枚のカードが並びます。元のプラグインを無効にしてください。',
        open: 'ナヒーダテーマ設定を開く',
        close: '閉じる',
        done: '完了',
        inUse: '使用中',
        preview: 'プレビュー',
        reset: 'リセット',
        applyNow: '選ぶとすぐ反映されます',
        emptyTitle: '壁紙なし',
        emptyHint: '画像を読み込めませんでした。ページを再読み込みしてください。',
        wallNone: '壁紙なし',
        wallBookAfternoon: '本のあいだの午後',
        wallSumeruLumine: 'スメールの集合写真・蛍',
        wallSumeruAether: 'スメールの集合写真・空',
        wallFlowerSea: '花畑とアランナラ',
        wallDreamBubble: '夢泡のまどろみ',
        wallFlowerSwing: '花のブランコ',
        wallPaimonStroll: 'パイモンとの散歩',
        wallDendroLight: '草元素の光',
        wallBlessingLifted: '抱き上げられた祝福',
        wallSwingForTwo: 'ふたりのブランコ',
        wallForestCompanions: '森のなかまたち',
        wallBarefootGrove: '森の素足',
        wallWisdomCradle: '知恵の神のゆりかご',
        wallAranaraAfternoon: 'アランナラの午後',
        wallGrassRest: '草地のひとやすみ'
      }
    };
    const QUOTE_KEYS = ['quote1', 'quote2', 'quote3'];

    /** Literal artwork colours (not UI chrome). */
    const ART = {
      leafDeep: '#3e7c3a',
      leafMid: '#6dbe4e',
      leafLight: '#a6dd7e',
      leafPale: '#f1f8e4',
      leafRim: '#cbe7a8',
      face: '#f9fdf1',
      faceShade: '#eaf5d8',
      gold: '#e8c87a',
      goldDeep: '#d2a64f',
      ink: '#2e4a2b',
      cheek: '#f3bfa8',
      stem: '#4f8f3f'
    };

    // ── Artwork ──────────────────────────────────────────────────────────────

    /**
     * Original four-leaf-clover emblem. Four heart-shaped leaves meet at the
     * centre, with a gold pip and a short curved stem; `tone: 'light'` paints a
     * cream clover for the green floating button and the settings badge.
     */
    function CloverMark(props) {
      const size = props.size || 24;
      const light = props.tone === 'light';
      const leafA = light ? '#f7fdf0' : ART.leafMid;
      const leafB = light ? '#e8f7d9' : ART.leafLight;
      const rim = light ? '#cfe8b8' : ART.leafDeep;
      const stem = light ? '#e6f5d6' : ART.stem;
      const core = light ? '#f0d79a' : ART.gold;
      const heart = 'M0 0C-2.4-3.2-9.6-7-9.6-13.2C-9.6-18-5-20.4 0-15.6C5-20.4 9.6-18 9.6-13.2C9.6-7 2.4-3.2 0 0Z';
      const leaves = [0, 1, 2, 3].map(function leaf(index) {
        return h('path', {
          key: index,
          d: heart,
          transform: 'rotate(' + index * 90 + ')',
          fill: index % 2 === 0 ? leafA : leafB,
          stroke: rim,
          strokeWidth: 1.5,
          strokeLinejoin: 'round'
        });
      });
      return h(
        'svg',
        {
          viewBox: '0 0 64 64',
          width: size,
          height: size,
          className: props.className,
          'aria-hidden': true,
          focusable: false,
          style: { display: 'block' }
        },
        h(
          'g',
          { transform: 'translate(32 30)' },
          leaves,
          h('circle', { cx: 0, cy: 0, r: 2.5, fill: core, stroke: light ? '#e2c68a' : ART.goldDeep, strokeWidth: 0.8 }),
          h('path', {
            d: 'M0 2.2C0 8.5 2.2 12.5 5 16',
            fill: 'none',
            stroke: stem,
            strokeWidth: 3.6,
            strokeLinecap: 'round'
          }),
          h('path', {
            d: 'M0.7 2.6C0.7 8.4 2.5 12 4.9 15.2',
            fill: 'none',
            stroke: light ? '#ffffff' : ART.leafLight,
            strokeWidth: 1.1,
            strokeLinecap: 'round',
            opacity: 0.55
          })
        )
      );
    }

    /** A five-petal flower whose petals inherit `currentColor`. */
    function FlowerArt(props) {
      const size = props.size || 14;
      const petals = [];
      for (let index = 0; index < 5; index += 1) {
        petals.push(
          h('ellipse', {
            key: index,
            cx: 12,
            cy: 6.4,
            rx: 3,
            ry: 4.6,
            fill: 'currentColor',
            opacity: 0.9,
            transform: 'rotate(' + index * 72 + ' 12 12)'
          })
        );
      }
      return h(
        'svg',
        { viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': true, focusable: false },
        petals,
        h('circle', { cx: 12, cy: 12, r: 3, fill: ART.gold })
      );
    }

    /** One stylised dendro leaf; `flip` mirrors it for the right-hand side. */
    function LeafArt(props) {
      const size = props.size || 18;
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          'aria-hidden': true,
          focusable: false,
          style: props.flip ? { transform: 'scaleX(-1)', display: 'block' } : { display: 'block' }
        },
        h('path', {
          d: 'M20.5 3.5C11 3.5 4 10 4 19.5c9 0 16.5-7 16.5-16z',
          fill: props.color || ART.leafMid
        }),
        h('path', {
          d: 'M4.5 19C8.5 14 13.5 10 19.5 7',
          fill: 'none',
          stroke: ART.leafDeep,
          strokeWidth: 1.4,
          strokeLinecap: 'round'
        }),
        h('path', {
          d: 'M8.5 17.5C10 15 12 13 14.5 11.5',
          fill: 'none',
          stroke: ART.leafDeep,
          strokeWidth: 1,
          strokeLinecap: 'round',
          opacity: 0.6
        })
      );
    }

    // ── Wallpaper catalogue ──────────────────────────────────────────────────

    /**
     * Shipped chat wallpapers. `fit: 'cover'` fills the chat body; the
     * `fit: 'contain'` branch remains available for future art that must keep
     * its whole composition, over a blurred copy of the same image.
     */
    const WALLPAPERS = [
      { id: 'book-afternoon', file: 'book-afternoon-v1.webp', thumb: 'thumbs/book-afternoon-v1.webp', fit: 'cover', nameKey: 'wallBookAfternoon' },
      { id: 'sumeru-group-lumine', file: 'sumeru-group-lumine-v2.webp', thumb: 'thumbs/sumeru-group-lumine-v2.webp', fit: 'cover', nameKey: 'wallSumeruLumine' },
      { id: 'sumeru-group-aether', file: 'sumeru-group-aether-v2.webp', thumb: 'thumbs/sumeru-group-aether-v2.webp', fit: 'cover', nameKey: 'wallSumeruAether' },
      { id: 'flower-sea-aranara', file: 'flower-sea-aranara-v1.webp', thumb: 'thumbs/flower-sea-aranara-v1.webp', fit: 'cover', nameKey: 'wallFlowerSea' },
      { id: 'dream-bubble', file: 'dream-bubble-v1.webp', thumb: 'thumbs/dream-bubble-v1.webp', fit: 'cover', nameKey: 'wallDreamBubble' },
      { id: 'flower-swing', file: 'flower-swing-v1.webp', thumb: 'thumbs/flower-swing-v1.webp', fit: 'cover', nameKey: 'wallFlowerSwing' },
      { id: 'paimon-stroll', file: 'paimon-stroll-v1.webp', thumb: 'thumbs/paimon-stroll-v1.webp', fit: 'cover', nameKey: 'wallPaimonStroll' },
      { id: 'dendro-light', file: 'dendro-light-v1.webp', thumb: 'thumbs/dendro-light-v1.webp', fit: 'cover', nameKey: 'wallDendroLight' },
      { id: 'blessing-lifted', file: 'blessing-lifted-v1.webp', thumb: 'thumbs/blessing-lifted-v1.webp', fit: 'cover', nameKey: 'wallBlessingLifted' },
      { id: 'swing-for-two', file: 'swing-for-two-v1.webp', thumb: 'thumbs/swing-for-two-v1.webp', fit: 'cover', nameKey: 'wallSwingForTwo' },
      { id: 'forest-companions', file: 'forest-companions-v1.webp', thumb: 'thumbs/forest-companions-v1.webp', fit: 'cover', nameKey: 'wallForestCompanions' },
      { id: 'barefoot-grove', file: 'barefoot-grove-v1.webp', thumb: 'thumbs/barefoot-grove-v1.webp', fit: 'cover', nameKey: 'wallBarefootGrove' },
      { id: 'wisdom-cradle', file: 'wisdom-cradle-v1.webp', thumb: 'thumbs/wisdom-cradle-v1.webp', fit: 'cover', nameKey: 'wallWisdomCradle' },
      { id: 'aranara-afternoon', file: 'aranara-afternoon-v1.webp', thumb: 'thumbs/aranara-afternoon-v1.webp', fit: 'cover', nameKey: 'wallAranaraAfternoon' },
      { id: 'grass-rest', file: 'grass-rest-v1.webp', thumb: 'thumbs/grass-rest-v1.webp', fit: 'cover', nameKey: 'wallGrassRest' }
    ];

    /** Document-relative reference of one packaged wallpaper asset. */
    function wallpaperUrl(file) {
      return asset('plugins/' + PKG + '/assets/wallpapers/' + file);
    }

    // ── Wallpaper preference (browser-local, shared by every slot occupant) ──

    const wallpaperListeners = new Set();
    let savedState;

    function clampVeil(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) return DEFAULT_VEIL;
      return Math.min(MAX_VEIL, Math.max(0, Math.round(number / 5) * 5));
    }

    function readWallpaperState() {
      const fallback = { id: 'none', veil: DEFAULT_VEIL };
      try {
        if (typeof window === 'undefined' || window.localStorage === undefined) return fallback;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw === null || raw === '') return fallback;
        const parsed = JSON.parse(raw);
        const known = parsed !== null && typeof parsed === 'object'
          && (parsed.id === 'none' || WALLPAPERS.some(function sameId(wall) { return wall.id === parsed.id; }));
        return {
          id: known ? parsed.id : fallback.id,
          veil: clampVeil(parsed === null || typeof parsed !== 'object' ? DEFAULT_VEIL : parsed.veil)
        };
      } catch (error) {
        return fallback;
      }
    }

    function currentWallpaperState() {
      if (savedState === undefined) savedState = readWallpaperState();
      return savedState;
    }

    function notifyWallpaper() {
      for (const listener of Array.from(wallpaperListeners)) {
        try {
          listener();
        } catch (error) {
          console.warn('nahida-theme: wallpaper listener failed', error);
        }
      }
    }

    function updateWallpaper(patch) {
      const previous = currentWallpaperState();
      const next = {
        id: patch.id !== undefined ? patch.id : previous.id,
        veil: patch.veil !== undefined ? clampVeil(patch.veil) : previous.veil
      };
      if (next.id !== 'none' && !WALLPAPERS.some(function sameId(wall) { return wall.id === next.id; })) {
        next.id = 'none';
      }
      savedState = next;
      try {
        if (typeof window !== 'undefined' && window.localStorage !== undefined) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch (error) {
        /* Storage can be unavailable; the choice still applies to this page. */
      }
      notifyWallpaper();
    }

    function subscribeWallpaper(listener) {
      wallpaperListeners.add(listener);
      return function unsubscribeWallpaper() {
        wallpaperListeners.delete(listener);
      };
    }

    function useWallpaperState() {
      const [state, setState] = React.useState(currentWallpaperState);
      React.useEffect(function followWallpaper() {
        return subscribeWallpaper(function refreshWallpaper() {
          setState(currentWallpaperState());
        });
      }, []);
      return state;
    }

    // ── Embedded balance/context card preference ───────────────────────────
    const CREDIT_STORAGE_KEY = 'dsh-nahida-theme:credit:v1';
    const creditListeners = new Set();
    let creditSaved;

    function readCreditEnabled() {
      try {
        if (typeof window !== 'undefined' && window.localStorage !== undefined) {
          const raw = window.localStorage.getItem(CREDIT_STORAGE_KEY);
          if (raw === null || raw === '') return true;
          const parsed = JSON.parse(raw);
          return !(parsed !== null && typeof parsed === 'object' && parsed.enabled === false);
        }
      } catch (error) {
        /* Storage can be unavailable; default to showing the card. */
      }
      return true;
    }

    function currentCreditEnabled() {
      if (creditSaved === undefined) creditSaved = readCreditEnabled();
      return creditSaved;
    }

    function setCreditEnabled(enabled) {
      creditSaved = enabled === true;
      try {
        if (typeof window !== 'undefined' && window.localStorage !== undefined) {
          window.localStorage.setItem(CREDIT_STORAGE_KEY, JSON.stringify({ enabled: creditSaved }));
        }
      } catch (error) {
        /* The choice still applies to this page. */
      }
      for (const listener of Array.from(creditListeners)) {
        try {
          listener();
        } catch (error) {
          console.warn('nahida-theme: credit setting listener failed', error);
        }
      }
    }

    function subscribeCreditEnabled(listener) {
      creditListeners.add(listener);
      return function unsubscribeCreditEnabled() {
        creditListeners.delete(listener);
      };
    }

    function useCreditEnabled() {
      const [enabled, setEnabled] = React.useState(currentCreditEnabled);
      React.useEffect(function followCreditSetting() {
        return subscribeCreditEnabled(function refreshCreditSetting() {
          setEnabled(currentCreditEnabled());
        });
      }, []);
      return enabled;
    }

    function wallpaperById(id) {
      for (const wall of WALLPAPERS) {
        if (wall.id === id) return wall;
      }
      return undefined;
    }

    // ── Styles ───────────────────────────────────────────────────────────────

    const THEME_CSS = `
/* Selected text: opaque grass green with dark ink so both light and dark
   palettes keep the selected words readable. */
::selection{background:#7cc85a;color:#0f260d}

/* Simple transparent green panes: one flat colour with alpha, no blur and no
   frame. A faint four-leaf clover sits behind the content as the only mark. */
[data-conversation-content] [data-composer-card],
[data-conversation-content] [data-presented-file],
[data-conversation-content] [data-plan-card],
[data-conversation-content] [data-tool="schedule_create"],
[data-conversation-content] [data-tool="pwsh"] > [data-open="true"][class*="_root_"],
[data-conversation-content] [style*="--dsw-alias-bg-layer-1"][style*="--dsw-alias-border-l1"]{
  position:relative;
  --dsh-nahida-clover:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cg transform='translate(60 60)' fill='%234a9f3a' fill-opacity='.04' stroke='%234a9f3a' stroke-opacity='.45' stroke-width='1.6' stroke-linejoin='round'%3E%3Cpath d='M0,0C-7-8-9-22 0-34C9-22 7-8 0 0Z'/%3E%3Cpath d='M0,0C-7-8-9-22 0-34C9-22 7-8 0 0Z' transform='rotate(90)'/%3E%3Cpath d='M0,0C-7-8-9-22 0-34C9-22 7-8 0 0Z' transform='rotate(180)'/%3E%3Cpath d='M0,0C-7-8-9-22 0-34C9-22 7-8 0 0Z' transform='rotate(270)'/%3E%3Ccircle r='3' fill='%234a9f3a' fill-opacity='.4'/%3E%3C/g%3E%3C/svg%3E");
  --dsw-alias-label-primary:#0b2a1b;
  --dsw-alias-label-primary-dimmed:#143a27;
  --dsw-alias-label-secondary:#143a27;
  --dsw-alias-label-tertiary:#1f4a32;
  --dsw-alias-label-caption:#24503a;
  --dsw-alias-label-on-color:#ffffff;
  --dsw-alias-border-l1:rgba(12,90,50,.32);
  --dsw-alias-border-l2:rgba(12,90,50,.42);
  --dsw-alias-border-l3:rgba(12,90,50,.24);
  --dsw-alias-interactive-bg-hover:rgba(12,90,50,.12);
  --dsw-alias-card-tile-fill:rgba(12,90,50,.14);
  --dsw-alias-button-floating-fill:rgba(12,90,50,.12);
  --dsw-alias-button-floating-hover:rgba(12,90,50,.24);
  --dsw-alias-link:#0a3a22;
  --dsw-alias-markdown-placeholder:#1f4a32;
  --dsw-alias-state-idle-primary:#1f4a32;
  --dsw-alias-state-success-primary:#0a3a22;
  color:#0b2a1b;
  border:none!important;
  outline:none!important;
  box-shadow:none!important;
}
[data-conversation-content] [data-composer-card]{
  background:rgba(10,66,38,.22);
}
/* The pwsh "run command" tool card: its visible white shell is the
   DisclosureRow root inside the tool row; the terminal is a [data-terminal]
   block. Match the composer's flat translucent pane and watermark. */
[data-conversation-content] [data-tool="pwsh"] > [data-open="true"][class*="_root_"]{
  background:rgba(10,66,38,.22)!important;
  background-image:var(--dsh-nahida-clover)!important;
  background-position:center center!important;
  background-repeat:no-repeat!important;
  background-size:96px 96px!important;
  border:none!important;
  box-shadow:none!important;
  color:var(--dsw-alias-label-primary);
}
[data-conversation-content] [data-tool="pwsh"] [data-terminal]{
  background:rgba(10,66,38,.14)!important;
  border:none!important;
  box-shadow:none!important;
}
[data-conversation-content] [data-tool="pwsh"] [data-terminal] > div{
  background:transparent!important;
}
[data-conversation-content] [data-presented-file]{
  --deliverable-fill:rgba(10,66,38,.22);
  --deliverable-hover:rgba(10,66,38,.3);
  background:var(--deliverable-fill);
}
[data-conversation-content] [data-plan-card]{
  --plan-card-fill:rgba(10,66,38,.22);
  --plan-card-hover:rgba(10,66,38,.3);
  background:var(--plan-card-fill);
}
[data-conversation-content] [data-tool="schedule_create"]{
  --card-fill:rgba(10,66,38,.22);
  --card-hover:rgba(10,66,38,.3);
  background:var(--card-fill);
}
[data-conversation-content] [data-tool="schedule_create"] button:not(:first-of-type){
  background:rgba(12,90,50,.12);
  box-shadow:inset 0 0 0 .5px rgba(12,90,50,.35);
  color:var(--dsw-alias-label-primary);
}
[data-conversation-content] [data-tool="schedule_create"] button:not(:first-of-type):hover{
  background:rgba(12,90,50,.24);
}
/* Third-party kickoff bar (论衡开工台) draws its card with inline semantic
   tokens; overriding those tokens is enough for its inline colours to follow. */
[data-conversation-content] [style*="--dsw-alias-bg-layer-1"][style*="--dsw-alias-border-l1"]{
  --dsw-alias-bg-layer-1:rgba(10,66,38,.22);
  --dsw-alias-bg-layer-2:rgba(12,90,50,.12);
  --dsw-alias-bg-layer-3:rgba(10,66,38,.3);
}
/* The only decoration: a centred, very faint four-leaf clover under the text. */
[data-conversation-content] :is([data-composer-card],[data-presented-file],[data-plan-card],[data-tool="schedule_create"],[style*="--dsw-alias-bg-layer-1"][style*="--dsw-alias-border-l1"]){
  background-image:var(--dsh-nahida-clover);
  background-position:center center;
  background-repeat:no-repeat;
  background-size:contain;
}
[data-conversation-content] [style*="--dsw-alias-bg-layer-1"][style*="--dsw-alias-border-l1"]{
  background-image:var(--dsh-nahida-clover)!important;
  background-position:center center!important;
  background-repeat:no-repeat!important;
  background-size:contain!important;
}
/* The lunheng form's primary/selected buttons paint with
   --dsw-alias-state-success-primary and use --dsw-alias-bg-layer-1 as their
   text colour; that token is our translucent pane fill, so force white ink. */
[data-conversation-content] [style*="--dsw-alias-bg-layer-1"][style*="--dsw-alias-border-l1"] button[style*="--dsw-alias-state-success-primary"]{
  color:#ffffff!important;
}
[data-conversation-content] [data-presented-file] button:not(:first-of-type){
  background:rgba(12,90,50,.12);
  box-shadow:inset 0 0 0 .5px rgba(12,90,50,.35);
  color:var(--dsw-alias-label-primary);
}
[data-conversation-content] [data-presented-file] button:not(:first-of-type):hover{
  background:rgba(12,90,50,.24);
}

/* Terminal caret: a DOS-style green underscore instead of the thin OS bar.
   Chromium honours caret-shape on inputs; the contenteditable composer also
   gets a hand-drawn blinking underscore (the native caret is hidden there). */
[data-conversation-content] [contenteditable="true"],
[data-conversation-content] [contenteditable=""],
[data-conversation-content] textarea,
[data-conversation-content] input{
  caret-color:#0b4a28;
  caret-shape:underscore;
}
.dsh-nahida-caret-host{caret-color:transparent!important}
.dsh-nahida-caret{position:fixed;z-index:60;height:2px;border-radius:1px;background:#0b4a28;pointer-events:none;box-shadow:0 0 5px rgba(11,74,40,.45);animation:dsh-nahida-caret-blink 1s steps(1,end) infinite}
@keyframes dsh-nahida-caret-blink{0%,49%{opacity:1}50%,100%{opacity:0}}

.dsh-nahida-dock{display:flex;align-items:center;justify-content:center;gap:9px;padding:3px 12px;min-height:24px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);letter-spacing:.05em;user-select:none;pointer-events:none;overflow:hidden}
.dsh-nahida-rule{display:block;height:1px;width:clamp(20px,7vw,64px);flex:none;background:linear-gradient(90deg,transparent,var(--dsw-alias-border-l2));border-radius:1px}
.dsh-nahida-rule--end{transform:scaleX(-1)}
.dsh-nahida-flower{display:inline-flex;align-items:center;flex:none;color:var(--dsw-alias-state-success-primary);opacity:.85}
.dsh-nahida-quote{max-width:min(72vw,560px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;animation:dsh-nahida-quote-in 1.1s ease both}
@keyframes dsh-nahida-quote-in{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
.dsh-nahida-leaves{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0;contain:layout style paint}
.dsh-nahida-leaf{position:absolute;display:block;will-change:transform;animation-name:dsh-nahida-sway;animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-direction:alternate;filter:drop-shadow(0 2px 3px rgba(63,125,58,.10))}
@keyframes dsh-nahida-sway{0%{transform:translate3d(0,0,0) rotate(-6deg)}35%{transform:translate3d(7px,-12px,0) rotate(7deg)}70%{transform:translate3d(-5px,-24px,0) rotate(-5deg)}100%{transform:translate3d(3px,-36px,0) rotate(6deg)}}

/* The chat wallpaper is one painter behind the conversation body. Negative
   z-index needs the body to be its own stacking context; isolating it only
   while the painter exists keeps every other composition untouched. */
[data-conversation-content]:has(.dsh-nahida-wallpaper){isolation:isolate}
.dsh-nahida-wallpaper{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:var(--dsw-alias-bg-base)}
.dsh-nahida-wallpaper__cover{position:absolute;inset:0;background-position:center center;background-repeat:no-repeat;background-size:cover}
.dsh-nahida-wallpaper__blur{position:absolute;inset:-36px;background-position:center center;background-repeat:no-repeat;background-size:cover;filter:blur(26px) saturate(1.08);transform:scale(1.04);opacity:.58}
.dsh-nahida-wallpaper__contain{position:absolute;inset:0;background-position:center center;background-repeat:no-repeat;background-size:contain}
.dsh-nahida-wallpaper__veil{position:absolute;inset:0;background:color-mix(in srgb,var(--dsw-alias-bg-base) var(--dsh-nahida-veil,35%),transparent)}

/* Floating clover: a page-level settings entry inside the chat body. */
.dsh-nahida-fab-seat{position:absolute;right:72px;bottom:22px;z-index:12;pointer-events:none;transition:bottom .2s ease}
.dsh-nahida-fab{pointer-events:auto;box-sizing:border-box;width:38px;height:38px;padding:0;border-radius:50%;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 36%,var(--dsw-alias-border-l2));background:linear-gradient(140deg,#74c455,#3e7c3a);display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 22px rgba(36,78,32,.28),0 0 0 4px color-mix(in srgb,var(--dsw-alias-brand-primary) 9%,transparent);transition:transform .16s ease,box-shadow .16s ease}
@media (hover:hover){.dsh-nahida-fab:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 12px 26px rgba(36,78,32,.34),0 0 0 5px color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent)}}
.dsh-nahida-fab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}

/* Theme settings dialog (the in-Settings section reuses the panel inside). */
.dsh-nahida-modal{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;padding:24px;pointer-events:none}
.dsh-nahida-modal__mask{position:absolute;inset:0;pointer-events:auto;background:var(--dsw-alias-bg-mask-1,rgba(15,20,16,.36));backdrop-filter:var(--dsw-mask-blur,blur(7px))}
.dsh-nahida-modal__panel{position:relative;pointer-events:auto;display:flex;flex-direction:column;width:min(800px,calc(100vw - 40px));max-height:min(86vh,820px);overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);border:0.5px solid var(--dsw-alias-border-l2);border-radius:18px;box-shadow:0 28px 90px rgba(18,42,18,.34);animation:dsh-nahida-modal-in .18s ease both}
@keyframes dsh-nahida-modal-in{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
.dsh-nahida-panel{display:flex;flex-direction:column;min-height:0;width:100%}
.dsh-nahida-panel__head{display:flex;align-items:flex-start;gap:12px;padding:20px 20px 12px;flex:none}
.dsh-nahida-panel__badge{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(140deg,#74c455,#3e7c3a);box-shadow:0 4px 14px rgba(36,78,32,.22);margin-top:1px}
.dsh-nahida-panel__heading{flex:1;min-width:0}
.dsh-nahida-panel__title{font-size:16px;font-weight:600;line-height:22px;color:var(--dsw-alias-label-primary)}
.dsh-nahida-panel__subtitle{margin-top:2px;font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary)}
.dsh-nahida-close{flex:none;width:28px;height:28px;margin:-2px -4px 0 0;padding:0;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer}
@media (hover:hover){.dsh-nahida-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.dsh-nahida-close:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-nahida-panel__scroll{flex:1;min-height:0;overflow-y:auto;padding:2px 20px 14px;scrollbar-gutter:stable}
.dsh-nahida-preview{position:relative;height:152px;margin:2px 0 18px;border-radius:14px;overflow:hidden;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1)}
.dsh-nahida-preview__cover{position:absolute;inset:0;background-position:center center;background-repeat:no-repeat;background-size:cover}
.dsh-nahida-preview__contain{position:absolute;inset:0;background-position:center center;background-repeat:no-repeat;background-size:contain}
.dsh-nahida-preview__veil{position:absolute;inset:0;background:color-mix(in srgb,var(--dsw-alias-bg-base) var(--dsh-nahida-veil,35%),transparent)}
.dsh-nahida-preview__empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:12px;background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent) 0 10px,transparent 10px 20px)}
.dsh-nahida-preview__label{position:absolute;left:10px;top:10px;padding:3px 9px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 72%,transparent);backdrop-filter:blur(8px);font-size:11px;line-height:15px;color:var(--dsw-alias-label-secondary);letter-spacing:.04em}
.dsh-nahida-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 8px}
.dsh-nahida-section-title{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsh-nahida-section-hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);text-align:right;flex:1;min-width:0}
.dsh-nahida-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 10px}
@media (max-width:660px){.dsh-nahida-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.dsh-nahida-tile{display:flex;flex-direction:column;gap:6px;padding:0;border:none;background:transparent;text-align:left;color:inherit;font:inherit;cursor:pointer;min-width:0}
.dsh-nahida-tile__art{position:relative;aspect-ratio:16/10;border-radius:12px;overflow:hidden;border:1.5px solid color-mix(in srgb,var(--dsw-alias-border-l2) 80%,transparent);background:var(--dsw-alias-bg-layer-1);transition:border-color .16s ease,box-shadow .16s ease,transform .16s ease}
.dsh-nahida-tile__art img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
@media (hover:hover){.dsh-nahida-tile:hover .dsh-nahida-tile__art{transform:translateY(-1px);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,var(--dsw-alias-border-l2))}.dsh-nahida-tile:hover .dsh-nahida-tile__art img{transform:scale(1.045)}}
.dsh-nahida-tile[aria-pressed='true'] .dsh-nahida-tile__art{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent)}
.dsh-nahida-tile__check{position:absolute;z-index:2;right:8px;top:8px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:var(--dsw-alias-brand-primary);color:#fff;opacity:0;transform:scale(.72);transition:opacity .16s ease,transform .16s ease;box-shadow:0 2px 8px rgba(20,50,20,.28)}
.dsh-nahida-tile[aria-pressed='true'] .dsh-nahida-tile__check{opacity:1;transform:none}
.dsh-nahida-tile__name{font-size:12px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-nahida-tile[aria-pressed='true'] .dsh-nahida-tile__name{color:var(--dsw-alias-label-primary);font-weight:500}
.dsh-nahida-tile--none .dsh-nahida-tile__art{display:grid;place-items:center;border-style:dashed;border-color:var(--dsw-alias-border-l3);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 82%,transparent)}
.dsh-nahida-tile--none .dsh-nahida-tile__art::after{content:'';position:absolute;left:17%;right:17%;top:50%;height:1.5px;border-radius:1px;background:var(--dsw-alias-label-tertiary);opacity:.45;transform:rotate(-18deg)}
.dsh-nahida-row{display:flex;align-items:center;gap:14px;margin-top:16px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l3);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}
.dsh-nahida-row__text{flex:1;min-width:0}
.dsh-nahida-row__label{font-size:13px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-primary)}
.dsh-nahida-row__hint{margin-top:2px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.dsh-nahida-row__value{flex:none;min-width:38px;text-align:right;font-size:12px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}
.dsh-nahida-row--switch{align-items:center}
.dsh-nahida-switch{position:relative;flex:none;width:40px;height:23px;padding:0;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover);cursor:pointer;transition:background-color .16s,border-color .16s}
.dsh-nahida-switch__knob{position:absolute;left:2px;top:2px;width:17px;height:17px;border-radius:50%;background:var(--dsw-alias-bg-base);box-shadow:0 1px 3px rgba(0,0,0,.18);transition:transform .16s}
.dsh-nahida-switch[data-on='true']{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.dsh-nahida-switch[data-on='true'] .dsh-nahida-switch__knob{transform:translateX(17px)}
.dsh-nahida-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-nahida-range{flex:none;width:150px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}
.dsh-nahida-range:disabled{opacity:.4;cursor:default}
.dsh-nahida-panel__foot{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 20px 16px;border-top:0.5px solid var(--dsw-alias-border-l3)}
.dsh-nahida-panel__note{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.dsh-nahida-panel__actions{display:flex;align-items:center;gap:8px;flex:none}
.dsh-nahida-btn{box-sizing:border-box;padding:6px 13px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;font-weight:500;font-family:inherit;cursor:pointer;transition:background .14s ease,border-color .14s ease}
@media (hover:hover){.dsh-nahida-btn:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l3)}}
.dsh-nahida-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-nahida-btn--primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-on-color)}
@media (hover:hover){.dsh-nahida-btn--primary:hover{background:var(--dsw-alias-button-primary-hover);border-color:transparent}}
.dsh-nahida-settings-icon{display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);opacity:.92}
.dsh-nahida-settings-icon[data-active='true']{opacity:1}

@media (prefers-reduced-motion:reduce){
  .dsh-nahida-quote,.dsh-nahida-leaf,.dsh-nahida-modal__panel,.dsh-nahida-fab{animation:none;transition:none}
}

/* ── Embedded balance + context card (Nahida E-skill frame) ─────────────── */
.dsh-nahida-credit{
  --dsh-nahida-credit-corner:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12,1c1.2,5,4.8,8.6,10,9.8c-5.2,1.2-8.8,4.8-10,10c-1.2-5.2-4.8-8.8-10-10c5.2-1.2,8.8-4.8,10-9.8z' fill='%23b6ff8a' stroke='%23ecffd8' stroke-width='.8'/%3E%3Ccircle cx='12' cy='12' r='2.1' fill='%23ecffd8'/%3E%3C/svg%3E");
  --dsh-nahida-credit-flower:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cg transform='translate(60 60)' fill='%23b6ff8a' fill-opacity='.03' stroke='%23b6ff8a' stroke-opacity='.16' stroke-width='1.6' stroke-linejoin='round'%3E%3Cpath d='M0,0C-7-8-9-22 0-34C9-22 7-8 0 0Z'/%3E%3Cpath d='M0,0C-7-8-9-22 0-34C9-22 7-8 0 0Z' transform='rotate(90)'/%3E%3Cpath d='M0,0C-7-8-9-22 0-34C9-22 7-8 0 0Z' transform='rotate(180)'/%3E%3Cpath d='M0,0C-7-8-9-22 0-34C9-22 7-8 0 0Z' transform='rotate(270)'/%3E%3Ccircle r='3' fill='%23b6ff8a' fill-opacity='.4'/%3E%3C/g%3E%3C/svg%3E");
  position:relative;
  isolation:isolate;
  display:flex;
  flex-direction:column;
  gap:8px;
  width:100%;
  min-width:0;
  margin:0 0 4px;
  padding:10px 11px 14px;
  border-radius:12px;
  box-sizing:border-box;
  background-color:rgba(4,32,19,.68);
  background-image:var(--dsh-nahida-credit-flower);
  background-position:center center;
  background-repeat:no-repeat;
  background-size:84px 84px;
  backdrop-filter:blur(9px) brightness(.55) saturate(.95);
  color:#ecffe4;
  font-size:12px;
  line-height:18px;
}
.dsh-nahida-credit > *{position:relative;z-index:3;min-width:0}
.dsh-nahida-credit::before{
  content:'';
  position:absolute;
  inset:0;
  z-index:2;
  border-radius:inherit;
  pointer-events:none;
  border:1px solid rgba(176,255,138,.9);
  box-shadow:
    0 0 1px rgba(230,255,210,.9),
    0 0 9px rgba(150,255,110,.55),
    0 0 18px rgba(100,230,70,.28),
    inset 0 0 10px rgba(130,255,100,.3);
  background-image:var(--dsh-nahida-credit-corner),var(--dsh-nahida-credit-corner),var(--dsh-nahida-credit-corner),var(--dsh-nahida-credit-corner);
  background-position:left 0 top 0,right 0 top 0,left 0 bottom 0,right 0 bottom 0;
  background-repeat:no-repeat;
  background-size:16px 16px;
}
.dsh-nahida-credit::after{
  content:'';
  position:absolute;
  inset:3px;
  z-index:1;
  border-radius:inherit;
  pointer-events:none;
  opacity:.8;
  background-image:
    radial-gradient(circle,rgba(200,255,170,.95) 1.1px,transparent 1.7px),
    radial-gradient(circle,rgba(200,255,170,.95) 1.1px,transparent 1.7px),
    radial-gradient(circle,rgba(200,255,170,.95) 1.1px,transparent 1.7px),
    radial-gradient(circle,rgba(200,255,170,.95) 1.1px,transparent 1.7px);
  background-position:0 0,0 100%,0 0,100% 0;
  background-repeat:repeat-x,repeat-x,repeat-y,repeat-y;
  background-size:10px 10px,10px 10px,10px 10px,10px 10px;
}
.dsh-nahida-credit__head{display:flex;align-items:center;gap:6px;color:#d9f3d0;font-weight:600;font-size:12px;line-height:18px}
.dsh-nahida-credit__title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-nahida-credit__group{display:flex;flex-direction:column;gap:2px}
.dsh-nahida-credit__label{color:#8fbc86;font-size:10.5px;line-height:15px;letter-spacing:.02em}
.dsh-nahida-credit__row{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.dsh-nahida-credit__row-label{color:#a9d4a0;flex:none}
.dsh-nahida-credit__row-value{color:#ecffe4;font-weight:500;font-variant-numeric:tabular-nums;text-align:right;overflow-wrap:anywhere}
.dsh-nahida-credit__status{color:#a9d4a0;overflow-wrap:anywhere}
.dsh-nahida-credit__status[data-tone='error']{color:#ffb4a8}
.dsh-nahida-credit__bar{height:4px;border-radius:999px;background:rgba(160,255,130,.18);overflow:hidden}
.dsh-nahida-credit__bar > i{display:block;height:100%;border-radius:999px;background:#b6ff9a}
.dsh-nahida-credit__bar > i[data-warn='true']{background:#ffd27a}
.dsh-nahida-credit-rail{display:flex;flex-direction:column;align-items:center;gap:2px;padding:2px 0 4px;color:var(--dsw-alias-label-secondary);font-size:10px;line-height:13px;font-variant-numeric:tabular-nums}
.dsh-nahida-credit-rail__percent{color:var(--dsw-alias-label-tertiary);white-space:nowrap}

`;

    // ── Blessing line (conversation.composer.dock) ───────────────────────────

    function NahidaBlessing(props) {
      const [index, setIndex] = React.useState(0);
      React.useEffect(function startRotation() {
        const timer = window.setInterval(function rotate() {
          setIndex(function next(value) {
            return (value + 1) % QUOTE_KEYS.length;
          });
        }, 16000);
        return function stopRotation() {
          window.clearInterval(timer);
        };
      }, []);
      const key = QUOTE_KEYS[index % QUOTE_KEYS.length];
      return h(
        'div',
        { className: 'dsh-nahida-dock', 'aria-hidden': true },
        h('span', { className: 'dsh-nahida-rule' }),
        h('span', { className: 'dsh-nahida-flower' }, h(FlowerArt, { size: 13 })),
        h('span', { key: key, className: 'dsh-nahida-quote' }, props.t(key)),
        h('span', { className: 'dsh-nahida-flower' }, h(FlowerArt, { size: 13 })),
        h('span', { className: 'dsh-nahida-rule dsh-nahida-rule--end' })
      );
    }

    // ── Drifting leaves (shell.overlay) ──────────────────────────────────────

    const LEAVES = [
      { top: '9%', left: '3%', size: 20, delay: '0s', duration: '21s', color: ART.leafMid, opacity: 0.26, flip: false },
      { top: '24%', right: '5%', size: 15, delay: '4s', duration: '26s', color: ART.leafLight, opacity: 0.2, flip: true },
      { top: '62%', left: '6%', size: 17, delay: '8s', duration: '24s', color: ART.leafDeep, opacity: 0.22, flip: true },
      { top: '78%', right: '4%', size: 22, delay: '2s', duration: '29s', color: ART.leafMid, opacity: 0.24, flip: false },
      { top: '44%', right: '12%', size: 12, delay: '11s', duration: '19s', color: ART.leafLight, opacity: 0.18, flip: false }
    ];

    function NahidaLeaves() {
      const nodes = LEAVES.map(function leaf(item, index) {
        return h(
          'span',
          {
            key: index,
            className: 'dsh-nahida-leaf',
            style: {
              top: item.top,
              left: item.left,
              right: item.right,
              opacity: item.opacity,
              animationDelay: item.delay,
              animationDuration: item.duration
            }
          },
          h(LeafArt, { size: item.size, color: item.color, flip: item.flip })
        );
      });
      return h('div', { className: 'dsh-nahida-leaves', 'aria-hidden': true }, nodes);
    }

    // ── Wallpaper painter (conversation.hero.frame HOC) ──────────────────────

    function WallpaperPainter(props) {
      const wall = props.wall;
      const image = 'url("' + wallpaperUrl(wall.file) + '")';
      const style = { backgroundImage: image };
      return h(
        'div',
        {
          className: 'dsh-nahida-wallpaper',
          'aria-hidden': true,
          'data-nahida-wallpaper': wall.id,
          style: { '--dsh-nahida-veil': (props.veil || 0) + '%' }
        },
        wall.fit === 'contain'
          ? [
            h('div', { key: 'blur', className: 'dsh-nahida-wallpaper__blur', style: style }),
            h('div', { key: 'art', className: 'dsh-nahida-wallpaper__contain', style: style })
          ]
          : h('div', { className: 'dsh-nahida-wallpaper__cover', style: style }),
        h('div', { className: 'dsh-nahida-wallpaper__veil' })
      );
    }

    function CheckIcon(props) {
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: props.size || 12, height: props.size || 12, 'aria-hidden': true, focusable: false },
        h('path', {
          d: 'M3.2 8.4l3 3 6.6-6.8',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        })
      );
    }

    function CloseIcon() {
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true, focusable: false },
        h('path', {
          d: 'M3.6 3.6l8.8 8.8M12.4 3.6l-8.8 8.8',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round'
        })
      );
    }

    // ── Theme settings panel ─────────────────────────────────────────────────

    function NahidaSettingsPanel(props) {
      const state = useWallpaperState();
      const wall = wallpaperById(state.id);
      const titleId = props.titleId || 'dsh-nahida-settings-title';
      const setWallpaper = function setWallpaper(id) {
        updateWallpaper({ id: id });
      };
      const setVeil = function setVeil(value) {
        updateWallpaper({ veil: value });
      };
      const reset = function reset() {
        updateWallpaper({ id: 'none', veil: DEFAULT_VEIL });
      };
      const creditEnabled = useCreditEnabled();

      const tileNodes = [
        h(
          'button',
          {
            key: 'none',
            type: 'button',
            className: 'dsh-nahida-tile dsh-nahida-tile--none',
            'aria-pressed': wall === undefined,
            onClick: function pickNone() { setWallpaper('none'); }
          },
          h(
            'span',
            { className: 'dsh-nahida-tile__art' },
            h('span', { style: { opacity: 0.35, display: 'block' } }, h(CloverMark, { size: 40 })),
            h('span', { className: 'dsh-nahida-tile__check' }, h(CheckIcon))
          ),
          h('span', { className: 'dsh-nahida-tile__name' }, props.t('wallNone'))
        )
      ];
      for (const item of WALLPAPERS) {
        const active = wall !== undefined && wall.id === item.id;
        tileNodes.push(
          h(
            'button',
            {
              key: item.id,
              type: 'button',
              className: 'dsh-nahida-tile',
              'aria-pressed': active,
              title: props.t(item.nameKey),
              onClick: function pickWallpaper() { setWallpaper(item.id); }
            },
            h(
              'span',
              { className: 'dsh-nahida-tile__art' },
              h('img', {
                src: wallpaperUrl(item.thumb),
                alt: '',
                loading: 'lazy',
                decoding: 'async',
                draggable: false,
                onError: function hideBroken(event) { event.currentTarget.style.display = 'none'; }
              }),
              h('span', { className: 'dsh-nahida-tile__check' }, h(CheckIcon))
            ),
            h('span', { className: 'dsh-nahida-tile__name' }, props.t(item.nameKey))
          )
        );
      }

      let preview;
      if (wall === undefined) {
        preview = h(
          'div',
          { className: 'dsh-nahida-preview', 'aria-hidden': true },
          h(
            'div',
            { className: 'dsh-nahida-preview__empty' },
            h(CloverMark, { size: 34 }),
            h('span', null, props.t('emptyTitle'))
          )
        );
      } else {
        const image = 'url("' + wallpaperUrl(wall.file) + '")';
        preview = h(
          'div',
          {
            className: 'dsh-nahida-preview',
            'aria-hidden': true,
            style: { '--dsh-nahida-veil': state.veil + '%' }
          },
          wall.fit === 'contain'
            ? [
              h('div', { key: 'blur', className: 'dsh-nahida-wallpaper__blur', style: { backgroundImage: image } }),
              h('div', { key: 'art', className: 'dsh-nahida-preview__contain', style: { backgroundImage: image } })
            ]
            : h('div', { className: 'dsh-nahida-preview__cover', style: { backgroundImage: image } }),
          h('div', { className: 'dsh-nahida-preview__veil' }),
          h('span', { className: 'dsh-nahida-preview__label' }, props.t('preview'))
        );
      }

      return h(
        'div',
        { className: 'dsh-nahida-panel' },
        h(
          'div',
          { className: 'dsh-nahida-panel__head' },
          h('span', { className: 'dsh-nahida-panel__badge' }, h(CloverMark, { size: 24, tone: 'light' })),
          h(
            'div',
            { className: 'dsh-nahida-panel__heading' },
            h('div', { className: 'dsh-nahida-panel__title', id: titleId }, props.t('title')),
            h('div', { className: 'dsh-nahida-panel__subtitle' }, props.t('subtitle'))
          ),
          typeof props.onClose === 'function'
            ? h(
              'button',
              {
                type: 'button',
                className: 'dsh-nahida-close',
                'aria-label': props.t('close'),
                'data-nahida-autofocus': true,
                onClick: props.onClose
              },
              h(CloseIcon)
            )
            : null
        ),
        h(
          'div',
          { className: 'dsh-nahida-panel__scroll' },
          preview,
          h(
            'div',
            { className: 'dsh-nahida-section-head' },
            h('span', { className: 'dsh-nahida-section-title' }, props.t('wallpaper')),
            h('span', { className: 'dsh-nahida-section-hint' }, props.t('wallpaperHint'))
          ),
          h('div', { className: 'dsh-nahida-grid' }, tileNodes),
          h(
            'div',
            { className: 'dsh-nahida-row' },
            h(
              'div',
              { className: 'dsh-nahida-row__text' },
              h('div', { className: 'dsh-nahida-row__label' }, props.t('veil')),
              h('div', { className: 'dsh-nahida-row__hint' }, props.t('veilHint'))
            ),
            h('input', {
              type: 'range',
              className: 'dsh-nahida-range',
              min: 0,
              max: MAX_VEIL,
              step: 5,
              value: state.veil,
              disabled: wall === undefined,
              'aria-label': props.t('veil'),
              onChange: function onVeil(event) { setVeil(event.currentTarget.value); }
            }),
            h('span', { className: 'dsh-nahida-row__value' }, state.veil + '%')
          ),
          h(
            'div',
            { className: 'dsh-nahida-row dsh-nahida-row--switch' },
            h(
              'div',
              { className: 'dsh-nahida-row__text' },
              h('div', { className: 'dsh-nahida-row__label' }, props.t('creditToggle')),
              h('div', { className: 'dsh-nahida-row__hint' }, props.t('creditToggleHint'))
            ),
            h('button', {
              type: 'button',
              className: 'dsh-nahida-switch',
              'data-on': creditEnabled ? 'true' : 'false',
              'aria-pressed': creditEnabled,
              'aria-label': props.t('creditToggle'),
              onClick: function toggleCreditCard() { setCreditEnabled(!creditEnabled); }
            }, h('span', { className: 'dsh-nahida-switch__knob' }))
          )
        ),
        h(
          'div',
          { className: 'dsh-nahida-panel__foot' },
          h('span', { className: 'dsh-nahida-panel__note' }, props.t('applyNow')),
          h(
            'div',
            { className: 'dsh-nahida-panel__actions' },
            h(
              'button',
              { type: 'button', className: 'dsh-nahida-btn', onClick: reset },
              props.t('reset')
            ),
            typeof props.onClose === 'function'
              ? h(
                'button',
                { type: 'button', className: 'dsh-nahida-btn dsh-nahida-btn--primary', onClick: props.onClose },
                props.t('done')
              )
              : null
          )
        )
      );
    }

    /** Body-portalled theme dialog, opened by the floating clover. */
    function NahidaSettingsDialog(props) {
      const onClose = props.onClose;
      const closeRef = React.useRef(onClose);
      closeRef.current = onClose;
      const panelRef = React.useRef(null);

      React.useEffect(function ownDialogKeys() {
        const onKey = function onKey(event) {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopPropagation();
          closeRef.current();
        };
        document.addEventListener('keydown', onKey, true);
        const timer = window.setTimeout(function focusDialog() {
          const panel = panelRef.current;
          if (panel === null) return;
          const target = panel.querySelector('[data-nahida-autofocus]');
          if (target !== null) target.focus();
        }, 30);
        return function releaseDialogKeys() {
          document.removeEventListener('keydown', onKey, true);
          window.clearTimeout(timer);
        };
      }, []);

      const mask = h('div', {
        className: 'dsh-nahida-modal__mask',
        'aria-hidden': true,
        onClick: function maskClick() { closeRef.current(); }
      });
      const panel = h(
        'div',
        {
          ref: panelRef,
          className: 'dsh-nahida-modal__panel',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': 'dsh-nahida-dialog-title'
        },
        h(NahidaSettingsPanel, {
          t: props.t,
          onClose: function closeDialog() { closeRef.current(); },
          titleId: 'dsh-nahida-dialog-title'
        })
      );
      const layer = h('div', { className: 'dsh-nahida-modal', role: 'presentation' }, mask, panel);
      if (typeof document === 'undefined') return null;
      if (ReactDOM !== null && typeof ReactDOM.createPortal === 'function') {
        return ReactDOM.createPortal(layer, document.body);
      }
      return layer;
    }

    /**
     * Floating clover at the chat's bottom-right. It measures the sticky
     * composer seat so the button floats just above the input card instead of
     * covering it, and portals its dialog out of the transformed composer.
     */
    function NahidaChatEntry(props) {
      const [open, setOpen] = React.useState(false);
      const [composerHeight, setComposerHeight] = React.useState(0);
      const seatRef = React.useRef(null);
      const buttonRef = React.useRef(null);
      const text = typeof props.t === 'function'
        ? props.t
        : function fallbackText(key) { return key; };
      const closeSettings = function closeSettings() {
        setOpen(false);
        if (buttonRef.current !== null && typeof buttonRef.current.focus === 'function') {
          window.requestAnimationFrame(function returnFocus() {
            if (buttonRef.current !== null) buttonRef.current.focus();
          });
        }
      };

      React.useEffect(function followComposerHeight() {
        const host = seatRef.current;
        if (host === null) return undefined;
        const body = host.closest('[data-conversation-content]');
        const seat = body === null ? null : body.querySelector('[data-composer-seat]');
        if (seat === null) return undefined;
        const measure = function measure() {
          setComposerHeight(seat.offsetHeight || 0);
        };
        measure();
        if (typeof ResizeObserver === 'function') {
          const observer = new ResizeObserver(measure);
          observer.observe(seat);
          return function stopFollowing() { observer.disconnect(); };
        }
        window.addEventListener('resize', measure);
        return function stopFollowing() { window.removeEventListener('resize', measure); };
      }, []);

      const bottom = props.hero ? 22 : Math.max(24, composerHeight + 62);
      return h(
        React.Fragment,
        null,
        h(
          'div',
          { ref: seatRef, className: 'dsh-nahida-fab-seat', style: { bottom: bottom + 'px' } },
          h(
            'button',
            {
              ref: buttonRef,
              type: 'button',
              className: 'dsh-nahida-fab',
              title: text('open'),
              'aria-label': text('open'),
              'aria-haspopup': 'dialog',
              'aria-expanded': open,
              onClick: function openSettings() { setOpen(true); }
            },
            h(CloverMark, { size: 20, tone: 'light' })
          )
        ),
        open ? h(NahidaSettingsDialog, { t: text, onClose: closeSettings }) : null
      );
    }

    /**
     * DOS-style caret for the contenteditable composer: hide the native caret
     * and paint a short blinking underscore at the collapsed selection rect.
     * The bar is portalled to the body so it is never clipped by the composer.
     */
    function NahidaTerminalCaret() {
      const [caret, setCaret] = React.useState(null);

      React.useEffect(function trackComposerCaret() {
        let frame = 0;
        let host = null;
        const findEditor = function findEditor() {
          return document.querySelector(
            '[data-conversation-content] [data-composer-card] [contenteditable="true"],'
            + '[data-conversation-content] [data-composer-card] [contenteditable=""],'
            + '[data-conversation-content] [data-composer-card] textarea'
          );
        };
        const hide = function hide() {
          setCaret(null);
        };
        const update = function update() {
          frame = 0;
          const editor = findEditor();
          if (editor !== host) {
            if (host !== null) host.classList.remove('dsh-nahida-caret-host');
            host = editor;
            if (host !== null) host.classList.add('dsh-nahida-caret-host');
          }
          if (editor === null || !document.hasFocus()
            || (document.activeElement !== editor && !editor.contains(document.activeElement))) {
            hide();
            return;
          }
          const selection = window.getSelection();
          if (selection === null || selection.rangeCount === 0 || !selection.isCollapsed) {
            hide();
            return;
          }
          const range = selection.getRangeAt(0);
          if (!editor.contains(range.startContainer)) {
            hide();
            return;
          }
          const rects = range.getClientRects();
          const rect = rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();
          if (rect !== undefined && (rect.width > 0 || rect.height > 0)) {
            setCaret({
              left: rect.left,
              top: rect.bottom - 2,
              width: Math.max(6, Math.min(12, rect.height > 0 ? rect.height * 0.55 : 8))
            });
            return;
          }
          // An empty contenteditable has a collapsed range with no rect. Anchor
          // the custom caret to the editor's first line instead of hiding it.
          const box = editor.getBoundingClientRect();
          if (box.width === 0 || box.height === 0) {
            hide();
            return;
          }
          const editorStyle = window.getComputedStyle(editor);
          const lineHeight = parseFloat(editorStyle.lineHeight) || 20;
          const padLeft = parseFloat(editorStyle.paddingLeft) || 0;
          const padTop = parseFloat(editorStyle.paddingTop) || 0;
          setCaret({
            left: box.left + padLeft,
            top: box.top + padTop + lineHeight - 2,
            width: 12
          });
        };
        const schedule = function schedule() {
          if (frame === 0) frame = window.requestAnimationFrame(update);
        };
        document.addEventListener('selectionchange', schedule);
        document.addEventListener('input', schedule, true);
        document.addEventListener('keydown', schedule, true);
        document.addEventListener('keyup', schedule, true);
        document.addEventListener('focusin', schedule, true);
        document.addEventListener('focusout', schedule, true);
        document.addEventListener('click', schedule, true);
        document.addEventListener('scroll', schedule, true);
        window.addEventListener('resize', schedule);
        update();
        return function stopComposerCaret() {
          if (frame !== 0) window.cancelAnimationFrame(frame);
          document.removeEventListener('selectionchange', schedule);
          document.removeEventListener('input', schedule, true);
          document.removeEventListener('keydown', schedule, true);
          document.removeEventListener('keyup', schedule, true);
          document.removeEventListener('focusin', schedule, true);
          document.removeEventListener('focusout', schedule, true);
          document.removeEventListener('click', schedule, true);
          document.removeEventListener('scroll', schedule, true);
          window.removeEventListener('resize', schedule);
          if (host !== null) host.classList.remove('dsh-nahida-caret-host');
        };
      }, []);

      if (caret === null || typeof document === 'undefined'
        || ReactDOM === null || typeof ReactDOM.createPortal !== 'function') {
        return null;
      }
      return ReactDOM.createPortal(
        h('span', {
          className: 'dsh-nahida-caret',
          'aria-hidden': true,
          style: {
            left: caret.left + 'px',
            top: caret.top + 'px',
            width: caret.width + 'px'
          }
        }),
        document.body
      );
    }

    /** Frame layer: the wallpaper painter behind the scroll body plus the clover entry. */
    function NahidaWallpaperFrame(props) {
      const state = useWallpaperState();
      const wall = wallpaperById(state.id);
      return h(
        React.Fragment,
        null,
        wall === undefined ? null : h(WallpaperPainter, { wall: wall, veil: state.veil }),
        h(NahidaChatEntry, { hero: props.hero, t: props.t }),
        h(NahidaTerminalCaret),
        props.children
      );
    }

    // ── Locale ───────────────────────────────────────────────────────────────

    /** Read the active locale id without assuming the service is mounted. */
    function activeLocaleId(ctx) {
      try {
        const locale = ctx.get('locale');
        if (locale && typeof locale.getSnapshot === 'function') {
          const snapshot = locale.getSnapshot();
          if (snapshot && typeof snapshot.active === 'string') return snapshot.active;
        }
      } catch (error) {
        /* locale is optional; fall back to English below */
      }
      return 'en';
    }

    /** Translate one key through the Client locale service, then a local fallback. */
    function translate(ctx, key) {
      try {
        const locale = ctx.get('locale');
        if (locale && typeof locale.bind === 'function') {
          const value = locale.bind(NS)(key);
          if (typeof value === 'string' && value !== key && value !== '') return value;
        }
      } catch (error) {
        /* fall through to the local dictionaries */
      }
      const active = activeLocaleId(ctx).toLowerCase();
      const dict = DICTS[active] || (active.indexOf('zh') === 0 ? DICTS.zh : active.indexOf('ja') === 0 ? DICTS.ja : DICTS.en);
      return dict[key] || DICTS.en[key] || DICTS.zh[key] || key;
    }


    // ── Embedded balance + context card ─────────────────────────────────────
    // Ported from the standalone "余额与上下文" widget so the theme can own the
    // card and paint it with the Dendro skill frame. Data still comes from the
    // host's account Remote and the contextPressure projection.

    const CREDIT_COPY = {
      zh: {
        title: '余额与上下文',
        balance: '余额',
        available: '可用',
        bonus: '赠送',
        context: '上下文',
        used: '已用 {percent}%',
        noSession: '无活动会话',
        noData: '暂无上下文数据',
        loading: '正在读取余额…',
        signedOut: '未登录，无法读取余额',
        failed: '余额读取失败',
        compactSignedOut: '未登录',
        compactFailed: '读取失败'
      },
      en: {
        title: 'Balance and context',
        balance: 'Balance',
        available: 'Available',
        bonus: 'Bonus',
        context: 'Context',
        used: '{percent}% used',
        noSession: 'No active session',
        noData: 'No context data yet',
        loading: 'Reading balance…',
        signedOut: 'Not signed in. Balance unavailable.',
        failed: 'Balance cannot be read',
        compactSignedOut: 'Signed out',
        compactFailed: 'Unavailable'
      },
      ja: {
        title: '残高とコンテキスト',
        balance: '残高',
        available: '利用可能',
        bonus: 'ボーナス',
        context: 'コンテキスト',
        used: '{percent}% 使用',
        noSession: 'アクティブなセッションなし',
        noData: 'コンテキストデータなし',
        loading: '残高を読み込み中…',
        signedOut: '未ログインのため残高を取得できません',
        failed: '残高を読み取れません',
        compactSignedOut: '未ログイン',
        compactFailed: '読み取り失敗'
      }
    };

    const CREDIT_CURRENCY_SYMBOLS = { CNY: '¥', USD: '$' };

    function creditLocaleId(locale) {
      return String(locale === undefined || locale === null ? 'en' : locale).split('-')[0].toLowerCase();
    }

    function creditCopy(locale) {
      const id = creditLocaleId(locale);
      return CREDIT_COPY[id] || CREDIT_COPY.en;
    }

    function creditT(locale, key, values) {
      const table = creditCopy(locale);
      let text = table[key] || CREDIT_COPY.en[key] || key;
      if (values !== undefined) {
        for (const [name, value] of Object.entries(values)) {
          text = text.split('{' + name + '}').join(String(value));
        }
      }
      return text;
    }

    function creditFormatMoney(raw, currency, locale) {
      const text = typeof raw === 'string' ? raw.trim() : String(raw === undefined || raw === null ? '' : raw);
      const symbol = CREDIT_CURRENCY_SYMBOLS[currency];
      const match = /^(-?)(\d+)(?:\.(\d*))?$/.exec(text);
      if (match === null) return symbol === undefined ? `${currency} ${text}` : `${symbol}${text}`;
      let units = BigInt(match[2]);
      const digits = match[3] === undefined || match[3] === '' ? '0' : match[3];
      let cents = Math.round(Number(`${digits}000`.slice(0, 3)) / 10);
      if (cents === 100) {
        cents = 0;
        units += 1n;
      }
      let grouped;
      try {
        grouped = new Intl.NumberFormat(locale, { useGrouping: true, maximumFractionDigits: 0 }).format(units);
      } catch (error) {
        grouped = String(units);
      }
      const fraction = `.${String(cents).padStart(2, '0')}`;
      const negative = match[1] === '-' && (units !== 0n || cents !== 0);
      return symbol === undefined
        ? `${currency} ${negative ? '-' : ''}${grouped}${fraction}`
        : `${negative ? '-' : ''}${symbol}${grouped}${fraction}`;
    }

    function creditFormatTokens(value, locale) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
      if (value < 1000) return String(Math.round(value));
      const scaled = value < 1e6 ? value / 1e3 : value / 1e6;
      const digits = scaled >= 100 ? 0 : 1;
      let text;
      try {
        text = new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(scaled);
      } catch (error) {
        text = String(Math.round(scaled * 10) / 10);
      }
      return `${text}${value < 1e6 ? 'K' : 'M'}`;
    }

    function creditWalletsText(wallets, locale) {
      if (!Array.isArray(wallets) || wallets.length === 0) return '—';
      return wallets.map((wallet) => creditFormatMoney(wallet.balance, wallet.currency, locale)).join(' · ');
    }

    function creditOccupancyOf(pressure) {
      if (pressure === undefined || pressure === null) return undefined;
      const used = typeof pressure.projectedTokens === 'number' ? pressure.projectedTokens : pressure.pressureTokens;
      const limit = pressure.contextWindow;
      if (typeof used !== 'number' || !Number.isFinite(used)) return undefined;
      if (typeof limit !== 'number' || !Number.isFinite(limit) || limit <= 0) return undefined;
      return {
        used,
        limit,
        percent: Math.min(100, Math.round((used / limit) * 100))
      };
    }

    function creditAccountMetadata(ctx) {
      const release = globalThis.__DSH_BOOT__ === undefined ? undefined : globalThis.__DSH_BOOT__.release;
      const version = release !== undefined && typeof release.version === 'string' && release.version !== ''
        ? release.version
        : '0.0.0';
      let locale = 'en';
      try {
        locale = ctx.locale.getSnapshot().active;
      } catch (error) {
        locale = 'en';
      }
      return {
        version,
        locale,
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60
      };
    }

    function createCreditBalanceStore(ctx) {
      let snapshot = { status: 'loading' };
      const listeners = new Set();
      let revision = 0;
      let inFlight = null;
      let pending = false;
      let disposed = false;

      const publish = (next) => {
        snapshot = next;
        for (const listener of [...listeners]) listener();
      };

      const read = () => {
        if (disposed) return Promise.resolve();
        if (inFlight !== null) {
          pending = true;
          return inFlight;
        }
        const generation = revision;
        const account = typeof ctx.get === 'function' ? ctx.get('remote.account') : undefined;
        if (account === undefined || typeof account.getBalance !== 'function') {
          publish({ status: 'failed' });
          return Promise.resolve();
        }
        const request = (async () => {
          let result;
          try {
            result = await account.getBalance(creditAccountMetadata(ctx));
          } catch (error) {
            result = undefined;
          }
          if (generation !== revision) return;
          if (result === undefined || result.ok !== true) {
            publish({ status: 'failed' });
            return;
          }
          const value = result.value;
          if (value === null || value === undefined) {
            publish({ status: 'signed-out' });
            return;
          }
          if (value.status !== 'ready') {
            publish({ status: 'failed' });
            return;
          }
          publish({ status: 'ready', value });
        })();
        inFlight = request;
        const settle = () => {
          if (inFlight !== request) return;
          inFlight = null;
          if (pending) {
            pending = false;
            read();
          }
        };
        request.then(settle, settle);
        return request;
      };

      return {
        read,
        dispose() {
          disposed = true;
          revision++;
          listeners.clear();
        },
        source: {
          getSnapshot: () => snapshot,
          subscribe: (listener) => {
            listeners.add(listener);
            return () => {
              listeners.delete(listener);
            };
          }
        }
      };
    }

    function createCreditContextStore(ctx) {
      let snapshot = { sessionId: null, pressure: undefined };
      const listeners = new Set();
      let sessionId = null;
      let face;
      let offFace;
      let disposed = false;

      const publish = (next) => {
        if (next.sessionId === snapshot.sessionId && next.pressure === snapshot.pressure) return;
        snapshot = next;
        for (const listener of [...listeners]) listener();
      };

      const refresh = () => {
        publish({
          sessionId,
          pressure: face === undefined ? undefined : face.getSnapshot()
        });
      };

      const bind = (binding) => {
        if (disposed) return;
        const nextId = binding === undefined || binding.key === undefined ? null : binding.key;
        const keyed = binding === undefined ? undefined : binding.keyedHooks;
        const projection = keyed === undefined ? undefined : keyed.projection;
        const nextFace = typeof projection === 'function' ? projection('contextPressure') : undefined;
        if (nextFace === face && nextId === sessionId) {
          refresh();
          return;
        }
        if (offFace !== undefined) {
          const stop = offFace;
          offFace = undefined;
          stop();
        }
        sessionId = nextId;
        face = nextFace;
        if (face !== undefined) offFace = face.subscribe(refresh);
        refresh();
      };

      if (ctx.uiSession !== undefined) {
        const offCurrent = ctx.uiSession.current.subscribe(() => {
          bind(ctx.uiSession.current.getSnapshot());
        });
        bind(ctx.uiSession.current.getSnapshot());
        return {
          dispose() {
            disposed = true;
            offCurrent();
            if (offFace !== undefined) {
              const stop = offFace;
              offFace = undefined;
              stop();
            }
            listeners.clear();
          },
          source: {
            getSnapshot: () => snapshot,
            subscribe: (listener) => {
              listeners.add(listener);
              return () => {
                listeners.delete(listener);
              };
            }
          }
        };
      }

      return {
        dispose() {
          disposed = true;
          listeners.clear();
        },
        source: {
          getSnapshot: () => snapshot,
          subscribe: (listener) => {
            listeners.add(listener);
            return () => {
              listeners.delete(listener);
            };
          }
        }
      };
    }

    function NahidaCreditIcon(props) {
      const size = props.size === undefined ? 16 : props.size;
      return h('svg', {
        viewBox: '0 0 16 16',
        width: size,
        height: size,
        fill: 'none',
        'aria-hidden': 'true',
        style: { flex: 'none', display: 'block' }
      }, [
        h('path', {
          key: 'body',
          d: 'M2.9 6.2c0-.9.7-1.6 1.6-1.6h7.4c.7 0 1.2.5 1.2 1.2v1.1H4.6c-1 0-1.7.8-1.7 1.7v-2.4Z',
          stroke: 'currentColor',
          strokeWidth: '1.15',
          strokeLinejoin: 'round'
        }),
        h('rect', {
          key: 'card',
          x: '2.9',
          y: '6.3',
          width: '10.2',
          height: '7.2',
          rx: '2.2',
          stroke: 'currentColor',
          strokeWidth: '1.15'
        }),
        h('path', {
          key: 'clasp',
          d: 'M9.7 8.9h3.4v2.4H9.7a1.2 1.2 0 0 1 0-2.4Z',
          fill: 'currentColor',
          opacity: '0.9'
        }),
        h('circle', {
          key: 'dot',
          cx: '11.5',
          cy: '10.1',
          r: '0.62',
          style: { fill: 'rgba(4,32,19,.8)' }
        })
      ]);
    }

    function NahidaCreditRow(props) {
      return h('div', { className: 'dsh-nahida-credit__row' }, [
        h('span', { key: 'label', className: 'dsh-nahida-credit__row-label' }, props.label),
        h('span', { key: 'value', className: 'dsh-nahida-credit__row-value' }, props.value)
      ]);
    }

    function NahidaCreditPanel(props) {
      const balance = typeof props.useBalance === 'function'
        ? props.useBalance((value) => value)
        : { status: 'loading' };
      const contextUsage = typeof props.useContextUsage === 'function'
        ? props.useContextUsage((value) => value)
        : { sessionId: null, pressure: undefined };
      const locale = typeof props.useActiveLocale === 'function'
        ? props.useActiveLocale((value) => value)
        : 'en';
      const copy = creditCopy(locale);

      const ready = balance.status === 'ready';
      const wallets = ready && Array.isArray(balance.value.value) ? balance.value.value : [];
      const bonusWallets = ready && Array.isArray(balance.value.bonusWallets) ? balance.value.bonusWallets : [];
      const availableText = ready ? creditWalletsText(wallets, locale) : undefined;
      const bonusText = ready ? creditWalletsText(bonusWallets, locale) : undefined;
      const occupancy = creditOccupancyOf(contextUsage.pressure);
      const balanceStatus = balance.status === 'loading'
        ? copy.loading
        : balance.status === 'signed-out' ? copy.signedOut : copy.failed;
      const contextStatus = contextUsage.sessionId === null ? copy.noSession : copy.noData;

      const compactBalance = ready
        ? (wallets.length > 0
          ? creditFormatMoney(wallets[0].balance, wallets[0].currency, locale)
          : bonusWallets.length > 0
            ? creditFormatMoney(bonusWallets[0].balance, bonusWallets[0].currency, locale)
            : '—')
        : balance.status === 'loading'
          ? '…'
          : balance.status === 'signed-out' ? copy.compactSignedOut : copy.compactFailed;
      const compactContext = occupancy === undefined ? '—' : `${occupancy.percent}%`;
      const summary = [
        `${copy.balance}: ${compactBalance}`,
        `${copy.context}: ${occupancy === undefined ? contextStatus : creditT(locale, 'used', { percent: occupancy.percent })}`
      ].join(' · ');

      if (!props.wide) {
        return h('div', {
          className: 'dsh-nahida-credit-rail',
          'data-nahida-credit-rail': '',
          role: 'group',
          'aria-label': summary,
          title: summary
        }, [
          h(NahidaCreditIcon, { key: 'icon', size: 17 }),
          h('span', { key: 'percent', className: 'dsh-nahida-credit-rail__percent' }, compactContext)
        ]);
      }

      return h('section', {
        className: 'dsh-nahida-credit',
        'data-nahida-credit': '',
        'aria-label': copy.title
      }, [
        h('div', { key: 'head', className: 'dsh-nahida-credit__head' }, [
          h(NahidaCreditIcon, { key: 'icon', size: 16 }),
          h('span', { key: 'title', className: 'dsh-nahida-credit__title' }, copy.title)
        ]),
        h('div', { key: 'balance', className: 'dsh-nahida-credit__group' }, [
          h('span', { key: 'label', className: 'dsh-nahida-credit__label' }, copy.balance),
          ready
            ? h('div', { key: 'rows' }, [
              h(NahidaCreditRow, { key: 'available', label: copy.available, value: availableText }),
              h(NahidaCreditRow, { key: 'bonus', label: copy.bonus, value: bonusText })
            ])
            : h('span', {
              key: 'status',
              className: 'dsh-nahida-credit__status',
              'data-tone': balance.status === 'failed' ? 'error' : 'muted'
            }, balanceStatus)
        ]),
        h('div', { key: 'context', className: 'dsh-nahida-credit__group' }, [
          h('span', { key: 'label', className: 'dsh-nahida-credit__label' }, copy.context),
          occupancy !== undefined
            ? h('div', { key: 'body', className: 'dsh-nahida-credit__body' }, [
              h(NahidaCreditRow, {
                key: 'usage',
                label: creditT(locale, 'used', { percent: occupancy.percent }),
                value: `${creditFormatTokens(occupancy.used, locale)} / ${creditFormatTokens(occupancy.limit, locale)}`
              }),
              h('div', { key: 'bar', className: 'dsh-nahida-credit__bar', 'aria-hidden': 'true' }, h('i', {
                style: { width: `${occupancy.percent}%` },
                'data-warn': occupancy.percent >= 80 ? 'true' : 'false'
              }))
            ])
            : h('span', { key: 'status', className: 'dsh-nahida-credit__status' }, contextStatus)
        ])
      ]);
    }


    /** Slot gate: render the card only while the theme setting is enabled. */
    function NahidaCreditGate(props) {
      const enabled = useCreditEnabled();
      if (!enabled) return null;
      return h(NahidaCreditPanel, props);
    }

    // ── Plugin ───────────────────────────────────────────────────────────────

    /**
     * Register one slot occupant defensively: the slot may not be declared by
     * this composition, and a single slot may already hold an occupant at the
     * same priority. Either failure degrades to "this decoration is absent"
     * instead of taking the rest of the theme down.
     */
    function mount(ctx, slot, options, Component) {
      try {
        ctx.slots.inject(slot, function registerWhenDeclared() {
          try {
            return ctx.slots.register(Object.assign({ name: slot }, options), Component);
          } catch (error) {
            console.warn('nahida-theme: could not register slot "' + slot + '"', error);
            return function noop() {};
          }
        });
      } catch (error) {
        console.warn('nahida-theme: could not wait for slot "' + slot + '"', error);
      }
    }

    function apply(ctx) {
      // 1. Palette: a token layer over the active theme, disposed on unload.
      ctx.inject(['theme'], function withTheme(scope) {
        try {
          scope.effect(function stackPalette() {
            return scope.theme.overrideTokens(PKG, TOKENS);
          }, 'nahida-theme: palette');
        } catch (error) {
          console.warn('nahida-theme: palette override failed', error);
        }
      });

      // 2. Locale dictionaries for the blessing line and the settings page.
      ctx.inject(['locale'], function withLocale(scope) {
        try {
          scope.effect(function registerDictionaries() {
            const disposers = [];
            for (const [lang, dict] of Object.entries(DICTS)) {
              try {
                const dispose = scope.locale.register(NS, lang, dict);
                if (typeof dispose === 'function') disposers.push(dispose);
              } catch (error) {
                console.warn('nahida-theme: dictionary "' + lang + '" was not registered', error);
              }
            }
            return function unregisterDictionaries() {
              for (const dispose of disposers) {
                try {
                  dispose();
                } catch (error) {
                  /* already gone */
                }
              }
            };
          }, 'nahida-theme: dictionaries');
        } catch (error) {
          console.warn('nahida-theme: locale registration failed', error);
        }
      });

      // 3. One stylesheet for every painting surface, owned by the plugin.
      ctx.effect(function installStyles() {
        if (typeof document === 'undefined' || document.head === null) return function noStyles() {};
        const element = document.createElement('style');
        element.setAttribute('data-plugin', PKG);
        element.setAttribute('data-plugin-css', PKG);
        element.textContent = THEME_CSS;
        document.head.append(element);
        return function removeStyles() {
          element.remove();
        };
      }, 'nahida-theme: styles');

      // 4. Cross-tab wallpaper changes (another window on the same origin).
      ctx.effect(function followWallpaperStorage() {
        if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
          return function noStorageSync() {};
        }
        const onStorage = function onStorage(event) {
          if (event.key !== STORAGE_KEY) return;
          savedState = undefined;
          notifyWallpaper();
        };
        window.addEventListener('storage', onStorage);
        return function stopStorageSync() {
          window.removeEventListener('storage', onStorage);
        };
      }, 'nahida-theme: wallpaper storage sync');

      const t = function text(key) {
        return translate(ctx, key);
      };

      // 5. Marks: shadow the official sidebar mark with a lower priority, and
      //    fill the blank-session hero mark (which ships with no occupant).
      mount(ctx, 'sidebar.brand.mark', { priority: -10 }, function SidebarMark(props) {
        return h(CloverMark, { size: props.size || 24, className: props.className });
      });
      mount(ctx, 'conversation.hero.brand.mark', {}, function HeroMark(props) {
        return h(CloverMark, { size: props.size || 56, className: props.className });
      });

      // 6. Ambient surfaces.
      mount(ctx, 'conversation.composer.dock', { id: 'nahida-theme.blessing', order: 10 }, function Blessing() {
        return h(NahidaBlessing, { t: t });
      });
      mount(ctx, 'shell.overlay', { id: 'nahida-theme.leaves', order: -10 }, function Leaves() {
        return h(NahidaLeaves);
      });

      // 7. Chat wallpaper + the floating clover settings entry.
      mount(ctx, 'conversation.hero.frame', { id: 'nahida-theme.wallpaper', order: 20, locale: NS }, NahidaWallpaperFrame);

      // 8. Theme settings page inside the software Settings dialog.
      mount(ctx, 'settings.section', {
        id: 'nahida-theme',
        order: 50,
        label: function sectionLabel() { return t('nav'); },
        locale: NS
      }, function SettingsSection(props) {
        return h(NahidaSettingsPanel, { t: props.t || t, titleId: 'dsh-nahida-settings-title' });
      });
      mount(ctx, 'settings.section.icon', { id: 'nahida-theme', order: 50 }, function SettingsIcon(props) {
        return h(
          'span',
          { className: 'dsh-nahida-settings-icon', 'data-active': props.active ? 'true' : 'false' },
          h(CloverMark, { size: props.size || 16 })
        );
      });

      // 9. Embedded balance + context card. The standalone widget is hidden by
      //    the stylesheet; this card reads the same host services.
      ctx.inject(['remote', 'uiSession', 'locale'], function withCredit(scope) {
        try {
          const balance = createCreditBalanceStore(scope);
          const contextUsage = createCreditContextStore(scope);
          const localeService = scope.locale || ctx.locale;
          scope.effect(function creditLifetime() {
            return function disposeCredit() {
              balance.dispose();
              contextUsage.dispose();
            };
          }, 'nahida-theme: credit lifetime');
          const activeLocale = {
            getSnapshot: function activeSnapshot() { return localeService.getSnapshot().active; },
            subscribe: function activeSubscribe(listener) { return localeService.subscribe(listener); }
          };
          scope.effect(function creditInitialRead() {
            void balance.read();
          }, 'nahida-theme: credit initial read');
          scope.effect(function creditAccountEvents() {
            const remote = typeof scope.get === 'function' ? scope.get('remote') : undefined;
            if (remote === undefined) return function noRemote() {};
            const stops = [];
            const listen = function listen(event) {
              try {
                stops.push(remote.$on(event, function refreshBalance() { void balance.read(); }));
              } catch (error) {
                /* optional forwarded event */
              }
            };
            listen('deepseek-account/signed-out');
            listen('credentials/reference-updated');
            return function stopCreditAccount() {
              for (const stop of stops) {
                try { stop(); } catch (error) { /* gone */ }
              }
            };
          }, 'nahida-theme: credit account events');
          scope.effect(function creditSessionEvents() {
            const ui = scope.uiSession;
            if (ui === undefined) return function noSession() {};
            let sessionId = null;
            let wasRunning = false;
            const sync = function syncCreditSession() {
              const binding = ui.current.getSnapshot();
              const nextId = binding === undefined || binding.key === undefined ? null : binding.key;
              if (nextId !== sessionId) {
                sessionId = nextId;
                if (sessionId !== null) void balance.read();
              }
              const status = sessionId === null ? undefined : ui.sessionStatus.getSnapshot().get(sessionId);
              const running = status !== undefined && status.running === true;
              if (wasRunning && !running) void balance.read();
              wasRunning = running;
            };
            const stops = [
              ui.current.subscribe(sync),
              ui.sessionStatus.subscribe(sync)
            ];
            sync();
            return function stopCreditSession() {
              for (const stop of stops) {
                try { stop(); } catch (error) { /* gone */ }
              }
            };
          }, 'nahida-theme: credit session events');
          mount(ctx, 'sidebar.footer.action', {
            id: 'nahida-theme.balance-context',
            order: -10,
            locale: NS,
            inject: function creditHooks() {
              return {
                hooks: {
                  balance: balance.source,
                  contextUsage: contextUsage.source,
                  activeLocale: activeLocale
                }
              };
            }
          }, NahidaCreditGate);
        } catch (error) {
          console.warn('nahida-theme: balance/context card failed', error);
        }
      });
    }

    return {
      inject: ['slots'],
      apply: apply
    };
  }
});
