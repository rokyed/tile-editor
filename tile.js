
export class Tile {

  static deserialize(data) {
    const tile = new Tile(data.index, data.width, data.height, data.image, data.color, data.options);
    return tile;
  }


  index= -1;
  width = 64;
  height = 64;
  image = null; // string URL for rendering
  blob = null;
  color = "#FF00FF";
  properties = {
    layer: 0,
  };

  constructor(index, w, h, image, color = "#FF00FF", tileOptions = {}) {
    this.index = index;
    this.width = w;
    this.height = h;

    if (image instanceof Blob) {
      this.blob = image;
      this.image = URL.createObjectURL(image);
    } else {
      this.image = image;
    }

    this.color = color;
    this.properties = { ...this.properties, ...tileOptions };
  }

  setTileOptions(options) {
    this.properties = { ...options };
  }

  getTileOptions() {
    return this.properties;
  }

  getColor() {
    return this.color;
  }

  getImage() {
    if (!this.image && this.blob) {
      this.image = URL.createObjectURL(this.blob);
    }
    return this.image;
  }

  getBlob() {
    return this.blob;
  }

  getIndex() {
    return this.index;
  }

  serialize() {
    return {
      index: this.index,
      width: this.width,
      height: this.height,
      image: this.image,
      color: this.color,
      properties: this.properties,
    };
  }
}
