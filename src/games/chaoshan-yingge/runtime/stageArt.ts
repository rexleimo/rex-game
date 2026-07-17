import * as Phaser from 'phaser';

import type { StageTheme } from '../core/types';

export interface StageArt {
  scrolling: Phaser.GameObjects.Container[];
}

const WIDTH = 1280;
const HEIGHT = 720;

const THEME_COLORS: Record<StageTheme, { sky: number; road: number; accent: number; roof: number }> = {
  'village-road': { sky: 0xf2e5c9, road: 0xd9c397, accent: 0xb62e23, roof: 0x6d8585 },
  'ancestral-hall': { sky: 0xefe0c2, road: 0xd1b889, accent: 0x9f2d22, roof: 0x526f72 },
  'temple-square': { sky: 0xf4e7c9, road: 0xd7bf8c, accent: 0xb23a28, roof: 0x668486 },
  'lantern-street': { sky: 0xd8d9c8, road: 0xc8b17f, accent: 0xc2462f, roof: 0x536c76 },
  'grand-stage': { sky: 0xf1dfbd, road: 0xd3b77d, accent: 0xb52c20, roof: 0x56777a },
};

function addHouse(scene: Phaser.Scene, x: number, colors: typeof THEME_COLORS[StageTheme]) {
  const house = scene.add.container(x, 0);
  const wall = scene.add.rectangle(110, 395, 190, 142, 0xe9dcc0, 1).setStrokeStyle(3, colors.roof, 0.62);
  const roof = scene.add.triangle(110, 305, -12, 92, 110, 18, 232, 92, colors.roof, 1);
  const door = scene.add.rectangle(110, 424, 46, 82, colors.accent, 1);
  const banner = scene.add.rectangle(188, 370, 18, 78, colors.accent, 1);
  house.add([wall, roof, door, banner]);
  return house;
}

function addHall(scene: Phaser.Scene, x: number, colors: typeof THEME_COLORS[StageTheme]) {
  const hall = scene.add.container(x, 0);
  hall.add([
    scene.add.rectangle(150, 390, 272, 164, 0xe6d4b3).setStrokeStyle(3, colors.roof, 0.72),
    scene.add.triangle(150, 284, -28, 106, 150, 10, 328, 106, colors.roof),
    scene.add.rectangle(78, 405, 28, 118, colors.accent),
    scene.add.rectangle(222, 405, 28, 118, colors.accent),
    scene.add.rectangle(150, 348, 90, 28, 0xd1a64d),
  ]);
  return hall;
}

function addLantern(scene: Phaser.Scene, x: number, y: number, color: number) {
  const lantern = scene.add.container(x, y);
  lantern.add([
    scene.add.line(0, -48, 0, 0, 0, 88, 0x69513d, 0.8).setLineWidth(3),
    scene.add.ellipse(0, 34, 38, 52, color, 0.92),
    scene.add.rectangle(0, 34, 30, 3, 0xe9bd58, 0.9),
  ]);
  return lantern;
}

export function drawStageArt(scene: Phaser.Scene, theme: StageTheme): StageArt {
  const colors = THEME_COLORS[theme];
  scene.cameras.main.setBackgroundColor(colors.sky);
  const sky = scene.add.graphics();
  sky.fillStyle(colors.sky).fillRect(0, 0, WIDTH, HEIGHT);
  sky.fillStyle(0xe4ac4e, theme === 'lantern-street' ? 0.2 : 0.3).fillCircle(1040, 132, 88);
  sky.lineStyle(2, colors.roof, 0.18);
  for (let y = 76; y < 340; y += 56) sky.lineBetween(0, y, WIDTH, y - 24);

  const scrolling: Phaser.GameObjects.Container[] = [];
  for (let x = -160; x < WIDTH + 320; x += theme === 'ancestral-hall' ? 330 : 245) {
    const building = theme === 'ancestral-hall' || theme === 'temple-square'
      ? addHall(scene, x, colors)
      : addHouse(scene, x, colors);
    scrolling.push(building);
  }

  if (theme === 'lantern-street' || theme === 'grand-stage') {
    for (let x = 80; x < WIDTH + 180; x += 180) scrolling.push(addLantern(scene, x, 205, colors.accent));
  }

  if (theme === 'grand-stage') {
    const gate = scene.add.container(980, 0);
    gate.add([
      scene.add.rectangle(120, 340, 300, 24, colors.accent),
      scene.add.rectangle(12, 405, 28, 178, colors.accent),
      scene.add.rectangle(228, 405, 28, 178, colors.accent),
      scene.add.text(120, 355, '英歌会演', {
        fontFamily: '"Noto Serif SC", serif', fontSize: '30px', fontStyle: 'bold', color: '#f8e7c3',
      }).setOrigin(0.5, 0),
    ]);
    scrolling.push(gate);
  }

  scene.add.rectangle(WIDTH / 2, 544, WIDTH, 128, colors.road);
  scene.add.rectangle(WIDTH / 2, 489, WIDTH, 5, colors.accent, 0.76);
  const road = scene.add.graphics();
  road.lineStyle(3, 0x9d8058, 0.34);
  for (let x = -40; x < WIDTH; x += 118) road.lineBetween(x, 586, x + 76, 566);
  return { scrolling };
}
