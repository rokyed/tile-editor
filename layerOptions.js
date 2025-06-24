import { Scenario } from "./scenario.js";

export class LayerOptions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.addEventListener("click", this.onClick.bind(this));
    this.shadowRoot.addEventListener("change", this.onChange.bind(this));
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

  onChange(event) {
    const checkbox = event.target.closest('input[data-layer]');
    if (checkbox) {
      const layer = parseInt(checkbox.getAttribute('data-layer'));
      Scenario.getInstance().setLayerVisibility(layer, checkbox.checked);
    }
  }

  update() {
    const scenario = Scenario.getInstance();
    const countSpan = this.shadowRoot.querySelector("#layer_count");
    if (countSpan) {
      countSpan.textContent = scenario.layerCount;
    }
    const layerView = this.shadowRoot.querySelector('[name="current_layer"]');
    if (layerView) {
      layerView.textContent = `Current layer: ${scenario.currentLayer}`;
    }
    const list = this.shadowRoot.querySelector('#layer_visibility');
    if (list) {
      list.innerHTML = '';
      for (let i = 0; i < scenario.layerCount; i++) {
        const checked = scenario.isLayerVisible(i) ? 'checked' : '';
        list.innerHTML += `<label><input type="checkbox" data-layer="${i}" ${checked}/> ${i}</label>`;
      }
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 4px;
          margin-top: 4px;
          background: #444;
        }
        .row {
          display: flex;
          gap: 4px;
          margin-bottom: 4px;
        }
        .row > * {
          flex: 1 1 1px;
          white-space: nowrap;
        }
        button {
          background: #555;
          color: #FFF;
          cursor: pointer;
          border: 2px solid #999;
        }
        button:hover {
          background: #777;
        }
      </style>
      <details>
        <summary>Layer Options</summary>
        <div class="row">
          <button id="add_layer">Add</button>
          <button id="remove_layer">Remove</button>
        </div>
        <div>Layer count: <span id="layer_count"></span></div>
        <div class="row">
          <button id="layer_down">-</button>
          <span name="current_layer">Current layer</span>
          <button id="layer_up">+</button>
          <button id="toggle_only_layer">Only</button>
        </div>
        <div id="layer_visibility" class="row"></div>
      </details>
    `;
    this.update();
  }
}

customElements.define("layer-options", LayerOptions);
