import {Cell} from './cell.js';

export class Scenario {

  static instance = null;

  static getInstance() {
    if (!Scenario.instance) {
      Scenario.instance = new Scenario(4096, 4096);
    }

    return Scenario.instance;
  }

  mapSize = [0, 0];
  mapCells = [];

  constructor(width, height) {
    this.setMapSize(width, height);
  }

  setMapSize(width, height) {
    this.mapSize = [width, height];

    this.populate();
  }

  populate() {
    this.mapCells = [];
    for (let y = 0; y < this.mapSize[1]; y++) {
      for (let x = 0; x < this.mapSize[0]; x++) {
        this.mapCells.push(new Cell(x, y, {}));
      }
    }

    this.setAdjacents();
  }

  setAdjacents() {
    this.mapCells.forEach(cell => {
      const top = this.getCellAtByOffset(cell.x, cell.y - 1);
      const bottom = this.getCellAtByOffset(cell.x, cell.y + 1);
      const left = this.getCellAtByOffset(cell.x - 1, cell.y);
      const right = this.getCellAtByOffset(cell.x + 1, cell.y);

      cell.setAdjacentTop(top);
      cell.setAdjacentBottom(bottom);
      cell.setAdjacentLeft(left);
      cell.setAdjacentRight(right);
    });
  }

  setMapHeight(height) {
    this.setMapSize(this.mapSize[0], height);
  }

  setMapWidth(width) {
    this.setMapSize(width, this.mapSize[1]);
  }

  getMapWidth() {
    return this.mapSize[0];
  }

  getMapHeight() {
    return this.mapSize[1];
  }

  getCellsZone(x, y, spread) {
    let zone = this.getCellsZoneFast(x, y, spread);
    return zone;
  }

  getCellsZoneFast(x, y, spread) {
    const flX = Math.floor(x);
    const flY = Math.floor(y);
    let arr = [];

    let centerCell = this.mapCells.find(cell => cell.isAt(flX, flY));

    if (!centerCell) {
      return arr;
    }

    arr.push(centerCell);

    centerCell.getNextCells('top', arr, spread);
    centerCell.getNextCells('bottom', arr, spread);

    let line = [...arr];

    line.forEach(cell => {
      cell.getNextCells('left', arr, spread);
      cell.getNextCells('right', arr, spread);
    });

    return arr;
  }

  getCellsZoneTraditional(x, y, spread) {
    return this.mapCells.filter(cell => {
      cell.isAtOrInRange(x, y, spread);
    });
  }

  getCellAtByOffset(x, y) {
    let offsetIndex = x + (y * this.mapSize[0]);

    let cell = this.mapCells[offsetIndex];

    if (cell?.isAt(x, y)) {
      return cell;
    }

    return null;
  }

  getCellAt(x, y) {
    return this.mapCells.find(cell => cell.isAt(x, y));
  }

  setCellOptions(x, y, options) {
    const cell = this.getCellAt(x, y);
    if (cell) {
      cell.setCellOptions(options);
    }
  }
}


window.SCENARIO = Scenario.getInstance();
