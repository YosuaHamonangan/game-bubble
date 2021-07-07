import * as Phaser from "phaser";
import Grid from "./Grid";
import { BubbleColors } from "../Util/BubbleUtil";

export enum BubbleStates {
  idle,
  snapped,
  moving,
  droping,
}

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
// smalled body for some spacing
const BODY_RADIUS = HALF_IMAGE_SIZE * 0.9;
const SHOOTING_SPEED = 3000;

export default class Bubble extends Phaser.Physics.Arcade.Sprite {
  state: BubbleStates;
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
      key: "pop",
      frames: this.anims.generateFrameNumbers("bubble", {
        start: 0,
        end: 5,
      }),
      frameRate: 20,
      repeat: 0,
    });

    this.play("idle");

    this.scene.physics.add.existing(this);
    this.body.setCircle(
      BODY_RADIUS,
      this.width / 2 - BODY_RADIUS,
      this.height / 2 - BODY_RADIUS
    );
    this.body.onWorldBounds = true;

    this.setScale(Grid.bubbleSize / IMAGE_SIZE);

    // Default state
    this.state = BubbleStates.idle;
  }

  setColor(color: BubbleColors) {
    this.tint = color;
  }

  getColor(): BubbleColors {
    return this.tintTopLeft;
  }

  snapToPosition(col: number, row: number) {
    const { x, y } = this.getTileCoordinate(col, row);
    this.body.reset(x, y);

    this.col = col;
    this.row = row;

    this._x = x;
    this._y = y;

    this.state = BubbleStates.snapped;
  }

  shoot(angle: number) {
    const vel = new Phaser.Math.Vector2(SHOOTING_SPEED, 0);
    vel.rotate(angle);
    this.setVelocity(vel.x, vel.y);
    this.state = BubbleStates.moving;
  }

  getTileCoordinate(col: number, row: number): ICoordinate {
    const x =
      col * Grid.bubbleSize +
      (row % 2 ? Grid.halfBubbleSize : 0) +
      Grid.offsetX;
    const y = row * Grid.bubbleSize + Grid.offsetY;
    return { x, y };
  }

  getTilePosition(): IPosition {
    const row = Math.floor(
      (this.y - Grid.offsetY + Grid.halfBubbleSize) / Grid.bubbleSize
    );
    const offsetX = Grid.offsetX + (row % 2 ? Grid.halfBubbleSize : 0);
    var col = Math.round((this.x - offsetX) / Grid.bubbleSize);

    return { col, row };
  }

  pop() {
    this.scene.sound.play("pop");
    this.anims.complete;
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.destroy();
    });
    this.play("pop");
  }

  drop() {
    const GRAVITY = 1000;
    this.setGravityY(GRAVITY);
    this.setVelocityX((0.5 - Math.random()) * 1000);
    this.state = BubbleStates.droping;
  }

  // Only called when dropped
  onCollideWorld(up: boolean, down: boolean, left: boolean, right: boolean) {
    switch (this.state) {
      case BubbleStates.droping:
        this.destroy();
        break;
      case BubbleStates.snapped:
        break;
      default:
        throw new Error("onCollideWorld : Unexpected condtion");
    }
  }

  update() {
    if (this.state === BubbleStates.snapped) {
      const SNAPPING_SPEED = 5;
      const velX = (this._x - this.x) * SNAPPING_SPEED;
      const velY = (this._y - this.y) * SNAPPING_SPEED;
      this.setVelocity(velX, velY);
    }
  }
}
