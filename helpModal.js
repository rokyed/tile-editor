export class HelpModal extends HTMLElement {
  open = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick.bind(this));
    this.render();
  }

  onClick(e) {
    const path = e.composedPath();
    if (path.includes(this.shadowRoot.querySelector('button[name="close"]'))) {
      this.closeDialog();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${this.open ? 'block' : 'none'};
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 200, 200, 0.125);
          z-index: 100;
        }
        .content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #333;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        button {
          background:#555;
          color:#FFF;
          cursor:pointer;
          border:2px solid #999;
        }
        ul { margin: 0; padding-left: 20px; }
      </style>
      <div class="content">
        <div class="controls"><button name="close">X</button></div>
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li><b>?</b> - Show this help</li>
          <li><b>P</b> - Paint tool</li>
          <li><b>F</b> - Fill tool</li>
          <li><b>+</b>/<b>=</b> - Zoom in</li>
          <li><b>-</b> - Zoom out</li>
          <li><b>0</b> - Reset zoom</li>
          <li><b>Ctrl+S</b> - Save scenario</li>
          <li><b>Ctrl+L</b> - Load scenario</li>
        </ul>
      </div>
    `;
  }

  openDialog() {
    this.open = true;
    this.render();
  }

  closeDialog() {
    this.open = false;
    this.render();
  }
}

customElements.define('help-modal', HelpModal);
