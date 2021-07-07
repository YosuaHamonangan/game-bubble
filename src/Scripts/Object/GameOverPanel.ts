import * as Phaser from "phaser";

interface IConfig {
  onReplay: () => void;
}

export default class GameOverPanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, config: IConfig) {
    super(scene, x, y);

    const bg = new Phaser.GameObjects.Image(scene, 0, 0, "panel");
    this.add(bg);

    const text = new Phaser.GameObjects.Text(
      scene,
      0,
      -bg.height / 4,
      "Game\nOver",
      {
        color: "white",
        fontSize: "70px",
      }
    );
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
    replayButton.on("pointerdown", () => {
      config.onReplay();
    });
  }
}
