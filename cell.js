export class Cell {
  x = -1;
  y = -1;
  options = {};

  constructor(x, y, cellOptions) {
    this.x = x;
    this.y = y;
    this.options = cellOptions;
  }

  setCellOptions(options) {
    this.options = options;
  }

  isAtOrInRange(x, y, spread) {
    if (this.x < x - spread || this.x > x + spread) {
      return false;
    }

    if (this.y < y - spread || this.y > y + spread) {
      return false;
    }

    return true;
  }

  isAt(x, y) {
    return this.x === x && this.y === y;
  }
}
