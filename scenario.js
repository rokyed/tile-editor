import {Cell} from './cell.js';

export class Scenario {

  static instance = null;

  static getInstance() {
    if (!Scenario.instance) {
      Scenario.instance = new Scenario(128,128);
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
  }

  getMapWidth() {
    return this.mapSize[0];
  }

  getMapHeight() {
    return this.mapSize[1];
  }

  getCellsZone(x, y, spread) {
    return this.mapCells.filter(cell => cell.isAtOrInRange(x, y, spread));
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
