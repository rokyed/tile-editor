import { Cell } from './cell.js';
import { Tile } from './tile.js';
import { Options } from './options.js';
import { defaultImage, defaultImageWidth, defaultImageHeight } from './staticData.js';

export class Scenario {

  static instance = null;

static DEFAULT_LOWER_LAYER_LIMIT = 0;
static DEFAULT_UPPER_LAYER_LIMIT = 32;

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
    instance.visibleLayers = data.visibleLayers || {};
    if (Object.keys(instance.visibleLayers).length === 0) {
      for (let i = 0; i < instance.layerCount; i++) {
        instance.visibleLayers[i] = true;
      }
    }
    instance.palette = data.palette.map(tile => Tile.deserialize(tile));
    instance.mapCells = data.mapCells.map(cell => Cell.deserialize(cell, instance.palette));
    instance.options = Options.deserialize(data.options, instance);
    instance.setAdjacents();

    requestAnimationFrame(() => {
      instance.fireUpdate(true);
    });
  }

  currentTool = () => { };
  layerCount = 1;
  currentLayer = Scenario.DEFAULT_LOWER_LAYER_LIMIT;
  mapSize = [0, 0];
  mapCells = [];
  palette = [];
  visibleLayers = {};
  updatingTimer = null;
  options = null;

  constructor(width, height) {
    this.options = new Options(this);
    this.newScenario(width, height);
  }

  serialize() {
    return {
      mapSize: this.mapSize,
      mapCells: this.mapCells.map(cell => cell.serialize()),
      palette: this.palette.map(tile => tile.serialize()),
      layerCount: this.layerCount,
      options: this.options.serialize(),
      visibleLayers: this.visibleLayers
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
    this.visibleLayers = { 0: true };
    //this.pushImageIntoPalette(defaultImage, defaultImageWidth, defaultImageHeight);
    this.setMapSize(width, height);
    this.fireUpdate();
  }

  pushImageIntoPalette(image, width, height, color = "#FF00FF") {
    let tile = new Tile(this.palette.length, width, height, image, color);
    this.palette.push(tile);
    this.fireUpdate();
  }

  getTileFromPalette(index) {
    return this.palette.find(tile => tile.index === index);
  }

  populate() {
    this.mapCells = [];
    for (let y = 0; y < this.mapSize[1]; y++) {
      for (let x = 0; x < this.mapSize[0]; x++) {
        this.mapCells.push(new Cell(x, y));
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

    if (newLayer > this.layerCount - 1)
      newLayer = this.layerCount - 1;

    if (newLayer > Scenario.DEFAULT_UPPER_LAYER_LIMIT - 1)
      newLayer = Scenario.DEFAULT_UPPER_LAYER_LIMIT - 1;

    this.currentLayer = newLayer;
  }

  decrementLayer() {
    let newLayer = this.currentLayer - 1;

    if (newLayer < Scenario.DEFAULT_LOWER_LAYER_LIMIT)
      newLayer = Scenario.DEFAULT_LOWER_LAYER_LIMIT;

    this.currentLayer = newLayer;
  }

  addLayer() {
    if (this.layerCount >= Scenario.DEFAULT_UPPER_LAYER_LIMIT)
      return;
    this.layerCount += 1;
    this.visibleLayers[this.layerCount - 1] = true;
    this.fireUpdate();
  }

  removeLayer() {
    if (this.layerCount <= 1)
      return;
    this.layerCount -= 1;
    delete this.visibleLayers[this.layerCount];
    this.mapCells.forEach(cell => {
      delete cell.tiles[this.layerCount];
    });
    if (this.currentLayer >= this.layerCount) {
      this.currentLayer = this.layerCount - 1;
    }
    this.fireUpdate();
  }

  setLayerVisibility(layer, visible) {
    this.visibleLayers[layer] = visible;
    this.fireUpdate();
  }

  isLayerVisible(layer) {
    return this.visibleLayers[layer] !== false;
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

  getOptions() {
    return this.options;
  }

  fireUpdate() {
    clearTimeout(this.updatingTimer);

    this.updatingTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('update.ui', { force: true }));
    }, 0);
  }
}


window.SCENARIO = Scenario.getInstance();
