import * as Phaser from "phaser";
import Bubble, { BubbleStates } from "./Bubble";
import Shooter from "./Shooter";
import LevelScene from "../Scene/LevelScene";
import { BubbleColors, getRandomColor } from "../Util/BubbleUtil";
import { DEFAULT_WIDTH } from "../Util/Constant";

export default class Grid extends Phaser.GameObjects.Container {
  static cols = 8;
  static rows = 10;
  static width = DEFAULT_WIDTH;
  static bubbleSize = Grid.width / Grid.cols;
  static halfBubbleSize = Grid.bubbleSize / 2;
  static height = (Grid.rows + 1) * Grid.bubbleSize;
  static halfWidth = Grid.width / 2;
  static halfHeight = Grid.height / 2;
  static offsetX = -Grid.halfWidth + Grid.halfBubbleSize;
  static offsetY = -Grid.height + Grid.halfBubbleSize;
  static eventArea = new Phaser.Geom.Rectangle(
    -Grid.halfWidth,
    -Grid.height,
    Grid.width,
    Grid.height
  );
  static minCluster = 3;

  shooter: Shooter;
  shootingBubble: Bubble | null = null;
  bubbleGroup: Phaser.Physics.Arcade.Group;
  private bubbleTile: (Bubble | null)[][];
  score: number;
  isGameOver: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.initBubbleGroup();
    this.setEventArea();
    this.addShooter();

