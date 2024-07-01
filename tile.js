
export class Tile {
  index= -1;
  width = 64;
  height = 64;
  image = null;
  color = "#FF00FF";
  properties = {
    layer: 0,
  };

  constructor(index,w, h, image, color = "#FF00FF", tileOptions = {}) {
    this.index = index;
    this.width = w;
    this.height = h;
    this.image = image;
    this.color = color;
    this.properties = { ...this.properties, ...tileOptions };
  }

  setTileOptions(options) {
    this.properties = { ...this.properties, ...options };
  }

  getTileOptions() {
    return this.properties;
  }

  getColor() {
    return this.color;
  }

  getImage() {
    return this.image;
  }

  getIndex() {
    return this.index;
  }
}
