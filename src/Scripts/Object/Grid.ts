import * as Phaser from "phaser";
import Bubble from "./Bubble";
import Shooter from "./shooter";
import { BubbleColors, getRandomColor } from "../Util/Bubble";

interface ICoordinate {
  x: number;
  y: number;
}

interface IPosition {
  col: number;
  row: number;
}

export default class Grid extends Phaser.GameObjects.Container {
  static cols = 8;
  static rows = 12;
  static width = Grid.cols * Bubble.size;
  static height = Grid.rows * Bubble.size;
  static halfWidth = Grid.width / 2;
  static halfHeight = Grid.height / 2;
  static offsetX = -Grid.halfWidth + Bubble.halfSize;
  static offsetY = -Grid.height + Bubble.halfSize;

  shooter: Shooter;
  shotBubble: Bubble | null = null;
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
        bubble1.onCollide();
        bubble2.onCollide();
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

  getBubbleAt(col: number, row: number): Bubble | null {
    return this.bubbleTile[row][col];
  }

  setBubbleAt(bubble: Bubble, col: number, row: number) {
    this.bubbleTile[row][col];
  }

  addBubble(col: number, row: number, color: BubbleColors) {
    if (this.getBubbleAt(col, row)) throw new TypeError("Bubble already exist");

    const { x, y } = this.getTileCoordinate(col, row);
    const bubble = this.bubbleGroup.get(x, y);
    bubble.setColor(color);

    this.add(bubble);
    this.setBubbleAt(bubble, col, row);
  }

  shootBubble(angle: number) {
    const x = 0,
      y = 0;
    const bubble = this.bubbleGroup.get(x, y);
    bubble.shoot(angle);

    this.add(bubble);
    this.shotBubble = bubble;
  }

  addShooter() {
    const x = 0;
    const y = 0;
    const shooter = new Shooter(this.scene, x, y);

    this.add(shooter);
    this.shooter = shooter;
  }

  setEventArea() {
    const x = -Grid.halfWidth,
      y = -Grid.height,
      w = Grid.width,
      h = Grid.height;
    this.setInteractive(
      new Phaser.Geom.Rectangle(x, y, w, h),
      Phaser.Geom.Rectangle.Contains
    );

    this.on("pointermove", (pointer, x, y) => {
      this.shooter.setTarget(x, y);
    });

    this.on("pointerup", (pointer, x, y) => {
      const angle = this.shooter.getAngle();
      this.shootBubble(angle);
    });

    if (this.scene.game.config.physics.arcade.debug) {
      const c = 0x6666ff;
      const area = new Phaser.GameObjects.Rectangle(this.scene, x, y, w, h, c);
      area.setOrigin(0, 0);
      this.add(area);
    }
  }

  getTileCoordinate(col: number, row: number): ICoordinate {
    const x =
      col * Bubble.size + (row % 2 ? Bubble.halfSize : 0) + Grid.offsetX;
    const y = row * Bubble.size + Grid.offsetY;
    return { x, y };
  }

  getGridPosition(x, y): IPosition {
    const row = Math.floor((y - Grid.offsetY + Bubble.halfSize) / Bubble.size);
    const offsetX = Grid.offsetX + (row % 2 ? Bubble.halfSize : 0);
    var col = Math.round((x - offsetX) / Bubble.size);

    return { col, row };
  }
}
