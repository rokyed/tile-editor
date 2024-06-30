import {Scenario} from './scenario.js';

class XRenderer extends HTMLElement {
  canvas = null; //DIV element containing tiles
  cellSize = 64; //size of each cell
  canvasSizeDot = null; //DIV element containing canvas size
  visibleCells = [];
  deferRender = false;



  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = `
      <style>
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
        }

      </style>
      <div id="canvas-container" style="width: 100%; height: 100%;">
        <div id="canvas-size">
        </div>
      </div>
    `;

    this.canvas = this.shadowRoot.getElementById("canvas-container");
    this.canvasSizeDot = this.shadowRoot.getElementById("canvas-size");
  }

  connectedCallback() {
    this.render();

    this.addEventListener("scroll", () => {
      console.log("scrolling");
      this.render();
    });
  }

  setWidthAndHeight(width, height) {
    console.log("setting width and height", width, height);
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

  render() {
    const scenario = Scenario.getInstance();

    this.setWidthAndHeight(scenario.getMapWidth(), scenario.getMapHeight());

    let box = this.getBoundingClientRect();
    let top = this.scrollTop;
    let left = this.scrollLeft;
    let hCenter = Math.floor(box.width / 2 + left)/this.cellSize;
    let vCenter = Math.floor(box.height / 2 + top)/this.cellSize;
    let maxSpread = Math.floor(Math.max(box.width, box.height) / this.cellSize);

    const cells = scenario.getCellsZone(hCenter, vCenter, maxSpread);

    this.clearNotVisibleCells();
    let oldVisibleCells = [...this.visibleCells];
    this.visibleCells = [];

    cells.forEach(cell => {
      const cellId = `cell-${cell.x}-${cell.y}`;

      if (oldVisibleCells.includes(cellId)) {
        return;
      }

      const tile = document.createElement("div");
      tile.setAttribute("data-type", "tile");
      tile.setAttribute("data-cell-id", cellId);
      this.visibleCells.push(cellId);
      tile.style.width = `${this.cellSize}px`;
      tile.style.height = `${this.cellSize}px`;
      tile.style.position = "absolute";
      tile.style.left = `${cell.x * this.cellSize}px`;
      tile.style.top = `${cell.y * this.cellSize}px`;
      tile.innerHTML = `${cell.x},${cell.y}`;
      this.canvas.appendChild(tile);
    });

  }

  triggerDeferRender() {
    if (this.deferRender) {
      clearTimeout(this.deferRender);
    }

    this.deferRender = setTimeout(() => {
      this.render();
    }, 100);
  }
}

customElements.define("x-renderer", XRenderer);
