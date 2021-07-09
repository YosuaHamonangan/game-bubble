import * as Phaser from "phaser";
import Bubble, { BubbleStates } from "./Bubble";
import Shooter from "./Shooter";
import LevelScene from "../Scene/LevelScene";
import {
  BubbleColors,
  getRandomColor,
  colorInitials,
} from "../Util/BubbleUtil";
import { DEFAULT_WIDTH } from "../Util/Constant";

export enum GridStates {
  ready,
  shooting,
  gameOver,
}

const neighbourIndexes = {
  odd: [
    [0, -1],
    [1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [1, 1],
  ],
  even: [
    [-1, -1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ],
};

interface IPosition {
  col: number;
  row: number;
}

interface ICoordinate {
  x: number;
  y: number;
}

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
  static topLine = Grid.eventArea.getLineA();
  static rightLine = Grid.eventArea.getLineB();
  static leftLine = Grid.eventArea.getLineD();

  static minCluster = 3;

  shooter: Shooter;
  shootingBubble: Bubble | null = null;
  bubbleGroup: Phaser.Physics.Arcade.Group;
  private bubbleTile: (Bubble | null)[][];
  score: number;
  state: GridStates;
  guideLine: Phaser.GameObjects.Graphics;

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
        this.bubbleTile[row][col] = null;
      }
    }
    // Kill all bubble from prev game
    this.bubbleGroup.getChildren().forEach((bubble) => {
      (bubble as Bubble).kill();
    });

    if (this.shootingBubble) {
      this.shootingBubble.destroy();
    }

    this.fillGrid();

    this.score = 0;
    this.state = GridStates.ready;
  }

  initBubbleGroup() {
    const config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig = {
      classType: Bubble,
      runChildUpdate: true,
    };
    this.bubbleGroup = this.scene.physics.add.group(config);
  }

  fillGrid() {
    // for (let row = 0; row < 5; row++) {
    //   this.bubbleTile[row].forEach((bubble, col) => {
    //     this.addBubble(col, row, getRandomColor());
    //   });
    // }
    // this.loadShootingBubble();

    // For testing
    const { r, b, g, c, o, p, y, n } = colorInitials;

    // this.fillTest([
    //   [n, b, b, b, b, n, n, n],
    //   [n, n, r, n, b, n, n],
    //   [n, n, n, n, n, b, n, n],
    //   [n, n, n, n, r, n, n],
    // ]);
    // this.loadShootingBubble(BubbleColors.blue);

    // this.fillTest([
    //   [p, c, r, b, r, y, b, y],
    //   [y, b, b, b, o, y, c],
    //   [y, y, p, r, r, r, g, p],
    //   [b, g, c, c, y, r, g],
    //   [r, b, g, g, p, y, b, b],
    //   [c],
    //   [r, c],
    // ]);
    // this.loadShootingBubble(BubbleColors.blue);

    // this.fillTest([
    //   [y, r],
    //   [c, g],
    //   [o, p],
    //   [y],
    //   [r, g],
    //   [y, b],
    //   [b, n],
    //   [o, n],
    //   [n, o],
    //   [n, n],
    // ]);
    // this.loadShootingBubble(BubbleColors.orange);
    // const angle = 5.112735053460839;
    // this.shootBubble(angle);
  }

  fillTest(arr) {
    arr.forEach((ro, row) => {
      ro.forEach((co, col) => {
        if (co) this.addBubble(col, row, co);
      });
    });
  }

  getBubbleAt(col: number, row: number): Bubble | null | undefined {
    if (!this.bubbleTile[row]) return undefined;
    return this.bubbleTile[row][col];
  }

  registerBubbleAt(bubble: Bubble | null, col: number, row: number) {
    if (row > Grid.rows || typeof this.bubbleTile[row][col] === "undefined") {
      return console.error(
        `registerBubbleAt : col=${col}, row=${row} is not valid`
      );
    }

    // console.log(`Registering bubble at col=${col}, row=${row}`);
    if (bubble) {
      if (this.bubbleTile[row][col]) {
        throw Error("registerBubbleAt : position already filled");
      }
      bubble.snapToPosition(col, row);
    }
    this.bubbleTile[row][col] = bubble;
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

  async shootBubble(angle: number) {
    if (!this.shootingBubble) {
      throw new TypeError(
        "shootBubble : Unexpected condition - no shooting bubble"
      );
    }

    if (this.state !== GridStates.ready) {
      throw new TypeError(
        "shootBubble : Unexpected condition - Grid not ready"
      );
    }
    this.state = GridStates.shooting;

    const bubble = await this.shootingBubble.shoot(angle);
    this.onHit(bubble);
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
    this.add(shooter);
    this.shooter = shooter;

    this.guideLine = new Phaser.GameObjects.Graphics(this.scene);
    this.add(this.guideLine);
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

  setShootingAngle(angle: number) {
    if (this.shootingBubble) {
      this.shootingBubble.setRotation(angle + Math.PI / 2);
    }
  }

  findIntersectingBubble(line: Phaser.Geom.Line): Bubble | null {
    this.guideLine.lineStyle(4, 0xffffff);

    const bubbles = [...this.bubbleGroup.getChildren()] as Bubble[];

    let result: Bubble | null = null;
    bubbles.forEach((bubble) => {
      if (!bubble.active) return;
      if (bubble === this.shootingBubble) return;

      const circle = new Phaser.Geom.Circle(
        bubble.x,
        bubble.y,
        Grid.halfBubbleSize
      );
      const [point] = Phaser.Geom.Intersects.GetLineToCircle(line, circle);
      if (point) {
        line.setTo(line.x1, line.y1, point.x, point.y);
        result = bubble;
      }
    });
    return result;
  }

  findIntersectingWorld(line: Phaser.Geom.Line) {
    let point;

    // Check top
    point = Phaser.Geom.Intersects.GetLineToLine(line, Grid.topLine);

    // Check left or right
    if (!point) {
      const checkLine = line.x2 < 0 ? Grid.leftLine : Grid.rightLine;
      point = Phaser.Geom.Intersects.GetLineToLine(line, checkLine);
    }

    if (!point) {
      throw new TypeError("findIntersectingWorld failed");
    }

    line.x2 = point.x;
    line.y2 = point.y;
  }

  drawGuideLine(angle) {
    // Draw guide line
    this.guideLine.clear();

    this.guideLine.lineStyle(4, 0xffffff);
    const line = new Phaser.Geom.Line(0, 0, 0, 0);
    const verticalLine = new Phaser.Geom.Line(0, -Grid.height, 0, Grid.height);

    for (var i = 0; i < 3; i++) {
      const { x2, y2 } = line;
      Phaser.Geom.Line.SetToAngle(line, x2, y2, angle, 2 * Grid.height);

      const bubble = this.findIntersectingBubble(line);
      if (bubble) {
        this.guideLine.strokeLineShape(line);
        return;
      }

      this.findIntersectingWorld(line);
      this.guideLine.strokeLineShape(line);

      if (Math.round(line.y2) == -Grid.height) return;

      angle = Phaser.Geom.Line.ReflectAngle(line, verticalLine);
      if (angle < 0) angle += Math.PI * 2;
    }
  }

  setEventArea() {
    this.setInteractive(Grid.eventArea, Phaser.Geom.Rectangle.Contains);

    this.on("pointerdown", (pointer, x, y) => {
      if (this.state !== GridStates.ready) return;
      this.shooter.setTarget(x, y);
      const angle = this.shooter.getAngle();
      this.setShootingAngle(angle);
    });

    this.on("pointermove", (pointer, x, y) => {
      if (this.state !== GridStates.ready) return;
      this.shooter.setTarget(x, y);
      const angle = this.shooter.getAngle();
      this.setShootingAngle(angle);
      this.drawGuideLine(angle);
    });

    this.on("pointerup", (pointer, x, y) => {
      if (this.state !== GridStates.ready) return;
      this.setShootingAngle(-Math.PI / 2);
      const angle = this.shooter.getAngle();
      this.shootBubble(angle);
      this.guideLine.clear();
    });
  }

  getEmptyNeighbour(bubble: Bubble): IPosition {
    const { col, row } = bubble.getTilePosition();
    let dist = Infinity;

    const indexes = row % 2 ? neighbourIndexes.odd : neighbourIndexes.even;
    let pos: IPosition = { col, row };
    const { x: x1, y: y1 } = this.shootingBubble!;
    indexes.forEach(([dCol, dRow]) => {
      const newCol = col + dCol;
      const newRow = row + dRow;

      // Have to be null, undefined meaning invalid position
      if (this.getBubbleAt(newCol, newRow) === null) {
        const { x: x2, y: y2 } = Grid.getTileCoordinate(newCol, newRow);
        const newDist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
        if (newDist < dist) {
          dist = newDist;
          pos.col = newCol;
          pos.row = newRow;
        }
      }
    });

    return pos!;
  }

  getEmptyTop(): IPosition {
    let dist = Infinity;
    let pos: IPosition = { col: 0, row: 0 };
    this.bubbleTile[0].forEach((bubble, newCol) => {
      if (bubble === null) {
        const { x } = Grid.getTileCoordinate(newCol, 0);
        const newDist = Math.abs(x - this.shootingBubble!.x);
        if (newDist < dist) {
          dist = newDist;
          pos.col = newCol;
        }
      }
    });
    return pos;
  }

  onHit(bubble: Bubble | null) {
    if (!this.shootingBubble) {
      throw new TypeError("onHit : Unexpected condition");
    }

    const { col, row } = bubble
      ? this.getEmptyNeighbour(bubble)
      : this.getEmptyTop();
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
    this.state = GridStates.ready;
  }

  gameOver() {
    this.state = GridStates.gameOver;

    if (this.scene instanceof LevelScene) {
      const scene = this.scene as LevelScene;
      scene.onGameOver();
    } else {
      console.warn("Grid is not in LevelScene");
    }
  }

  static getTileCoordinate(col: number, row: number): ICoordinate {
    const x =
      col * Grid.bubbleSize +
      (row % 2 ? Grid.halfBubbleSize : 0) +
      Grid.offsetX;
    const y = row * Grid.bubbleSize + Grid.offsetY;
    return { x, y };
  }
}
