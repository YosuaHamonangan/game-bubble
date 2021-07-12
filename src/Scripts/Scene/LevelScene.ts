import * as Phaser from "phaser";
import FpsText from "../Object/FpsText";
import ScoreText from "../Object/ScoreText";
import Grid from "../Object/Grid";
import GameOverPanel from "../Object/GameOverPanel";
import {
  BG_COLOR_HEADER,
  BG_COLOR_GRID,
  BG_COLOR_FOOTER,
} from "../Util/Constant";

export default class LevelScene extends Phaser.Scene {
  private fpsText: FpsText;
  private scoreText: ScoreText;
  private grid: Grid;
  private gameOverPanel: GameOverPanel;

  constructor() {
    super({ key: "LevelScene" });
  }

  preload(): void {}

  create(): void {
    // Header
    const headerBg = this.add
      .rectangle(0, 0, this.cameras.main.width, 100, BG_COLOR_HEADER)
      .setDepth(-1)
      .setOrigin(0);
    this.scoreText = new ScoreText(
      this,
      headerBg.getCenter().x,
      headerBg.getCenter().y
    );

    // Main Section
    const mainBg = this.add
      .rectangle(
        0,
        headerBg.height,
        this.cameras.main.width,
        Grid.height,
        BG_COLOR_GRID
      )
      .setDepth(-1)
      .setOrigin(0);

    const gridX = this.cameras.main.centerX;
    const gridY = mainBg.y + Grid.height;
    this.grid = new Grid(this, gridX, gridY);
    this.add.existing(this.grid);

    // Footer
    const footerBg = this.add
      .rectangle(
        0,
        mainBg.getBottomLeft().y,
        this.cameras.main.width,
        this.cameras.main.height - mainBg.getBottomLeft().y,
        BG_COLOR_FOOTER
      )
      .setDepth(-1)
      .setOrigin(0);
    this.fpsText = new FpsText(
      this,
      footerBg.getBottomLeft().x + 10,
      footerBg.getBottomLeft().y - 10
    );

    this.gameOverPanel = new GameOverPanel(
      this,
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      {
        onReplay: () => {
          this.grid.resetGrid();
          this.closeGameOverPanel();
        },
      }
    );
    this.add.existing(this.gameOverPanel);
    this.closeGameOverPanel();
  }

  onGameOver() {
    this.openGameOverPanel();
  }

  openGameOverPanel() {
    this.gameOverPanel.setVisible(true);
  }

  closeGameOverPanel() {
    this.gameOverPanel.setVisible(false);
  }

  update(): void {
    this.fpsText.update();
    this.scoreText.setScore(this.grid.getScore());
  }
}
