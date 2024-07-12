
const CORRELATED_DIRECTIONS = {
  left: 'adjacentLeft',
  right: 'adjacentRight',
  top: 'adjacentTop',
  bottom: 'adjacentBottom'
};

const POSSIBLE_DIRECTIONS = ['left', 'right', 'top', 'bottom'];

export class Cell {
  static deserialize(data, tileset) {
    const cell = new Cell(data.x, data.y);
    const tiles = data.tiles;

    for (let k in tiles) {
      cell.setTile(tileset[tiles[k]], k);
    }

    cell.setCellOptions(data.options);
    return cell;
  }

  x = -1;
  y = -1;
  options = {};
  tiles = {};
  tile = null;
  adjacentTop = null;
  adjacentBottom = null;
  adjacentLeft = null;
  adjacentRight = null;

  constructor(x, y, tile = null, cellOptions = {}) {
    this.x = x;
    this.y = y;
    this.tiles[0] = tile;
    this.options = { ...this.options,... cellOptions };
  }

  setTiles(tiles = {}) {
    for (let k in tiles) {
      this.setTile(tiles[k], k);
    }
  }

  getTiles() {
    return this.tiles;
  }

  setTile(tile, layer = 0) {
    this.tiles[layer] = tile;
  }

  getTile(layer = 0) {
    return this.tiles[layer];
  }

  setCellOptions(options) {
    for (let k in options) {
      if (options[k] === null) {
        delete this.options[k];
      } else {
        this.options[k] = options[k];
      }
    }
  }

  getCellOptions() {
    return this.options;
  }
  clearCellOptions() {
    this.options = {};
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
    const visited = new Set();
    const queue = [this];

    while (queue.length) {
      const cell = queue.shift();
      const adjacents = [cell.adjacentTop, cell.adjacentBottom, cell.adjacentLeft, cell.adjacentRight];

      let neighbors = adjacents.filter(cell => cell && condition(cell, arr));

      for (let i = 0; i < neighbors.length; i++) {

        if (!visited.has(neighbors[i])) {
          queue.push(neighbors[i]);
          visited.add(neighbors[i]);
        }
      }
      arr.add(cell);
    }
  }

  getNextCells(direction, arr, count) {
    if (!POSSIBLE_DIRECTIONS.includes(direction)) {
      return arr;
    }

    if (count === 0) {
      return arr;
    }

    let adjacent = CORRELATED_DIRECTIONS[direction];

    if (this[adjacent]) {
      arr.push(this[adjacent]);

      this[adjacent]?.getNextCells(direction, arr, count - 1);
    }
  }

  serialize() {
    let tiles = this.getTiles();
    let tileRefs = {};

    for (let k in tiles) {
      tileRefs[k] = tiles?.[k]?.getIndex();
    }

    return {
      x: this.x,
      y: this.y,
      layer: this.layer,
      options: this.options,
      tiles: tileRefs
    };
  }

}
