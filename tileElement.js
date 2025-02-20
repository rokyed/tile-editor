import { defaultImage } from "./staticData.js";

export class TileElement extends HTMLElement {
  static get observedAttributes() {
    return ['image', 'border', 'data-no-tile']
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 64px;
          height: 64px;
          background-size: cover;
          cursor: pointer;
          border: 1px solid #333;
          image-rendering: pixelated;
          background-image: url(${defaultImage});
        }
      </style>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'image') {
      if (newValue)
        this.shadowRoot.host.style.backgroundImage = `url(${newValue})`;
    }

    if (name === 'border') {
      this.shadowRoot.host.style.borderColor = newValue;
    }

    if (name === 'data-no-tile' && newValue) {
      delete this.shadowRoot.host.style.backgroundImage;
      this.shadowRoot.host.removeAttribute('style');
    }
  }
}


customElements.define('x-tile-element', TileElement);
