import { Scenario } from "./scenario.js";
import { defaultImage } from './staticData.js';
const DEFAULT_CELL_SIZE = 32;
const DEFAULT_CELL_MAX_ZOOM = 128;
const DEFAULT_CELL_MIN_ZOOM = 2;
const OVERSPILL = 2;

export class XCanvasRenderer extends HTMLElement {
  renderStats = false;
  cellSize = DEFAULT_CELL_SIZE;
  xPixel = 0;
  yPixel = 0;
  x = 0;
  y = 0;
  spread = 0;
  imageCache = {};
  imageRenderer = null;
  canvas = null;
  isInteracting = false;
  renderCurrentLayerOnly = false;

  constructor() {
    super();
    this.isInteracting = false;
    this.canvas = document.createElement('canvas');
    this.imageRenderer = document.createElement('div');
    this.imageRenderer.style.display = 'none';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.canvas);
    this.shadowRoot.appendChild(this.imageRenderer);
  }

  connectedCallback() {
    this.resetViewport();

    window.addEventListener('update.ui', (event) => {
      if (event?.detail?.force) {
        this.resetViewport();
      } else {
        this.rafRender();
      }
    });

   // this.addEventListener('click', this.onTileInteract.bind(this));
    this.addEventListener('mousedown', this.startOnTileInteract.bind(this));
    this.addEventListener('mouseup', this.stopOnTileInteract.bind(this));
    this.addEventListener('mousemove', this.onTileInteract.bind(this));


    this.addEventListener('wheel', this.onScroll.bind(this));
  }

  onScroll(event) {
    console.log('scroll', event);
    let dx = 0;
    let dy = 0;

    if (event.shiftKey) {
      dx = event.deltaY;
      dy = event.deltaX;
    } else {
      dx = event.deltaX;
      dy = event.deltaY;
    }

    this.xPixel += dx / this.cellSize;
    this.yPixel += dy / this.cellSize;

    this.x = Math.floor(this.xPixel);
    this.y = Math.floor(this.yPixel);


    if (this.x < 0) {
      this.x = 0;
      this.xPixel = this.x;
    }

    if (this.y < 0) {
      this.y = 0;
      this.yPixel = this.y;
    }

    const scenario = Scenario.getInstance();

    if (this.x > scenario.getMapWidth() - 1) {
      this.x = Scenario.getInstance().getMapWidth() - 1;
      this.xPixel = this.x;
    }

    if (this.y > Scenario.getInstance().getMapHeight() - 1) {
      this.y = Scenario.getInstance().getMapWidth() - 1;
      this.yPixel = this.y;
    }


    this.render();
  }

  startOnTileInteract(event) {
    this.isInteracting = true;
    this.onTileInteract(event);
  }

  stopOnTileInteract(event) {
    this.isInteracting = false;
  }

  onTileInteract(event) {
    if (!this.isInteracting)
      return;

    let tileXY = this.getTileXYFromClickXY(event.offsetX, event.offsetY);
    Scenario.getInstance().executeTool(tileXY.x, tileXY.y);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.rafRender();
  }

  getTileXYFromClickXY(x, y) {
    let rect = this.getBoundingClientRect();
    let centerX = Math.floor(rect.width / 2);
    let centerY = Math.floor(rect.height / 2);
    let cellX = Math.floor((x - centerX) / this.cellSize) + this.x;
    let cellY = Math.floor((y - centerY) / this.cellSize) + this.y;
    return { x: cellX, y: cellY };
  }

  render() {
    let rect = this.getBoundingClientRect();
    this.spread = Math.floor((Math.max(rect.width, rect.height) / this.cellSize) / 2) + OVERSPILL;
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.ctx.fillStyle = []
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    let centerX = Math.floor(this.canvas.width / 2);
    let centerY = Math.floor(this.canvas.height / 2);

    const scenario = Scenario.getInstance();
    const cells = scenario.getCellsZone(this.x, this.y, this.spread);
    cells.forEach((cell) => {
      const x = centerX + (cell.x - this.x) * this.cellSize;
      const y = centerY + (cell.y - this.y) * this.cellSize;
      let tiles = cell.getTiles();
      const bg = this.getImageFromCache(defaultImage);
      if (bg) {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(bg, x, y, this.cellSize, this.cellSize);
      }
      if (this.renderStats) {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
      }

      if (this.renderCurrentLayerOnly) {
        const tile = tiles[scenario.currentLayer];
        if (tile) {
          const image = this.getImageFromCache(tile.getImage());
          if (image) {
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.drawImage(image, x, y, this.cellSize, this.cellSize);
          }
        }
      } else {
        for (let k in tiles) {
          const tile = tiles[k];
          if (tile) {
            const image = this.getImageFromCache(tile.getImage());
            if (image) {
              this.ctx.imageSmoothingEnabled = false;
              this.ctx.drawImage(image, x, y, this.cellSize, this.cellSize);
            }
          } 
        }
      }


      if (this.renderStats) {
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText(`(${cell.x}, ${cell.y})`, x, y + this.cellSize);
      }
    });
  }

  zoomIn() {
    this.cellSize = this.cellSize * 2;

    if (this.cellSize > DEFAULT_CELL_MAX_ZOOM) {
      this.cellSize = DEFAULT_CELL_MAX_ZOOM;
    }

    this.rafRender();
  }

  zoomOut() {
    this.cellSize = this.cellSize / 2;

    if (this.cellSize < DEFAULT_CELL_MIN_ZOOM) {
      this.cellSize = DEFAULT_CELL_MIN_ZOOM;
    }

    this.rafRender();
  }


  resetViewport() {
    this.x = Math.floor(Scenario.getInstance().getMapWidth() / 2);
    this.y = Math.floor(Scenario.getInstance().getMapHeight() / 2);
    this.xPixel = this.x;
    this.yPixel = this.y;
    this.rafRender();
  }

  zoomReset() {
    this.cellSize = DEFAULT_CELL_SIZE;
    this.rafRender();
  }

  toggleStats() {
    this.renderStats = !this.renderStats;
    this.rafRender();
  }

  lazyRender() {
    this.rafRender();
  }

  toggleRenderOnlyCurrentLayer() {
    this.renderCurrentLayerOnly = !this.renderCurrentLayerOnly;
    this.rafRender();
  }

  rafRender() {
    requestAnimationFrame(() => {
      this.render();
    });
  }


  getImageFromCache(url) {
    if (this.imageCache[`BUSY_${url}`]) {
      return null;
    }

    if (this.imageCache[url]) {
      return this.imageCache[url];
    }

    console.log('no cache, preparing cache');

    this.imageCache[`BUSY_${url}`] = true;
    setTimeout(() => {
      const image = new Image();
      image.src = url;
      image.onload = (event) => {
        this.imageCache[url] = event.target;
        this.imageCache[`BUSY_${url}`] = false;
        this.rafRender();
      }
      this.imageRenderer.appendChild(image);
    }, 0);
    return null;
  }
}

customElements.define("x-renderer", XCanvasRenderer);
