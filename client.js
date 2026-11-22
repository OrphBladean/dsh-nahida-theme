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
 *   2. Marks    — an original chibi "little radish" emblem replaces the sidebar
 *                 brand mark and fills the blank-session hero mark.
 *   3. Blessing — a quiet rotating line with a five-petal flower below the
 *                 composer, in the user's locale.
 *   4. Leaves   — a few slow, click-through leaves drifting in the frame-wide
 *                 overlay; disabled automatically under reduced motion.
 *
 * Artwork uses its own literal colours (it is artwork); every container, text
 * colour, and ornament derives from `--dsw-alias-*` theme tokens, so light and
 * dark palettes stay legible. All resources are registered through the plugin
 * context and disposed with it.
 */
window.__ModuleLoader__.load({
  id: '@local/nahida-theme',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Locale namespace owned by this package. */
    const NS = 'nahida-theme';
    /** Theme-token layer identity (one layer per source). */
    const PKG = '@local/nahida-theme';

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
        quote3: '小小的新芽，也终会撑起一片绿荫。'
      },
      en: {
        quote1: 'May the seed of wisdom bloom quietly in your heart.',
        quote2: 'In the forest of knowledge, no traveller walks alone.',
        quote3: 'Even the smallest sprout grows into a canopy of shade.'
      },
      ja: {
        quote1: '知恵の種が、あなたの心にそっと花ひらきますように。',
        quote2: '知識の森では、旅人はひとりぼっちじゃない。',
        quote3: '小さな芽も、いつか大きな木陰になる。'
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

    /**
     * Original "little radish" emblem: a pale face with closed, content eyes,
     * a gold star on the brow, and two sprout leaves. Sized by the owner slot,
     * so the same component serves the 24px sidebar mark and the hero mark.
     */
    function NahidaFace(props) {
      const size = props.size || 24;
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
        h('circle', { cx: 32, cy: 33, r: 29, fill: ART.leafPale, opacity: 0.95 }),
        h('circle', { cx: 32, cy: 33, r: 29, fill: 'none', stroke: ART.leafRim, strokeWidth: 1.5 }),
        h('path', { d: 'M32 27c-1-6-5-10-11-11 1 6 5 10 11 11z', fill: ART.leafMid }),
        h('path', { d: 'M32 27c1-6 5-10 11-11-1 6-5 10-11 11z', fill: ART.leafLight }),
        h('path', {
          d: 'M32 28v-8',
          stroke: ART.stem,
          strokeWidth: 1.6,
          strokeLinecap: 'round'
        }),
        h('ellipse', { cx: 32, cy: 39, rx: 16.5, ry: 15, fill: ART.face }),
        h('ellipse', { cx: 32, cy: 44.5, rx: 12, ry: 7.5, fill: ART.faceShade, opacity: 0.55 }),
        h('path', {
          d: 'M32 30.4l1.6 3.2 3.5.5-2.6 2.4.7 3.5-3.2-1.7-3.2 1.7.7-3.5-2.6-2.4 3.5-.5z',
          fill: ART.gold,
          stroke: ART.goldDeep,
          strokeWidth: 0.6,
          strokeLinejoin: 'round'
        }),
        h('path', {
          d: 'M24.2 40.2q2.6-2.6 5.2 0',
          fill: 'none',
          stroke: ART.ink,
          strokeWidth: 1.6,
          strokeLinecap: 'round'
        }),
        h('path', {
          d: 'M34.6 40.2q2.6-2.6 5.2 0',
          fill: 'none',
          stroke: ART.ink,
          strokeWidth: 1.6,
          strokeLinecap: 'round'
        }),
        h('circle', { cx: 22.6, cy: 44.6, r: 2.2, fill: ART.cheek, opacity: 0.6 }),
        h('circle', { cx: 41.4, cy: 44.6, r: 2.2, fill: ART.cheek, opacity: 0.6 }),
        h('path', {
          d: 'M29.4 46.2q2.6 2.4 5.2 0',
          fill: 'none',
          stroke: ART.ink,
          strokeWidth: 1.5,
          strokeLinecap: 'round'
        })
      );
    }

    // ── Blessing line (conversation.composer.dock) ───────────────────────────

    const DOCK_CSS = [
      '.dsh-nahida-dock{display:flex;align-items:center;justify-content:center;gap:9px;',
      'padding:3px 12px;min-height:24px;font-size:12px;line-height:18px;',
      'color:var(--dsw-alias-label-tertiary);letter-spacing:.05em;',
      'user-select:none;pointer-events:none;overflow:hidden}',
      '.dsh-nahida-rule{display:block;height:1px;width:clamp(20px,7vw,64px);flex:none;',
      'background:linear-gradient(90deg,transparent,var(--dsw-alias-border-l2));border-radius:1px}',
      '.dsh-nahida-rule--end{transform:scaleX(-1)}',
      '.dsh-nahida-flower{display:inline-flex;align-items:center;flex:none;',
      'color:var(--dsw-alias-state-success-primary);opacity:.85}',
      '.dsh-nahida-quote{max-width:min(72vw,560px);white-space:nowrap;overflow:hidden;',
      'text-overflow:ellipsis;animation:dsh-nahida-quote-in 1.1s ease both}',
      '@keyframes dsh-nahida-quote-in{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}',
      '@media (prefers-reduced-motion:reduce){.dsh-nahida-quote{animation:none}}'
    ].join('');

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
        h('style', { children: DOCK_CSS }),
        h('span', { className: 'dsh-nahida-rule' }),
        h('span', { className: 'dsh-nahida-flower' }, h(FlowerArt, { size: 13 })),
        h('span', { key: key, className: 'dsh-nahida-quote' }, props.t(key)),
        h('span', { className: 'dsh-nahida-flower' }, h(FlowerArt, { size: 13 })),
        h('span', { className: 'dsh-nahida-rule dsh-nahida-rule--end' })
      );
    }

    // ── Drifting leaves (shell.overlay) ──────────────────────────────────────

    const LEAF_CSS = [
      '.dsh-nahida-leaves{position:fixed;inset:0;overflow:hidden;pointer-events:none;',
      'z-index:0;contain:layout style paint}',
      '.dsh-nahida-leaf{position:absolute;display:block;will-change:transform;',
      'animation-name:dsh-nahida-sway;animation-timing-function:ease-in-out;',
      'animation-iteration-count:infinite;animation-direction:alternate;',
      'filter:drop-shadow(0 2px 3px rgba(63,125,58,.10))}',
      '@keyframes dsh-nahida-sway{0%{transform:translate3d(0,0,0) rotate(-6deg)}',
      '35%{transform:translate3d(7px,-12px,0) rotate(7deg)}',
      '70%{transform:translate3d(-5px,-24px,0) rotate(-5deg)}',
      '100%{transform:translate3d(3px,-36px,0) rotate(6deg)}}',
      '@media (prefers-reduced-motion:reduce){.dsh-nahida-leaf{animation:none}}'
    ].join('');

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
      return h('div', { className: 'dsh-nahida-leaves', 'aria-hidden': true }, h('style', { children: LEAF_CSS }), nodes);
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

    /** Translate one blessing key through the Client locale service, then a local fallback. */
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

      // 2. Locale dictionaries for the blessing line.
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

      const t = function blessingText(key) {
        return translate(ctx, key);
      };

      // 3. Marks: shadow the official sidebar mark with a lower priority, and
      //    fill the blank-session hero mark (which ships with no occupant).
      mount(ctx, 'sidebar.brand.mark', { priority: -10 }, function SidebarMark(props) {
        return h(NahidaFace, { size: props.size || 24, className: props.className });
      });
      mount(ctx, 'conversation.hero.brand.mark', {}, function HeroMark(props) {
        return h(NahidaFace, { size: props.size || 56, className: props.className });
      });

      // 4. Ambient surfaces.
      mount(ctx, 'conversation.composer.dock', { id: 'nahida-theme.blessing', order: 10 }, function Blessing() {
        return h(NahidaBlessing, { t: t });
      });
      mount(ctx, 'shell.overlay', { id: 'nahida-theme.leaves', order: -10 }, function Leaves() {
        return h(NahidaLeaves);
      });
    }

    return {
      inject: ['slots'],
      apply: apply
    };
  }
});
