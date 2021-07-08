export type PhaserConfig = Phaser.Types.Core.GameConfig;

import LevelScene from "../Scene/LevelScene";
import PreloadScene from "../Scene/PreloadScene";

import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../Util/Constant";

export const config: PhaserConfig = {
  title: "PhaserGame",
  type: Phaser.AUTO,
  scale: {
    parent: "phaser-app",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
      gravity: { y: 0 },
    },
  },
  backgroundColor: "#493a52",
  scene: [PreloadScene, LevelScene],
};
