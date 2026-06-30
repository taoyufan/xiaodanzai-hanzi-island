import Phaser from 'phaser';
import './styles.css';
import { HomeScene } from './game/scenes/HomeScene';
import { AvatarScene } from './game/scenes/AvatarScene';
import { MapScene } from './game/scenes/MapScene';
import { GameScene } from './game/scenes/GameScene';
import { BossScene } from './game/scenes/BossScene';
import { ResultScene } from './game/scenes/ResultScene';
import { ParentScene } from './game/scenes/ParentScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 750,
  height: 1334,
  backgroundColor: '#8ad7ff',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 750,
    height: 1334,
  },
  input: {
    activePointers: 3,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
  scene: [HomeScene, AvatarScene, MapScene, GameScene, BossScene, ResultScene, ParentScene],
};

const game = new Phaser.Game(config);

if (import.meta.env.DEV || window.location.hostname === 'localhost') {
  (window as unknown as { __HANZI_GAME__?: Phaser.Game }).__HANZI_GAME__ = game;
}
