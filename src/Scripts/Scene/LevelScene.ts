import * as Phaser from "phaser";
import FpsText from "../Object/FpsText";
import Grid from "../Object/Grid";

export default class LevelScene extends Phaser.Scene {
  private fpsText: FpsText;

  constructor() {
    super({ key: "LevelScene" });
  }

  preload(): void {}

  create(): void {
    this.fpsText = new FpsText(this);

    const gridX = this.cameras.main.centerX;
    const gridY = this.cameras.main.height - 100;

    const grid = new Grid(this, gridX, gridY);
    this.add.existing(grid);
  }

  update(): void {
    this.fpsText.update();
  }
}
