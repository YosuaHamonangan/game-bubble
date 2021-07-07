import * as Phaser from "phaser";
import FpsText from "../Object/FpsText";
import ScoreText from "../Object/ScoreText";
import Grid from "../Object/Grid";

export default class LevelScene extends Phaser.Scene {
  private fpsText: FpsText;
  private scoreText: ScoreText;
  private grid: Grid;

  constructor() {
    super({ key: "LevelScene" });
  }

  preload(): void {}

  create(): void {
    this.fpsText = new FpsText(this);
    this.scoreText = new ScoreText(this, this.cameras.main.width - 10, 10);

    const gridX = this.cameras.main.centerX;
    const gridY = this.cameras.main.height - 100;
    this.grid = new Grid(this, gridX, gridY);
    this.add.existing(this.grid);
  }

  update(): void {
    this.fpsText.update();
    this.scoreText.setScore(this.grid.getScore());
  }
}
