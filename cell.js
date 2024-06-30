export class Cell {
  x = -1;
  y = -1;
  options = {};
  adjacentTop = null;
  adjacentBottom = null;
  adjacentLeft = null;
  adjacentRight = null;

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

  setAdjacentTop(cell) {
    this.adjacentTop = cell;
  }

  setAdjacentBottom(cell) {
    this.adjacentBottom = cell;
  }

  setAdjacentLeft(cell) {
    this.adjacentLeft = cell;
  }

  setAdjacentRight(cell) {
    this.adjacentRight = cell;
  }

  getNextCells(direction, arr, count) {
    const possibleDirections = ['left', 'right', 'top', 'bottom']

    if (!possibleDirections.includes(direction)) {
      return arr;
    }

    if (count === 0) {
      return arr;
    }

    const correlatedDirection = {
      left: 'adjacentLeft',
      right: 'adjacentRight',
      top: 'adjacentTop',
      bottom: 'adjacentBottom'
    }

    let adjacent = correlatedDirection[direction];

    if (this[adjacent]) {
      arr.push(this[adjacent]);

      this[adjacent]?.getNextCells(direction, arr, count - 1);
    }
  }
}
