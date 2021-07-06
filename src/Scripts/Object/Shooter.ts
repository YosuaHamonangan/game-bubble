import * as Phaser from "phaser";

export default class Shooter extends Phaser.GameObjects.Image {
  target: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "arrow");
  }

  setTarget(x: number, y: number) {
    const dx = x - this.x;
    const dy = y - this.y;

    const target = new Phaser.Math.Vector2(dx, dy);
    this.setRotation(target.angle() + Math.PI / 2);
    this.target = target;
  }

  getAngle(): number {
    return this.target.angle();
  }
}
