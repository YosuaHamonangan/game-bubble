import * as Phaser from "phaser";

export default class FpsText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x, y) {
    super(scene, x, y, "", { color: "white", fontSize: "28px" });
    scene.add.existing(this);
    this.setOrigin(1, 0);
  }

  setScore(score: number) {
    this.setText(`Score: ${score}`);
  }
}
