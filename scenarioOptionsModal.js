import { Scenario } from "./scenario.js";

export class ScenarioOptionsModal extends HTMLElement {
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
    let composed = event.composedPath();
    if (composed.includes(this.shadowRoot.querySelector('button[name="close"]'))) {
      this.closeDialog();
      return;
    }

    if (composed.includes(this.shadowRoot.querySelector('button[name="add_option"]'))) {
      let key = this.shadowRoot.querySelector('input[name="option_key"]').value;
      let value = this.shadowRoot.querySelector('input[name="option_value"]').value;
      let color = this.shadowRoot.querySelector('input[name="option_color"]').value;

      if (!key) {
        alert('Key is required');
        return;
      }

      Scenario.getInstance().getOptions().setOption(key, value, color);

      this.shadowRoot.querySelector('input[name="option_key"]').value = '';
      this.shadowRoot.querySelector('input[name="option_value"]').value = '';
      this.shadowRoot.querySelector('input[name="option_color"]').value = '';
      this.lazyRender();
      return;
    }

    let removeOption = composed.find((el) => el.classList?.contains('remove_option'));

    if (removeOption) {
      let key = removeOption.getAttribute('data-key');
      if (key) {
        Scenario.getInstance().getOptions().removeOption(key);
        this.lazyRender();
      }
      return;
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

        .controls {
          display: flex;
          justify-content: flex-end;
        }

        input {
          background: #222;
          color: #fff;
          width: auto;
          flex: 1 1 1px;

          min-width: 100px;
        }

        button {
          background:#555;
          color:#FFF;
          cursor: pointer;
          border: 2px solid #999;
        }

        .content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #333;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          max-width: 500px;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .option {
          display: flex;
          gap: 10px;
          align-items: center;
          margin: 5px 0;
          border: 1px solid #999;
        }

        .option * {
          flex: 1 1 1px;
        }

        .option_form {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .option_form * {
          flex: 1 1 1px;
        }
      </style>

      <div class="content">
        <div class="controls">
          <button name="close">X</button>
        </div>
        <div class="title">
          <h2>Scenario Options</h2>
          <p>Options for the scenario cells</p>
        </div>
        <div class="options">
        </div>
        <p>Add Option</p>
        <div class="option_form">
          <input type="text" name="option_key" placeholder="Option Key">
          <input type="text" name="option_value" placeholder="Option Value">
          <input type="color" name="option_color">
          <button name="add_option">Add Option</button>
        </div>
      </div>

    `;
    this.renderOptions();
  }

  renderOptions() {
    let options = Scenario.getInstance().getOptions();

    let optionsDiv = this.shadowRoot.querySelector('.options');

    optionsDiv.innerHTML = '';

    options.map((key) => {
      let option = document.createElement('div');
      option.classList.add('option');
      option.innerHTML = `
        <span>Key: ${key}</span>
        <span>Value: ${options.options[key].value}</span>
        <span style="background-color: ${options.options[key].color}; width: 20px; height: 20px;"></span>
        <button data-key="${key}" class="remove_option">Remove</button>
      `;
      optionsDiv.appendChild(option);
    });
  }

  lazyRender() {
    setTimeout(() => this.render(), 0);
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

customElements.define('scenario-options-modal', ScenarioOptionsModal);
