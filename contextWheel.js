
const THEME = {
  border: '#3f3',
  text: '#3d3',
  deadZone: 'rgba(30,0,0,0.5)',
  background: 'rgba(0,0,0,0.5)',
  highlight: 'rgba(255,255,255,0.5)',
}
const SIZES = {
  radius: 125,
  deadZone: 50,
  diameter: 250,
}

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
    let radius = SIZES.deadZone;

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
    let center = SIZES.diameter / 2;

    ctx.clearRect(0, 0, SIZES.diameter, SIZES.diameter);
    ctx.fillStyle = THEME.background;
    ctx.strokeStyle =THEME.border;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(center, center, SIZES.deadZone, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, SIZES.radius, 0, 2 * Math.PI);
    ctx.stroke();


    ctx.beginPath();
    for (let i = 0; i < this.options.length; i++) {

      let angle = (i / this.options.length) * Math.PI * 2;
      let slice = (1 / this.options.length) * Math.PI * 2;

      let x = center + Math.cos(angle) * SIZES.radius;
      let y = center + Math.sin(angle) * SIZES.radius;
      let beginX = center + Math.cos(angle)* SIZES.deadZone;
      let beginY = center + Math.sin(angle) * SIZES.deadZone;

      ctx.moveTo(beginX, beginY);
      ctx.lineTo(x, y);
    }

    ctx.stroke();

    //draw highlight
    if (pointerX && pointerY) {
      if (!this.isPointInCenter({ offsetX: pointerX, offsetY: pointerY })) {
        let slice = this.calculatePieSlice({ offsetX: pointerX, offsetY: pointerY });
        let angle = (slice / this.options.length) * Math.PI * 2;
        let sliceAngle = (1 / this.options.length) * Math.PI * 2;
        let x = center + Math.cos(angle) * SIZES.radius;
        let y = center + Math.sin(angle) * SIZES.radius;
        let x2 = center + Math.cos(angle + sliceAngle) * SIZES.radius;
        let y2 = center + Math.sin(angle + sliceAngle) * SIZES.radius;
        let offsetX = center + Math.cos(angle) * SIZES.deadZone;
        let offsetY = center + Math.sin(angle) * SIZES.deadZone;
        let offsetX2 = center + Math.cos(angle + sliceAngle) * SIZES.deadZone;
        let offsetY2 = center + Math.sin(angle + sliceAngle) * SIZES.deadZone;

        ctx.fillStyle = THEME.highlight;
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.lineTo(x, y);
        ctx.arc(center, center, SIZES.radius, angle, angle + sliceAngle);
        ctx.lineTo(offsetX2, offsetY2);
        ctx.arc(center, center, SIZES.deadZone, angle + sliceAngle, angle, true);
        ctx.fill();
      } else {
        ctx.fillStyle = THEME.highlight;
        ctx.beginPath();
        ctx.arc(center, center, SIZES.deadZone, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    ctx.fillStyle = THEME.text;
    ctx.fontWeight = 'bold';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let textMidPoint = SIZES.deadZone + ((SIZES.radius - SIZES.deadZone) / 2);

    for (let i = 0; i < this.options.length; i++) {
      let angle = (i / this.options.length) * Math.PI * 2;
      let slice = (1/ this.options.length) * Math.PI * 2;
      let x = center + Math.cos(angle + (slice * 0.5)) * textMidPoint;
      let y = center + Math.sin(angle + (slice * 0.5)) * textMidPoint;
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
          width: ${SIZES.diameter}px;
          height: ${SIZES.diameter}px;
          cursor:pointer;
        }
        .option {
          padding: 5px;
          cursor: pointer;
        }
        </style>

        <canvas width="${SIZES.diameter}" height="${SIZES.diameter}"></canvas>
        `;
  }
}


customElements.define('context-wheel', ContextWheel);
