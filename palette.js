export class XPalette extends HTMLCanvasElement {
  constructor() {
    this.shadowRoot = this.attachShadow({mode: "open"});

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
      </style>
      <canvas></canvas>
      `
  }
}

customElements.define("x-palette", XPalette);
