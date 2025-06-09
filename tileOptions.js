import { Scenario } from "./scenario.js";

export class TileOptions extends HTMLElement {
  tile = null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.addEventListener('change', this.onChange.bind(this));
    window.addEventListener('brush.change', (e) => {
      this.tile = e.detail;
      this.render();
    });
    window.addEventListener('update.ui', () => this.render());
    this.render();
  }

  onChange(event) {
    if (!this.tile) return;
    const input = event.target;
    if (input.name === 'tile_option') {
      const key = input.getAttribute('data-key');
      const opts = { ...this.tile.getTileOptions() };
      if (input.checked) {
        opts[key] = true;
      } else {
        delete opts[key];
      }
      this.tile.setTileOptions(opts);
      Scenario.getInstance().fireUpdate();
    }
  }

  renderOptions(options) {
    if (!this.tile) return '<div>No tile selected</div>';
    const props = this.tile.getTileOptions();
    return options.map((key) => {
      const checked = props[key] ? 'checked' : '';
      return `<label class="option"><input type="checkbox" name="tile_option" data-key="${key}" ${checked}/> ${key}</label>`;
    }).join('');
  }

  render() {
    const scenarioOptions = Scenario.getInstance().getOptions();
    const previous = this.shadowRoot.querySelector('details');
    const wasOpen = previous ? previous.open : true;
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
        .option {
          display: flex;
          gap: 4px;
          align-items: center;
          margin-bottom: 4px;
        }
      </style>
        <details ${wasOpen ? 'open' : ''}>
          <summary>Tile Options</summary>
          ${this.renderOptions(scenarioOptions)}
        </details>
      `;
  }
}

customElements.define('tile-options', TileOptions);
