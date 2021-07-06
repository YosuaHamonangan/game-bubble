import * as Phaser from "phaser";
import Grid from "./Grid";
import { BubbleColors } from "../Util/Bubble";

interface ICoordinate {
  x: number;
  y: number;
}

interface IPosition {
  col: number;
  row: number;
}

const IMAGE_SIZE = 120;
const HALF_IMAGE_SIZE = IMAGE_SIZE / 2;
const SHOOTING_SPEED = 3000;

export default class Bubble extends Phaser.Physics.Arcade.Sprite {
  static size = 80;
  static halfSize = Bubble.size / 2;
  isSnapped = false;
  isShooting = false;
  col: number = null;
  row: number = null;
  private _x: number;
  private _y: number;
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "bubble");

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("bubble", { end: 0 }),
    });

    this.anims.create({
      key: "destroy",
      frames: this.anims.generateFrameNumbers("bubble", {
        start: 0,
        end: 5,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.play("idle");

    this.scene.physics.add.existing(this);
    this.body.setCircle(
      HALF_IMAGE_SIZE,
      this.width / 2 - HALF_IMAGE_SIZE,
      this.height / 2 - HALF_IMAGE_SIZE
    );

    this.setScale(Bubble.size / IMAGE_SIZE);
  }

  setColor(color: BubbleColors) {
    this.tint = color;
  }

  getColor(): BubbleColors {
    return this.tintTopLeft;
  }

  snapToPosition(col: number, row: number) {
    this.isShooting = false;

    const { x, y } = this.getTileCoordinate(col, row);
    this.body.reset(x, y);

    this._x = x;
    this._y = y;

    this.isShooting = false;
    this.isSnapped = true;
  }

  snapToClosest(): IPosition {
    const { col, row } = this.getTilePosition(this.x, this.y);
    this.snapToPosition(col, row);
    return { col, row };
  }

  shoot(angle: number) {
    const vel = new Phaser.Math.Vector2(SHOOTING_SPEED, 0);
    vel.rotate(angle);
    this.setBounce(1);
    this.setVelocity(vel.x, vel.y);
    this.isShooting = true;
    this.isSnapped = false;
  }

  setGridBounds(bounds: Phaser.Geom.Rectangle) {
    this.setCollideWorldBounds(true);
    this.body.setBoundsRectangle(bounds);
  }

  getTileCoordinate(col: number, row: number): ICoordinate {
    const x =
      col * Bubble.size + (row % 2 ? Bubble.halfSize : 0) + Grid.offsetX;
    const y = row * Bubble.size + Grid.offsetY;
    return { x, y };
  }

  getTilePosition(x, y): IPosition {
    const row = Math.floor((y - Grid.offsetY + Bubble.halfSize) / Bubble.size);
    const offsetX = Grid.offsetX + (row % 2 ? Bubble.halfSize : 0);
    var col = Math.round((x - offsetX) / Bubble.size);

    return { col, row };
  }

  update() {
    if (this.isSnapped) {
      const SNAPPING_SPEED = 5;
      const velX = (this._x - this.x) * SNAPPING_SPEED;
      const velY = (this._y - this.y) * SNAPPING_SPEED;
      this.setVelocity(velX, velY);
    }
  }
}
