import { Scenario } from "./scenario.js";
import { Tools } from "./tools.js";

export class XPalette extends HTMLElement {
  container = null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          overflow: hidden;
          flex: 1 1 1px;
          position: relative;
        }

        #tiles_container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          overflow-y: scroll;
        }

        .tile {
          width: 48px;
          height: 48px;
          outline: 1px solid #333;
          background-size: cover;
          cursor: pointer;
        }
      </style>
      <div id="tiles_container">
      </div>
      `
  }

  connectedCallback() {
    this.container= this.shadowRoot.getElementById("tiles_container");
    this.render();

    window.addEventListener("update.ui", () => {
      this.render();
    });

    this.addEventListener("click", (event) => {
      const tile = event.composedPath().find((element) => {
        return element.classList && element.classList.contains("tile");
      });
      let tileIndex = tile.getAttribute("data-tile-index");

      if (!tileIndex) {
        return;
      }

      const tileObject = Scenario.getInstance().getTileFromPalette(parseInt(tileIndex));

      Tools.getInstance().currentBrush = tileObject;
      console.log(tile);
      console.log(tile.style.backgroundColor);
      console.log(tile.style.backgroundImage);
    });
  }

  clearAll() {
    this.container.innerHTML = "";
  }

  renderTile(tile) {
    let tileElement = document.createElement("div");
    tileElement.classList.add("tile");
    tileElement.setAttribute("data-tile-index", tile.getIndex());
    tileElement.style.backgroundColor = tile.getColor();
    tileElement.style.backgroundImage = `url(${tile.getImage()})`;
    this.container.appendChild(tileElement);
  }
  render() {
    this.clearAll();
    const scenario = Scenario.getInstance();
    const tiles = scenario.getPalette();

    tiles.forEach(tile => {
      this.renderTile(tile);
    });
  }
}

customElements.define("x-palette", XPalette);
