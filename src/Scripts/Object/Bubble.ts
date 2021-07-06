import * as Phaser from "phaser";
import { BubbleColors } from "../Util/Bubble";

const IMAGE_SIZE = 120;
const HALF_IMAGE_SIZE = IMAGE_SIZE / 2;
const SHOOTING_SPEED = 3000;

export default class Bubble extends Phaser.Physics.Arcade.Sprite {
  static size = 80;
  static halfSize = Bubble.size / 2;
  isShooting = false;

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

  shoot(angle: number) {
    const vel = new Phaser.Math.Vector2(SHOOTING_SPEED, 0);
    vel.rotate(angle);
    this.setVelocity(vel.x, vel.y);
    this.isShooting = true;
  }

  onCollide() {
    this.isShooting = false;
  }
}
