
export class TileElement extends HTMLElement {
  static get observedAttributes() {
    return ['image']
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
        }
      </style>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'image') {
      this.shadowRoot.host.style.backgroundImage = `url(${newValue})`;
    }
  }
}


customElements.define('x-tile-element', TileElement);
