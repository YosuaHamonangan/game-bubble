import * as Phaser from "phaser";

export default class FpsText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x, y) {
    super(scene, x, y, "", { color: "white", fontSize: "50px" });
    scene.add.existing(this);
    this.setOrigin(0.5);
  }

  setScore(score: number) {
    this.setText(`Score: ${score}`);
  }
}
