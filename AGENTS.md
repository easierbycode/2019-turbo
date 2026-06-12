# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Overview

This is a Street Fighter-themed vertical shoot-'em-up ("APRIL FOOL 2019 WORLD
PRESIDENT CHALLENGES A STG"), originally a PixiJS webpack bundle, now ported to
**Phaser 4.1.0**. It runs as a vanilla ES-module app — **no bundler, no npm, no
build step**. Phaser is loaded from a CDN via an import map.

This repository is the **turbo fork** of `2019-pixi` (upstream remote). Game
logic runs on a 120Hz fixed timestep — double the legacy 60Hz step rate, same
speed as `2019-es7` — and the accumulator catch-up keeps that speed constant
when low-power devices throttle rendering to 30Hz (see Key Constants below).
Pass `?og=1` to revert to the original (pre-turbo) timing in either build —
one 60Hz-normalized step per render frame, no fixed-step catch-up
(`OG_MODE` in `src/constants.js`; `_ogMode` in `app_formatted.js`).

## Running the Game

Serve the project root with any static HTTP server and open `index.html`:

```sh
python3 -m http.server 8000     # then open http://localhost:8000/
# or: npx serve .
```

ES modules require HTTP (they will not run from `file://`). There are no tests,
no linter, and no `package.json`.

## Entry Point Flow

`index.html` declares an import map mapping `phaser` →
`https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.esm.js`, then loads
`src/main.js` as a module. `main.js` builds the `Phaser.Game` (256×480,
`pixelArt`, `Scale.FIT` + `CENTER_BOTH`, parented to `#canvas`), registers the
scene list, and calls `initSound(game)`.

Every module that references the `Phaser` namespace imports it explicitly
(`import Phaser from 'phaser';`) — the ESM build does **not** create a global.

`index.html` also keeps the legacy "How To Play" modal (vanilla JS, exposed as
`window.howtoModalOpen/Close`).

## Source Layout (`src/`)

- `main.js` — Phaser game config + scene registration.
- `constants.js` — dimensions, FPS, `SCENES` keys, the asset manifest
  (`ATLASES`, `IMAGES`, `SOUNDS`, `RECIPE`), `BGM_INFO` loop markers, per-sound
  `VOLUMES`, and `SHOOT_MODES` / `SHOOT_SPEEDS` / `ITEM_TYPES` enums.
- `state.js` — `gameState` (mutable run state), high-score cookie load/save,
  `resetRun()`, `dlog()`.
- `sound.js` — wrapper over Phaser's global sound manager (`play`, `stop`,
  `bgmPlay` with loop markers, `stopAll`, `pause/resumeAll`). Replaces pixi-sound.
- `hit.js` — AABB collision (`hitTest`) using each unit's local-centred
  `hitArea` rectangle.
- `anims.js` — helpers to register Phaser animations from atlas frame-name lists
  (`ensureAnim` with compact keys, `frameRange`, `speedToFps`). PixiJS
  `animationSpeed` (fraction/tick) maps to Phaser `frameRate = speed * 60`.
- `objects/` — game-object classes (see hierarchy below).
- `ui/` — HUD and UI widgets.
- `scenes/` — Phaser scenes (see flow below).

## Scene Flow

Phaser's built-in scene manager (`this.scene.start(key)`) replaces the original
custom `B.Manager`.

`PreloadScene` (loads all assets + PC/SP mode select) → `TitleScene` →
`AdvScene` (story interlude) → `GameScene` (boss fights: Bison, Barlog, Sagat,
Vega, Goki, Fang) → on death `ContinueScene` → `GameoverScene` → `ResultScene`;
on clearing the final stage `CongraScene` → `EndingScene` → `ResultScene`.

`GameScene` is the bulk of the logic: wave spawning, player/enemy/bullet/item
updates, AABB collisions, CA (Critical Art) bomb, boss timer, and all scene
transitions.

## Class Hierarchy (Game Objects)

All game objects are `Phaser.GameObjects.Container` subclasses (containers are
`EventEmitter`s, so the original `emit`/`on` lifecycle events are preserved via
the `EVT` constants in `objects/BaseUnit.js`).

`BaseUnit` (animated `character` + mirrored `shadow` + optional `explosion` +
`hitArea`) → `Player`, `Enemy`, `Bullet`, and `bosses/Boss`.
`bosses/Boss` → `BossBison`, `BossBarlog`, `BossSagat`, `BossVega`, `BossGoki`,
`BossFang`. Bosses emit `TAMA_ADD`; `GameScene.handleEnemyShoot` spawns the
bullets per the boss's `pattern` (`down` / `aimed` / `spread` / `ring`).

## UI Components (`src/ui/`)

`HUD` (top status bar: `hudBg`, HP bar, score, combo; plus the mid-right CA
button group with a concentric glow), `NumberDisplay` (atlas digit renderer),
`GameTitle` (ROUND/FIGHT/clear/timeover/K.O. overlays), `StageBackground`
(scrolling tile sprite), `CutinContainer` (CA cut-in), `Button` (atlas button).

## Engine Mapping (PixiJS → Phaser)

| Original (PixiJS)                         | Port (Phaser 4)                          |
| ----------------------------------------- | ---------------------------------------- |
| `PIXI.Application` (256×480)              | `Phaser.Game` + `Scale.FIT`              |
| `PIXI.Container` / `Sprite` / `AnimatedSprite` | `Phaser.GameObjects.Container` / `Sprite` + `anims` |
| custom `B.Manager`                        | Phaser scene manager                     |
| pixi-sound                                | Phaser sound (`src/sound.js`)            |
| TweenMax / TimelineMax (GSAP)             | Phaser tweens (`scene.tweens`)           |
| custom interaction hit-test               | `src/hit.js` AABB                        |

## Key Constants & Gotchas

- Resolution 256×480; target 30 FPS; assets under `assets/` (TexturePacker
  JSON-Hash atlases, `game.json` recipe of stage/enemy/boss data, mp3 sounds).
- **Fixed timestep (turbo):** `GameScene.update` accumulates Phaser's
  millisecond `delta` (capped at `MAX_FRAME_MS` = 66.67ms ≈ 8 steps) and runs
  `fixedUpdate()` once per `STEP_MS` (8.333ms → 120 logic steps/sec). Each step
  uses a constant `d = 1` per-frame unit, so logic runs at 2× the legacy 60Hz
  rate (matching 2019-es7's turbo speed) and stays frame-rate independent on
  30Hz-throttled/low-power displays. Movement lerps, shoot timers, and wave
  counters consume `d` directly — do **not** multiply by 60. Phaser anims,
  tweens, and `delayedCall` remain real-time (also matching 2019-es7).
- The legacy `?pixi=1` build gets the same treatment in `app_formatted.js`:
  `BaseScene.atTick` accumulates `min(tickerDelta * 2, 8)` and calls `loop(1)`
  per whole step (ported verbatim from 2019-es7 commit `78e1262`).
- Game data field names come straight from `game.json`: `spgage` (CA gauge),
  `bulletData` (enemy/boss projectile recipe), `anim` (boss animation sets).
