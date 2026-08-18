# 2019-turbo

## Examples

# Custom Title Scene
https://easierbycode.com/2019-turbo/?titleScript=/examples/scene-scripts/demo-title-hook.js
```js
//
// https://easierbycode.com/examples/scene-scripts/demo-title-hook.js
//
//
// demo-title-hook.js — hook-mode scene script for the TitleScene.
// Run with:  ?titleScript=/examples/scene-scripts/demo-title-hook.js
//
// Decorates the default title screen: spins the logo when the intro settles,
// cycles the subtitle's tint, and logs every GameObject in the scene.

export default {
  onStart(ctx) {
    const { scene } = ctx;
    console.log('[demo-title-hook] gameObjects:', ctx.gameObjects.map((o) => o.name || o.type));

    // Named lookups work for anything the scene names or stores on itself.
    const logo = ctx.find('logo');
    if (logo) {
      scene.tweens.add({ targets: logo, angle: 360, delay: 2200, duration: 1200, ease: 'Cubic.easeInOut' });
    }

    const subTitle = ctx.find('subTitle');
    if (subTitle) {
      let hue = 0;
      const timer = scene.time.addEvent({
        delay: 50, loop: true,
        callback: () => {
          hue = (hue + 4) % 360;
          subTitle.setTint(ctx.Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.7).color);
        },
      });
      ctx.onCleanup(() => timer.remove());
    }
  },

  onEnd(ctx) {
    // Flash white, then continue the default hand-off. Returning a promise
    // makes the transition wait for it.
    const { scene } = ctx;
    const flash = scene.add.rectangle(0, 0, 256, 480, 0xffffff).setOrigin(0, 0).setDepth(5000).setAlpha(0);
    return new Promise((resolve) => {
      scene.tweens.add({ targets: flash, alpha: 1, yoyo: true, duration: 150, onComplete: () => resolve() });
    });
  },
};

```

# Custom Story Scene
https://easierbycode.com/2019-turbo/?advScript=/examples/scene-scripts/demo-adv-replace.js&advScriptMode=replace
```js
//
// https://easierbycode.com/examples/scene-scripts/demo-adv-replace.js
//
//
// demo-adv-replace.js — replace-mode scene script for the story intro
// (AdvScene). Run with:
//   ?advScript=/examples/scene-scripts/demo-adv-replace.js&advScriptMode=replace
//
// Replaces the dialogue interlude with a Star-Wars-style text crawl built from
// scratch; tap / click / SPACE drops straight into the stage via ctx.next().

export default {
  create(ctx) {
    const { scene, Phaser } = ctx;
    const W = scene.scale.width;
    const H = scene.scale.height;

    scene.add.rectangle(0, 0, W, H, 0x000010).setOrigin(0, 0);
    const stars = scene.add.group();
    for (let i = 0; i < 60; i++) {
      const s = scene.add.rectangle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
        1, 1, 0xffffff).setAlpha(Math.random());
      stars.add(s);
    }

    const crawl = scene.add.text(W / 2, H + 20,
      `STAGE ${ctx.stageId + 1}\n\nA custom intro,\nwritten by a\nSCENE SCRIPT.\n\nIt can read and\nchange every\nGameObject in\nthe scene...\n\n(${ctx.gameObjects.length} so far)\n\nTAP TO FIGHT ▶`, {
        fontFamily: 'monospace', fontSize: '16px', color: '#ffe81f', align: 'center', lineSpacing: 6,
      }).setOrigin(0.5, 0);

    scene.tweens.add({ targets: crawl, y: -crawl.height - 40, duration: 16000, ease: 'Linear' });

    scene.input.on('pointerup', () => ctx.next());
    scene.input.keyboard.on('keydown-SPACE', () => ctx.next());
  },

  update(ctx) {
    // Twinkle: cheap per-frame mutation of scene gameObjects.
    for (const o of ctx.gameObjects) {
      if (o.width === 1 && Math.random() < 0.02) o.setAlpha(Math.random());
    }
  },
};
```
