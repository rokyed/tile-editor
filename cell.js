export class Cell {
  x = -1;
  y = -1;
  layer = 0;
  options = {};
  tile = null;
  adjacentTop = null;
  adjacentBottom = null;
  adjacentLeft = null;
  adjacentRight = null;

  constructor(x, y, layer = 0, tile = null, cellOptions = {}) {
    this.x = x;
    this.y = y;
    this.tile = tile;
    this.options = { ...this.options,... cellOptions };
  }

  setTile(tile) {
    this.tile = tile;
  }

  getTile() {
    return this.tile;
  }

  setCellOptions(options) {
    this.options = { ...this.options, ...options };
  }

  getCellOptions() {
    return this.options;
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

  getStats() {
    return `X: ${this.x}\nY: ${this.y}`;
  }

  getAdjacentCellsWhere(arr, condition) {
    const adjacents = [this.adjacentTop, this.adjacentBottom, this.adjacentLeft, this.adjacentRight];

    let result = adjacents.filter(cell => cell && condition(cell));

    for (let cell of result) {
      if (!arr.includes(cell)) {
        arr.push(cell);
        cell.getAdjacentCellsWhere(arr, condition);
      }
    }
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
