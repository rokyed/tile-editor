
export class ContextWheel extends HTMLElement {
  static instance = null;

  static Show(x,y, options) {
    if (ContextWheel.instance) {
      ContextWheel.instance.remove();
    }

    let wheel = document.createElement('context-wheel');

    wheel.x = x;
    wheel.y = y;
    wheel.options = options;
    document.body.appendChild(wheel);
    ContextWheel.instance = wheel;
  }

  x = 0;
  y = 0;
  options = [];
  ctx = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.render();
    this.renderCanvas();
  }

  setOptions(options) {
    this.options = options;
    this.renderCanvas();
  }

  connectedCallback() {
    this.render();
    window.addEventListener('click', this.onBackdropClick.bind(this));
    this.addEventListener('click', this.onClick.bind(this));
    this.addEventListener('mousemove', this.onMouseMove.bind(this));

    this.ctx = this.shadowRoot.querySelector('canvas').getContext('2d');
    this.renderCanvas();
  }

  onBackdropClick(event) {
    if (event.composedPath().includes(this)) {
      return;
    }

    this.remove();
  }

  onMouseMove(event) {
    this.renderCanvas(event.offsetX, event.offsetY);
  }

  calculatePieSlice(event) {
    let x = event.offsetX;
    let y = event.offsetY;
    let width = this.shadowRoot.querySelector('canvas').width;
    let height = this.shadowRoot.querySelector('canvas').height;
    let centerX = width / 2;
    let centerY = height / 2;

    let angle = Math.atan2(y - centerY, x - centerX);
    let degrees = angle * (180 / Math.PI);

    if (degrees < 0) {
      degrees += 360;
    }

    let slice = Math.floor(degrees / (360 / this.options.length));

    return slice;
  }

  isPointInCenter(event) {
    let x = event.offsetX;
    let y = event.offsetY;
    let width = this.shadowRoot.querySelector('canvas').width;
    let height = this.shadowRoot.querySelector('canvas').height;
    let centerX = width / 2;
    let centerY = height / 2;
    let radius = 50;

    let distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

    return distance < radius;
  }

  onClick(event) {
    let canvasTarget = event.composedPath().find((el) => el.tagName === 'CANVAS');


    if (canvasTarget) {
      let isCenter = this.isPointInCenter(event);

      if (isCenter) {
        this.onCenterClick(event);
        return;
      }

      let slice = this.calculatePieSlice(event);

      if (this.options[slice]) {
        console.log('clicked', this.options[slice]);
        this.options[slice]?.action?.();
        this.remove();
      }
    }
  }

  onCenterClick(event) {
    this.remove();
  }

  renderCanvas(pointerX, pointerY) {
    let ctx = this.ctx;

    ctx.clearRect(0, 0, 300, 300);
    ctx.fillStyle = 'rgba(0,0, 0, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(150, 150, 50, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, 2 * Math.PI);
    ctx.stroke();


    ctx.beginPath();
    for (let i = 0; i < this.options.length; i++) {

      let angle = (i / this.options.length) * Math.PI * 2;
      let slice = (1 / this.options.length) * Math.PI * 2;

      let x = 150 + Math.cos(angle) * 150;
      let y = 150 + Math.sin(angle) * 150;
      let beginX = 150 + Math.cos(angle)* 50;
      let beginY = 150 + Math.sin(angle) * 50;

      ctx.moveTo(beginX, beginY);
      ctx.lineTo(x, y);
    }

    ctx.stroke();

    //draw highlight
    if (pointerX && pointerY && !this.isPointInCenter({ offsetX: pointerX, offsetY: pointerY })) {
      let slice = this.calculatePieSlice({ offsetX: pointerX, offsetY: pointerY });
      let angle = (slice / this.options.length) * Math.PI * 2;
      let sliceAngle = (1 / this.options.length) * Math.PI * 2;
      let x = 150 + Math.cos(angle) * 150;
      let y = 150 + Math.sin(angle) * 150;
      let x2 = 150 + Math.cos(angle + sliceAngle) * 150;
      let y2 = 150 + Math.sin(angle + sliceAngle) * 150;
      let offsetX = 150 + Math.cos(angle) * 50;
      let offsetY = 150 + Math.sin(angle) * 50;
      let offsetX2 = 150 + Math.cos(angle + sliceAngle) * 50;
      let offsetY2 = 150 + Math.sin(angle + sliceAngle) * 50;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      ctx.lineTo(x, y);
      ctx.arc(150, 150, 150, angle, angle + sliceAngle);
      ctx.lineTo(offsetX2, offsetY2);
      ctx.arc(150, 150, 50, angle + sliceAngle, angle, true);
      ctx.fill();
    }

    ctx.fillStyle = '#FFF';
    ctx.fontWeight = 'bold';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.options.length; i++) {
      let angle = (i / this.options.length) * Math.PI * 2;
      let slice = (1/ this.options.length) * Math.PI * 2;
      let x = 150 + Math.cos(angle + (slice * 0.5)) * 100;
      let y = 150 + Math.sin(angle + (slice * 0.5)) * 100;
      ctx.fillText(this.options[i].name, x, y);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: absolute;
          top: ${this.y}px;
          left: ${this.x}px;
          background-color: rgba(0, 0, 0, 0.8);
          z-index: 999;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          width: 300px;
          height: 300px;
          cursor:pointer;
        }
        .option {
          padding: 5px;
          cursor: pointer;
        }
        </style>

        <canvas width="300" height="300"></canvas>
        `;
  }
}


customElements.define('context-wheel', ContextWheel);
