import * as Phaser from "phaser";
import { GridEvents } from "../Object/Grid";

export default class GameEndPanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const bg = new Phaser.GameObjects.Image(scene, 0, 0, "panel");
    this.add(bg);

    const text = new Phaser.GameObjects.Text(scene, 0, -bg.height / 4, "", {
      color: "white",
      fontSize: "70px",
    });
    text.setOrigin(0.5);
    this.add(text);

    const replayButton = new Phaser.GameObjects.Image(
      scene,
      0,
      bg.height / 4,
      "replay"
    );
    replayButton.setScale(0.5);
    this.add(replayButton);
    replayButton.setInteractive();
    replayButton.on("pointerup", (pointer, x, y, evt) => {
      evt.stopPropagation();
      this.emit("replay-game");
      this.setVisible(false);
    });

    scene.events.on(GridEvents.win, () => {
      text.setText("You\nWin");
      this.setVisible(true);
    });

    scene.events.on(GridEvents.gameOver, () => {
      text.setText("Game\nOver");
      this.setVisible(true);
    });

    this.setVisible(false);
  }
}
