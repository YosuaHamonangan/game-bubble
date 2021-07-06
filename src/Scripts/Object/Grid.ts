import * as Phaser from "phaser";
import Bubble from "./Bubble";
import Shooter from "./Shooter";
import { BubbleColors, getRandomColor } from "../Util/Bubble";

export default class Grid extends Phaser.GameObjects.Container {
  static cols = 8;
  static rows = 12;
  static width = Grid.cols * Bubble.size;
  static height = (Grid.rows + 1) * Bubble.size;
  static halfWidth = Grid.width / 2;
  static halfHeight = Grid.height / 2;
  static offsetX = -Grid.halfWidth + Bubble.halfSize;
  static offsetY = -Grid.height + Bubble.halfSize;
  static gridBounds = new Phaser.Geom.Rectangle(
    -Grid.halfWidth,
    -Grid.height,
    Grid.width,
    Grid.height
  );
  static minCluster = 3;

  shooter: Shooter;
  shootingBubble: Bubble | null = null;
  bubbleGroup: Phaser.Physics.Arcade.Group;
  private bubbleTile: Bubble[][];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.initBubbleGroup();
    this.setEventArea();
    this.addShooter();
    this.fillGrid();
  }

  initBubbleGroup() {
    this.bubbleTile = [];
    for (let row = 0; row < Grid.rows; row++) {
      this.bubbleTile[row] = [];
      let cols = row % 2 ? Grid.cols - 1 : Grid.cols;
      for (let col = 0; col < cols; col++) {
        this.bubbleTile[row][col] = null;
      }
    }

    this.bubbleGroup = this.scene.physics.add.group({
      classType: Bubble,
      runChildUpdate: true,
    });

    this.scene.physics.add.collider(
      this.bubbleGroup,
      this.bubbleGroup,
      (bubble1: Bubble, bubble2: Bubble) => {
        if (
          bubble1 === this.shootingBubble ||
          bubble2 === this.shootingBubble
        ) {
          const { col, row } = this.shootingBubble.snapToClosest();
          this.setBubbleAt(this.shootingBubble, col, row);
          const cluster = this.getCluster(col, row);

          if (cluster.length >= Grid.minCluster) {
            cluster.forEach((bubble) => bubble.destroy());
          }

          this.loadShootingBubble();
        }
      }
    );
  }

  fillGrid() {
    for (let row = 0; row < 5; row++) {
      this.bubbleTile[row].forEach((bubble, col) => {
        this.addBubble(col, row, getRandomColor());
      });
    }
  }

  getBubbleAt(col: number, row: number): Bubble | null | undefined {
    if (!this.bubbleTile[row]) return undefined;
    return this.bubbleTile[row][col];
  }

  setBubbleAt(bubble: Bubble, col: number, row: number) {
    if (typeof this.bubbleTile[row][col] === "undefined") {
      throw new TypeError(`setBubbleAt : col=${col}, row=${row} is not valid`);
    }

    this.bubbleTile[row][col] = bubble;
  }

  addBubble(col: number, row: number, color: BubbleColors) {
    if (this.getBubbleAt(col, row)) {
      throw new TypeError(`addBubble : Bubble exist at col=${col}, row=${row}`);
    }

    const bubble = this.bubbleGroup.get(0, 0) as Bubble;
    bubble.snapToPosition(col, row);
    bubble.setColor(color);

    this.add(bubble);
    this.setBubbleAt(bubble, col, row);
  }

  shootBubble(angle: number) {
    this.shootingBubble.shoot(angle);
  }

  loadShootingBubble() {
    const bubble = this.bubbleGroup.get(0, 0);
    bubble.setColor(getRandomColor());
    bubble.setGridBounds(0, 0, Grid.width, Grid.height);

    this.add(bubble);
    this.shootingBubble = bubble;
  }

  addShooter() {
    const shooter = new Shooter(this.scene, 0, 0);

    this.add(shooter);
    this.shooter = shooter;

    this.loadShootingBubble();
  }

  getCluster(col: number, row: number): Bubble[] {
    const bubble = this.getBubbleAt(col, row);
    if (!bubble) return [];

    // Map of tile not searched yet
    const searchMap = this.bubbleTile.map((row) =>
      row.map((bubble) => !!bubble)
    );
    return this.searchCluster(col, row, bubble.getColor(), [], searchMap);
  }

  private searchCluster(
    col: number,
    row: number,
    color: BubbleColors,
    cluster: Bubble[],
    searchMap: boolean[][]
  ): Bubble[] {
    // Skip if tile already searched
    if (!(searchMap[row] && searchMap[row][col])) return cluster;

    const bubble = this.getBubbleAt(col, row);
    if (color !== bubble.getColor()) return cluster;
    cluster.push(bubble);
    searchMap[row][col] = false;

    this.searchCluster(col - 1, row, color, cluster, searchMap);
    this.searchCluster(col + 1, row, color, cluster, searchMap);

    this.searchCluster(col, row - 1, color, cluster, searchMap);
    this.searchCluster(col, row + 1, color, cluster, searchMap);

    if (row % 2) {
      this.searchCluster(col + 1, row - 1, color, cluster, searchMap);
      this.searchCluster(col + 1, row + 1, color, cluster, searchMap);
    } else {
      this.searchCluster(col - 1, row - 1, color, cluster, searchMap);
      this.searchCluster(col - 1, row + 1, color, cluster, searchMap);
    }

    return cluster;
  }

  setEventArea() {
    this.setInteractive(Grid.gridBounds, Phaser.Geom.Rectangle.Contains);

    this.on("pointermove", (pointer, x, y) => {
      this.shooter.setTarget(x, y);
    });

    this.on("pointerup", (pointer, x, y) => {
      const angle = this.shooter.getAngle();
      this.shootBubble(angle);
    });

    if (this.scene.game.config.physics.arcade.debug) {
      const c = 0x6666ff;
      const graphics = new Phaser.GameObjects.Graphics(this.scene);
      graphics.lineStyle(1, 0x00ff00, 1);
      graphics.strokeRectShape(Grid.gridBounds);
      this.add(graphics);
    }
  }
}
