import * as Phaser from "phaser";
import { MIN_SHOOTING_ANGLE, MAX_SHOOTING_ANGLE } from "../Util/Constant";

export default class Shooter extends Phaser.GameObjects.Image {
  target: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "arrow");
  }

  setTarget(x: number, y: number) {
    const dx = x - this.x;
    const dy = y - this.y;

    const target = new Phaser.Math.Vector2(dx, dy);
    let angle = target.angle();
    angle = Math.max(angle, MIN_SHOOTING_ANGLE);
    angle = Math.min(angle, MAX_SHOOTING_ANGLE);
    target.setAngle(angle);

    this.setRotation(angle + Math.PI / 2);
    this.target = target;
  }

  getAngle(): number {
    return this.target.angle();
  }
}
