class Core {
  #mapSize = [0,0];
  #map = [];
  #layers = [];

  constructor() {
    this.newMap(64,64);
  }

  newLayer(name, options = {}) {
    this.#layers = this.#layers?.length >= 0 ? this.#layers : [];

  }

  newMap(width, height) {
    this.#mapSize = [width, height];
    this.#map = [];
  }


}
