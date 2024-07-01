import { Scenario } from './scenario.js';

class XRenderer extends HTMLElement {
  canvas = null; //DIV element containing tiles
  cellSize = 64; //size of each cell
  canvasSizeDot = null; //DIV element containing canvas size
  visibleCells = [];
  deferRender = false;
  renderStats = false;
  baseCSS = `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      background-color: #000;
      position: relative;
      overflow: scroll;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    #canvas-size {
      width: 1px;
      height: 1px;
      position:absolute;
      color: #fff;
      background-color: #fff;
    }

    [data-type="tile"] {
      position: absolute;
      outline: 1px solid #333;
      box-sizing: border-box;
      background: #000;
      text-overflow: ellipsis;
      overflow: hidden;
      padding: 5px;
      cursor: pointer;
      background-size: cover;
    }

  `;



  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style name="styles">
        ${this.baseCSS}
      </style>
      <div id="canvas-container" style="width: 100%; height: 100%;">
        <div id="canvas-size">
        </div>
      </div>
    `;

    this.canvas = this.shadowRoot.getElementById("canvas-container");
    this.canvasSizeDot = this.shadowRoot.getElementById("canvas-size");
  }

  writeTileTexturesAsCSS() {
    let css = "";

    Scenario.getInstance().getPalette().forEach((tile, index) => {
      css += `
        .tile-${index} {
          background-color: #FF00FF;
          background-image: url("${tile.getImage()}");
        }
        `;
    });

    this.shadowRoot.querySelector("style[name='styles']").innerHTML = `
      ${this.baseCSS}

      ${css}

      `;
  }


  connectedCallback() {
    this.render();

    this.addEventListener("scroll", () => {
      this.render();
    });

    window.addEventListener("update.ui", (event) => {
      let force = event?.detail?.force ?? false;
      this.#deferRender();
    });

    this.addEventListener("click", (event) => {
      const tile = event.composedPath().find((element) => {
        return element.getAttribute("data-type") === "tile";
      });

      if (!tile) {
        return;
      }

      console.log("Tile clicked", tile.getAttribute("data-cell-id"))

      let cellId = tile.getAttribute("data-cell-id");
      let cellX = tile.getAttribute("data-cell-x");
      let cellY = tile.getAttribute("data-cell-y");
      let cell = Scenario.getInstance().executeTool(parseInt(cellX), parseInt(cellY));
    });
  }

  setWidthAndHeight(width, height) {
    //set scrollable area
    this.canvasSizeDot.style.top = `${height * this.cellSize}px`;
    this.canvasSizeDot.style.left = `${width * this.cellSize}px`;
  }

  clearNotVisibleCells() {
    this.canvas.querySelectorAll("div[data-type='tile']").forEach(tile => {
      if (!this.visibleCells.includes(tile.getAttribute("data-cell-id"))) {
        tile.remove();
      }
    });
  }

  lazyRender() {
    this.#deferRender();
  }

  #deferRender(skipTimeout) {
    if (skipTimeout) {
      requestAnimationFrame(() => {
        this.render(true);
      });
      return;
    }
    setTimeout(() => {
      requestAnimationFrame(() => {
        this.render(true);
      });
    }, 100);
  }

  zoomIn() {
    this.cellSize = this.cellSize * 2;

    if (this.cellSize > 256) {
      this.cellSize = 256;
    }

    this.#deferRender();
  }

  zoomOut() {
    this.cellSize = this.cellSize / 2;

    if (this.cellSize < 16) {
      this.cellSize = 16;
    }

    this.#deferRender();
  }

  zoomReset() {
    this.cellSize = 64;
    this.#deferRender();
  }

  toggleStats() {
    this.renderStats = !this.renderStats;
    this.#deferRender(true);
  }

  cellToTile(cell, tile) {
    tile.style.left = `${cell.x * this.cellSize}px`;
    tile.style.top = `${cell.y * this.cellSize}px`;
    tile.style.width = `${this.cellSize}px`;
    tile.style.height = `${this.cellSize}px`;

    if (this.renderStats) {
      tile.innerText = cell.getStats();
    }
    let t = cell.getTile();

    if (t) {
      tile.className = `tile-${t.getIndex()}`;

      if (this.renderStats) {
        tile.style.outline = `2px solid ${t.getColor()}`;
      }
    }
  }

  render(force) {
    const scenario = Scenario.getInstance();

    this.writeTileTexturesAsCSS();
    this.setWidthAndHeight(scenario.getMapWidth(), scenario.getMapHeight());

    let box = this.getBoundingClientRect();
    let top = this.scrollTop;
    let left = this.scrollLeft;
    let hCenter = Math.floor(box.width / 2 + left) / this.cellSize;
    let vCenter = Math.floor(box.height / 2 + top) / this.cellSize;
    let maxSpread = Math.floor(Math.max(box.width, box.height) / this.cellSize);

    const cells = scenario.getCellsZone(hCenter, vCenter, maxSpread);

    this.clearNotVisibleCells();
    let oldVisibleCells = [...this.visibleCells];
    this.visibleCells = [];

    cells.forEach(cell => {
      const cellId = `cell-${cell.x}-${cell.y}`;
      let tile = null;
      if (oldVisibleCells.includes(cellId) && !force) {
        tile = this.canvas.querySelector(`div[data-cell-id="${cellId}"]`);
      } else {
        tile = document.createElement("div");
        tile.setAttribute("data-type", "tile");
        tile.setAttribute("data-cell-id", cellId);
        tile.setAttribute("data-cell-x", cell.x);
        tile.setAttribute("data-cell-y", cell.y);
        this.visibleCells.push(cellId);
        this.canvas.appendChild(tile);
      }

      this.cellToTile(cell, tile);
    });
    console.timeEnd('render');
  }
}

customElements.define("x-renderer", XRenderer);
