
const THEME = {
  border: 'rgba(0,255,0,0.25)',
  text: '#3d3',
  font: '22px monospace',
  detail: '#3f3',
  detailFont: '12px monospace',
  deadZone: 'rgba(30,0,0,0.5)',
  background: 'rgba(0,0,0,0.5)',
  highlight: 'rgba(255,255,255,0.2)',
}
const SIZES = {
  radius: 140,
  deadZone: 60,
  diameter: 280,
  lineWidth: 2,
}



export class ContextWheel extends HTMLElement {

  static FULL_CIRCLE = Math.PI * 2;
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

  radToDeg(rad) {
    const deg = rad * (180 / Math.PI);

    if (deg < 0) {
      return deg + 360;
    }
    if (deg > 360) {
      return deg - 360;
    }

    return deg;
  }

  degToRad(deg) {
    const rad = deg * (Math.PI / 180);

    if (rad < 0) {
      return rad + Math.PI * 2;
    }

    if (rad > Math.PI * 2) {
      return rad - Math.PI * 2;
    }

    return rad;
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

    let sliceFraction = degrees/(360 / this.options.length);
    let slice = Math.floor(sliceFraction);
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
    let center = (SIZES.diameter / 2) + 1;

    ctx.clearRect(0, 0, SIZES.diameter+ SIZES.lineWidth, SIZES.diameter+ SIZES.lineWidth);
    ctx.fillStyle = THEME.background;
    ctx.strokeStyle =THEME.border;
    ctx.lineWidth = SIZES.lineWidth;

    ctx.beginPath();
    ctx.arc(center, center, SIZES.deadZone, 0, ContextWheel.FULL_CIRCLE);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, SIZES.radius, 0, ContextWheel.FULL_CIRCLE);
    ctx.stroke();

    ctx.lineWidth = SIZES.lineWidth;
    ctx.beginPath();
    for (let i = 0; i < this.options.length; i++) {
      const angle = (i / this.options.length) * ContextWheel.FULL_CIRCLE;
      const slice = (1 / this.options.length) * ContextWheel.FULL_CIRCLE;
      const degAngle = this.radToDeg(angle);
      const degSlice = this.radToDeg(slice);
      const x = center + Math.cos(angle) * SIZES.radius;
      const y = center + Math.sin(angle) * SIZES.radius;
      const offsetX = center + Math.cos(angle)* SIZES.deadZone;
      const offsetY = center + Math.sin(angle) * SIZES.deadZone;

      ctx.moveTo(offsetX, offsetY);
      ctx.lineTo(x, y);
      if (this.options[i].color) {
        const radAnglePlus2 = this.degToRad(degAngle + 0.5);
        const radAngleMinus2 = this.degToRad(degAngle+ degSlice - 0.5);

        let optXA = center + Math.cos(radAnglePlus2) * (SIZES.radius - SIZES.lineWidth);
        let optYA = center + Math.sin(radAnglePlus2) * (SIZES.radius - SIZES.lineWidth);
        let optXB = center + Math.cos(radAngleMinus2) * (SIZES.radius - SIZES.lineWidth);
        let optYB = center + Math.sin(radAngleMinus2) * (SIZES.radius - SIZES.lineWidth);
        let optXC = center + Math.cos(radAnglePlus2) * (SIZES.deadZone + SIZES.lineWidth);
        let optYC = center + Math.sin(radAnglePlus2) * (SIZES.deadZone + SIZES.lineWidth);

        ctx.strokeStyle = this.options[i].color;
        ctx.beginPath();
        ctx.moveTo(optXC , optYC);
        ctx.lineTo(optXA, optYA);
        ctx.arc(center, center, SIZES.radius - SIZES.lineWidth, radAnglePlus2,radAngleMinus2);
        ctx.lineTo(optXB, optYB);
        ctx.arc(center, center, SIZES.deadZone+ SIZES.lineWidth, radAngleMinus2, radAnglePlus2, true);
        ctx.stroke();
        ctx.strokeStyle =THEME.border;
      }


    }

    ctx.stroke();
    let highlightingSlice = null;

    if (pointerX && pointerY) {
      if (!this.isPointInCenter({ offsetX: pointerX, offsetY: pointerY })) {
        let slice = this.calculatePieSlice({ offsetX: pointerX, offsetY: pointerY });
        highlightingSlice = slice;
        let angle = (slice / this.options.length) * Math.PI * 2;
        let sliceAngle = (1 / this.options.length) * Math.PI * 2;
        let x = center + Math.cos(angle) * SIZES.radius;
        let y = center + Math.sin(angle) * SIZES.radius;
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
    ctx.font = THEME.font;
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

    if (highlightingSlice !== null) {
      ctx.fillStyle = THEME.detail;
      ctx.font = THEME.detailFont;
      ctx.fillText(this.options[highlightingSlice].detail, center, center);
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
          width: ${SIZES.diameter+2}px;
          height: ${SIZES.diameter+2}px;
          cursor:pointer;
          overflow: hidden;
          box-shadow: 0 0 100px rgba(0, 0, 0, 1);
        }
        .option {
          padding: 5px;
          cursor: pointer;
        }
        </style>

        <canvas width="${SIZES.diameter+2}" height="${SIZES.diameter+2}"></canvas>
        `;
  }
}


customElements.define('context-wheel', ContextWheel);
