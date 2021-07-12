import * as Phaser from "phaser";

export const DEFAULT_WIDTH = 720;
export const DEFAULT_HEIGHT = 1200;
export const DEFAULT_RATIO = DEFAULT_WIDTH / DEFAULT_HEIGHT;

export const GRAVITY = 1000;

const minAngle = 10;
export const MIN_SHOOTING_ANGLE = Phaser.Math.DegToRad(180 + minAngle);
export const MAX_SHOOTING_ANGLE = Phaser.Math.DegToRad(360 - minAngle);

export const BUBBLE_IMAGE_SIZE = 120;
export const BUBBLE_HALF_IMAGE_SIZE = BUBBLE_IMAGE_SIZE / 2;
// smalled body for some spacing
export const BUBBLE_BODY_RADIUS = BUBBLE_HALF_IMAGE_SIZE * 0.9;
export const BUBBLE_SHOOTING_SPEED = 3000;

export const BG_COLOR_HEADER = 0x999999;
export const BG_COLOR_GRID = 0x666666;
export const BG_COLOR_FOOTER = 0x222222;
