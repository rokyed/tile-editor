import { Scenario } from "./scenario.js";

const LOCAL_STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB approximation

function getLocalStorageUsage() {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    used += key.length + value.length;
  }
  return used;
}

function getLocalStorageRemaining() {
  return Math.max(0, LOCAL_STORAGE_LIMIT - getLocalStorageUsage());
}

export class SaveScenarioModal extends HTMLElement {
  open = false;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick.bind(this));
    this.render();
  }

  onClick(event) {
    const path = event.composedPath();
    if (path.includes(this.shadowRoot.querySelector('button[name="close"]'))) {
      this.closeDialog();
      return;
    }
    if (path.includes(this.shadowRoot.querySelector('button[name="save"]'))) {
      const input = this.shadowRoot.querySelector('input[name="scenario_name"]');
      const name = input.value.trim();
      if (!name) {
        alert('Name is required');
        return;
      }
      const data = JSON.stringify(Scenario.getInstance().serialize());
      localStorage.setItem(`scenario:${name}`, data);
      this.closeDialog();
      return;
    }
  }

  render() {
    const remainingKB = (getLocalStorageRemaining() / 1024).toFixed(1);
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
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        input {
          background: #222;
          color: #fff;
          border: 1px solid #999;
          padding: 4px;
        }
        button {
          background:#555;
          color:#FFF;
          cursor: pointer;
          border: 2px solid #999;
        }
        .controls {
          display:flex;
          justify-content:flex-end;
        }
      </style>
      <div class="content">
        <div class="controls"><button name="close">X</button></div>
        <label>Scenario Name</label>
        <input type="text" name="scenario_name"/>
        <button name="save">Save (${remainingKB} KB left)</button>
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

export class LoadScenarioModal extends HTMLElement {
  open = false;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick.bind(this));
    this.render();
  }

  onClick(event) {
    const path = event.composedPath();
    if (path.includes(this.shadowRoot.querySelector('button[name="close"]'))) {
      this.closeDialog();
      return;
    }
    const loadBtn = path.find(el => el.classList?.contains('load_scenario'));
    if (loadBtn) {
      const name = loadBtn.getAttribute('data-name');
      const data = localStorage.getItem(`scenario:${name}`);
      if (data) {
        Scenario.deserialize(JSON.parse(data));
      }
      this.closeDialog();
      return;
    }
    const deleteBtn = path.find(el => el.classList?.contains('delete_scenario'));
    if (deleteBtn) {
      const name = deleteBtn.getAttribute('data-name');
      if (name && confirm(`Delete scenario "${name}"?`)) {
        localStorage.removeItem(`scenario:${name}`);
        this.render();
      }
      return;
    }
  }

  render() {
    const names = Object.keys(localStorage)
      .filter(k => k.startsWith('scenario:'))
      .map(k => k.replace('scenario:', ''));

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
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 80%;
          overflow-y: auto;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        button {
          background:#555;
          color:#FFF;
          cursor: pointer;
          border: 2px solid #999;
          padding: 4px;
        }
        .controls { display:flex; justify-content:flex-end; }
        .scenario { display:flex; justify-content:space-between; align-items:center; gap:10px; }
        .scenario div { display:flex; gap:4px; }
      </style>
      <div class="content">
        <div class="controls"><button name="close">X</button></div>
        <h2>Load Scenario</h2>
        ${names.length === 0 ? '<p>No saved scenarios</p>' : ''}
        ${names.map(n => `<div class="scenario"><span>${n}</span><div><button class="load_scenario" data-name="${n}">Load</button><button class="delete_scenario" data-name="${n}">Delete</button></div></div>`).join('')}
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

customElements.define('save-scenario-modal', SaveScenarioModal);
customElements.define('load-scenario-modal', LoadScenarioModal);
