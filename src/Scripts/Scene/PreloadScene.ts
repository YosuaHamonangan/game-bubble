import * as Phaser from "phaser";

const basePath = "src/Assets/";
const spritesheets: Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig[] = [
  {
    key: "bubble",
    url: "/Image/bubblesprite.png",
    frameConfig: {
      frameWidth: 180,
      frameHeight: 180,
    },
  },
];
const images: Phaser.Types.Loader.FileTypes.ImageFileConfig[] = [
  {
    key: "shopee",
    url: "/Image/shopee.png",
  },
  {
    key: "arrow",
    url: "/Image/arrow.png",
  },
];

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    this.load.path = basePath;
    this.load.image(images);
    this.load.spritesheet(spritesheets);
  }

  create(): void {
    this.scene.start("LevelScene");
  }
}
