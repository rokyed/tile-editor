import { Scenario } from "./scenario.js";

export class LayerOptions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.addEventListener("click", this.onClick.bind(this));
    window.addEventListener("update.ui", () => this.update());
  }

  onClick(event) {
    const path = event.composedPath();
    if (path.includes(this.shadowRoot.querySelector("#add_layer"))) {
      Scenario.getInstance().addLayer();
      this.update();
    } else if (path.includes(this.shadowRoot.querySelector("#remove_layer"))) {
      Scenario.getInstance().removeLayer();
      this.update();
    }
  }

  update() {
    const countSpan = this.shadowRoot.querySelector("#layer_count");
    if (countSpan) {
      countSpan.textContent = Scenario.getInstance().layerCount;
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #333;
          padding: 4px;
          margin-top: 4px;
        }
        .row {
          display: flex;
          gap: 4px;
        }
      </style>
      <details>
        <summary>Layer Options</summary>
        <div class="row">
          <button id="add_layer">Add</button>
          <button id="remove_layer">Remove</button>
        </div>
        <div>Layer count: <span id="layer_count"></span></div>
      </details>
    `;
    this.update();
  }
}

customElements.define("layer-options", LayerOptions);
