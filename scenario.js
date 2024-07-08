import { Cell } from './cell.js';
import { Tile } from './tile.js';
import { defaultImage, defaultImageWidth, defaultImageHeight } from './staticData.js';

const DEFAULT_UPPER_LAYER_LIMIT = 32;
const DEFAULT_LOWER_LAYER_LIMIT = 1;

export class Scenario {

  static instance = null;

  static getInstance() {
    if (!Scenario.instance) {
      Scenario.instance = new Scenario(128, 128);
    }

    return Scenario.instance;
  }

  static deserialize(data) {
    let instance = Scenario.getInstance();
    instance.setMapSize(data.mapSize[0], data.mapSize[1]);
    instance.currentLayer = 0;
    instance.layerCount = data.layerCount;
    instance.palette = data.palette.map(tile => Tile.deserialize(tile));
    instance.mapCells = data.mapCells.map(cell => Cell.deserialize(cell, instance.palette));
    instance.setAdjacents();

    requestAnimationFrame(() => {
      instance.fireUpdate(true);
    });
  }

  currentTool = () => { };
  layerCount = 1;
  currentLayer = 0;
  mapSize = [0, 0];
  mapCells = [];
  palette = [];
  updatingTimer = null;

  constructor(width, height) {
    this.newScenario(width, height);
  }

  serialize() {
    return {
      mapSize: this.mapSize,
      mapCells: this.mapCells.map(cell => cell.serialize()),
      palette: this.palette.map(tile => tile.serialize()),
      layerCount: this.layerCount
    }
  }

  setMapSize(width, height) {
    this.mapSize = [width, height];
    this.populate();
    this.fireUpdate();
  }

  clearTool() {
    this.currentTool = () => { };
  }

  setCurrentTool(tool) {
    this.currentTool = tool;
  }

  executeTool(x, y) {
    console.log(x, y);
    if (x < 0 || x >= this.mapSize[0] || y < 0 || y >= this.mapSize[1]) {
      return;
    }

    let cell = this.getCellAt(x, y);

    if (!cell)
      return;

    this.currentTool(cell, this.currentLayer);
    this.fireUpdate();
  }

  getPalette() {
    return this.palette;
  }

  newScenario(width, height) {
    this.palette = [];
    this.layerCount = 1;
    this.currentLayer = 0;
    this.pushImageIntoPalette(defaultImage, defaultImageWidth, defaultImageHeight);
    this.setMapSize(width, height);
    this.fireUpdate();
  }

  pushImageIntoPalette(image, width, height) {
    let tile = new Tile(this.palette.length, width, height, image);
    this.palette.push(tile);
    this.fireUpdate();
  }

  getTileFromPalette(index) {
    return this.palette.find(tile => tile.index === index);
  }

  populate() {
    this.mapCells = [];
    let defaultTile = this.palette[0];
    for (let y = 0; y < this.mapSize[1]; y++) {
      for (let x = 0; x < this.mapSize[0]; x++) {
        this.mapCells.push(new Cell(x, y, defaultTile));
      }
    }

    this.setAdjacents();
    this.fireUpdate();
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

  incrementLayer() {
    let newLayer = this.currentLayer + 1;

    if (newLayer > DEFAULT_UPPER_LAYER_LIMIT - 1)
      newLayer = DEFAULT_UPPER_LAYER_LIMIT - 1; 

    this.currentLayer = newLayer;
  }

  decrementLayer() {
    let newLayer = this.currnetLayer - 1; 

    if (newLayer < DEFAULT_LOWER_LAYER_LIMIT)
      newLayer = DEFAULT_LOWER_LAYER_LIMIT;

    this.currentLayer =newLayer;
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

  fireUpdate() {
    clearTimeout(this.updatingTimer);

    this.updatingTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('update.ui', { force: true }));
    }, 0);
  }
}


window.SCENARIO = Scenario.getInstance();
