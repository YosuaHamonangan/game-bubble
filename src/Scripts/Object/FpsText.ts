import * as Phaser from "phaser";

export default class FpsText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "", { color: "white", fontSize: "50px" });
    scene.add.existing(this);
    this.setOrigin(0, 1);
  }

  update() {
    this.setText(`fps: ${Math.floor(this.scene.game.loop.actualFps)}`);
  }
}
