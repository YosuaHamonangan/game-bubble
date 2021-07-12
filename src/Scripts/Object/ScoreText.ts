import * as Phaser from "phaser";
import { GridEvents } from "../Object/Grid";

export default class FpsText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x, y) {
    super(scene, x, y, "", { color: "white", fontSize: "50px" });
    scene.add.existing(this);
    this.setOrigin(0.5);

    scene.events.on(GridEvents.score, (score: number) => {
      this.setScore(score);
    });
  }

  setScore(score: number) {
    this.setText(`Score: ${score}`);
  }
}