    this.resetGrid();
  }

  resetGrid() {
    this.bubbleTile = this.bubbleTile || [];
    // Add one row for gameover detection
    for (let row = 0; row < Grid.rows + 1; row++) {
      this.bubbleTile[row] = this.bubbleTile[row] || [];

      let cols = row % 2 ? Grid.cols - 1 : Grid.cols;
      for (let col = 0; col < cols; col++) {
        // Remove all bubble from prev game
        if (this.bubbleTile[row][col]) {
          this.bubbleTile[row][col]!.destroy();
        }
        this.bubbleTile[row][col] = null;
      }
    }

    if (this.shootingBubble) {
      this.shootingBubble.destroy();
    }

    this.score = 0;
    this.isGameOver = false;

    this.fillGrid();
  }

  initBubbleGroup() {
    const config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig = {
      classType: Bubble,
      runChildUpdate: true,
      collideWorldBounds: true,
      customBoundsRectangle: new Phaser.Geom.Rectangle(
        this.x - Grid.halfWidth,
        this.y - Grid.height,
        Grid.width,
        // Add height so that the loadded bubble not hit world bound
        Grid.height + Grid.bubbleSize
      ),
      bounceX: 1,
      bounceY: 1,
    };
    this.bubbleGroup = this.scene.physics.add.group(config);

    this.scene.physics.world.on(
      Phaser.Physics.Arcade.Events.WORLD_BOUNDS,
      this.OnBubbleWorldCollision.bind(this)
    );

    this.scene.physics.add.collider(
      this.bubbleGroup,
      this.bubbleGroup,
      (b1, b2) => this.OnBubbleBubbleCollision(b1 as Bubble, b2 as Bubble)
    );
  }

  fillGrid() {
    for (let row = 0; row < 5; row++) {
      this.bubbleTile[row].forEach((bubble, col) => {
        this.addBubble(col, row, getRandomColor());
      });
    }
    this.loadShootingBubble(BubbleColors.orange);

    // For testing
    // this.addBubble(1, 0, BubbleColors.red);
    // this.addBubble(3, 1, BubbleColors.green);
    // this.addBubble(2, 0, BubbleColors.red);
    // this.addBubble(3, 0, BubbleColors.red);
    // this.addBubble(4, 0, BubbleColors.red);
    // this.addBubble(4, 1, BubbleColors.red);
    // this.addBubble(5, 2, BubbleColors.red);
    // this.addBubble(5, 3, BubbleColors.blue);
    // this.addBubble(5, 4, BubbleColors.blue);
    // this.addBubble(6, 4, BubbleColors.blue);
    // this.loadShootingBubble(BubbleColors.red);
  }

  getBubbleAt(col: number, row: number): Bubble | null | undefined {
    if (!this.bubbleTile[row]) return undefined;
    return this.bubbleTile[row][col];
  }

  registerBubbleAt(bubble: Bubble | null, col: number, row: number) {
    if (typeof this.bubbleTile[row][col] === "undefined") {
      throw new TypeError(
        `registerBubbleAt : col=${col}, row=${row} is not valid`
      );
    }

    // console.log(`Registering bubble at col=${col}, row=${row}`);

    this.bubbleTile[row][col] = bubble;
    if (bubble) {
      bubble.snapToPosition(col, row);
    }
  }

  createBubble(): Bubble {
    const bubble = this.bubbleGroup.get(0, 0) as Bubble;
    bubble.reset();
    bubble.setGrid(this);
    // To make sure shooter is above bubble
    this.addAt(bubble, 0);
    return bubble;
  }

  addBubble(col: number, row: number, color: BubbleColors) {
    if (this.getBubbleAt(col, row)) {
      throw new TypeError(`addBubble : Bubble exist at col=${col}, row=${row}`);
    }

    const bubble = this.createBubble();
    bubble.setColor(color);
    this.registerBubbleAt(bubble, col, row);
  }

  removeBubble(bubble: Bubble) {
    bubble.kill();
    this.calcScore(bubble);
  }

  async dropBubble(bubble: Bubble) {
    const { col, row } = bubble;
    this.registerBubbleAt(null, col, row);

    this.bubbleGroup.remove(bubble);
    await bubble.drop();
    this.bubbleGroup.add(bubble);
    this.removeBubble(bubble);
  }

  async popBubble(bubble: Bubble) {
    const { col, row } = bubble;
    this.registerBubbleAt(null, col, row);
    await bubble.pop();
    this.removeBubble(bubble);
  }

  shootBubble(angle: number) {
    if (!this.shootingBubble) return;
    if (this.shootingBubble.state === BubbleStates.moving) return;
    this.shootingBubble.shoot(angle);
  }

  loadShootingBubble(color = getRandomColor()) {
    const bubble = this.createBubble();
    bubble.setColor(color);
    this.shootingBubble = bubble;
  }

  calcScore(bubble: Bubble) {
    this.score++;
  }

  getScore(): number {
    return this.score;
  }

  addShooter() {
    const shooter = new Shooter(this.scene, 0, 0);
    shooter.setDepth(1);
    this.add(shooter);
    this.shooter = shooter;
  }

  getCluster(col: number, row: number): Bubble[] {
    const bubble = this.getBubbleAt(col, row);
    if (!bubble) return [];

    // Map of tile not searched yet
    const searchMap = this.bubbleTile.map((r) => r.map((bubble) => !!bubble));
    return this.searchCluster(col, row, bubble.getColor(), [], searchMap);
  }

  getFloating(): Bubble[] {
    // Map of tile not searched yet
    const searchMap = this.bubbleTile.map((r) => r.map((bubble) => !!bubble));

    // Check cluster on 1st row and marked them in searchMap
    this.bubbleTile[0].forEach((b, col) => {
      this.searchCluster(col, 0, null, [], searchMap);
    });

    // Search all unmarked bubble searchMap
    const floatingBubbles: Bubble[] = [];
    searchMap.forEach((r, row) =>
      r.forEach((isUnmarked, col) => {
        if (isUnmarked) {
          floatingBubbles.push(this.bubbleTile[row][col]!);
        }
      })
    );

    return floatingBubbles;
  }

  private searchCluster(
    col: number,
    row: number,
    color: BubbleColors | null,
    cluster: Bubble[],
    searchMap: boolean[][]
  ): Bubble[] {
    // Skip if tile already searched
    if (!(searchMap[row] && searchMap[row][col])) return cluster;

    const bubble = this.getBubbleAt(col, row)!;
    if (color && color !== bubble.getColor()) return cluster;
    cluster.push(bubble);
    searchMap[row][col] = false;

    this.searchCluster(col - 1, row, color, cluster, searchMap);
    this.searchCluster(col + 1, row, color, cluster, searchMap);

    this.searchCluster(col, row - 1, color, cluster, searchMap);
    this.searchCluster(col, row + 1, color, cluster, searchMap);

    if (row % 2) {
      this.searchCluster(col + 1, row - 1, color, cluster, searchMap);
      this.searchCluster(col + 1, row + 1, color, cluster, searchMap);
    } else {
      this.searchCluster(col - 1, row - 1, color, cluster, searchMap);
      this.searchCluster(col - 1, row + 1, color, cluster, searchMap);
    }

    return cluster;
  }

  rotateShootingBubble(angle: number) {
    if (this.shootingBubble) {
      this.shootingBubble.setRotation(angle);
    }
  }

  setEventArea() {
    this.setInteractive(Grid.eventArea, Phaser.Geom.Rectangle.Contains);

    this.on("pointerdown", (pointer, x, y) => {
      if (this.isGameOver) return;
      this.shooter.setTarget(x, y);
      const angle = this.shooter.getAngle();
      this.rotateShootingBubble(angle + Math.PI / 2);
    });

    this.on("pointermove", (pointer, x, y) => {
      if (this.isGameOver) return;
      this.shooter.setTarget(x, y);
      const angle = this.shooter.getAngle();
      this.rotateShootingBubble(angle + Math.PI / 2);
    });

    this.on("pointerup", (pointer, x, y) => {
      if (this.isGameOver) return;
      this.rotateShootingBubble(0);
      const angle = this.shooter.getAngle();
      this.shootBubble(angle);
    });
  }

  OnBubbleBubbleCollision(b1: Bubble, b2: Bubble) {
    if (b1 === this.shootingBubble || b2 === this.shootingBubble) {
      const otherBubble = b1 === this.shootingBubble ? b2 : b1;

      if (this.shootingBubble.state === BubbleStates.moving) {
        this.onHit(otherBubble);
      } else if (this.shootingBubble.state === BubbleStates.idle) {
        // For when dropped bubble hit loadded bubble
        otherBubble.pop();
      } else {
        throw new TypeError("OnBubbleBubbleCollision : Unexpected condition");
      }
    }
  }

  OnBubbleWorldCollision(body: Phaser.Physics.Arcade.Body, up: boolean) {
    // Shooting bubble hit ceiling
    const bubble = body.gameObject as Bubble;
    if (bubble === this.shootingBubble && up) {
      this.onHit(null);
    }
  }

  onHit(bubble: Bubble | null) {
    if (!this.shootingBubble) {
      throw new TypeError("onHit : Unexpected condition");
    }

    let { col, row } = this.shootingBubble.getTilePosition();
    if (bubble) {
      col = bubble.col;
      if (row === bubble.row) {
        col += this.shootingBubble.x > bubble.x ? 1 : -1;
      } else {
        if (row % 2) {
          col += this.shootingBubble.x > bubble.x ? 0 : -1;
        } else {
          col += this.shootingBubble.x > bubble.x ? 1 : 0;
        }
      }
    } else {
      console.log("adsadsasd");
      row = 0;
    }

    // Make sure the column is within limit
    col = Math.min(col, row % 2 ? Grid.cols - 2 : Grid.cols - 1);
    col = Math.max(col, 0);

    this.registerBubbleAt(this.shootingBubble, col, row);
    if (row >= Grid.rows) {
      return this.gameOver();
    }

    const cluster = this.getCluster(col, row);
    if (cluster.length >= Grid.minCluster) {
      cluster.forEach((bubble) => {
        this.popBubble(bubble);
      });
    }

    const floatingBubbles = this.getFloating();
    floatingBubbles.forEach((bubble) => {
      this.dropBubble(bubble);
    });

    this.loadShootingBubble();
  }

  gameOver() {
    this.isGameOver = true;

    if (this.scene instanceof LevelScene) {
      const scene = this.scene as LevelScene;
      scene.onGameOver();
    } else {
      console.warn("Grid is not in LevelScene");
    }
  }
}
