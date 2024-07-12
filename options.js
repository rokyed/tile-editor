export class Options {
  static deserialize(data, scenario) {
    const options = new Options(scenario);
    for (let k in data) {
      options.setOption(k, data[k].value, data[k].color);
    }
    return options;
  }


  options = {};
  scenario = null;

  constructor(scenario) {
    this.scenario = scenario;
  }

  setOption(key, value, color) {
    this.options[key] = { color, value };

    this.scenario.fireUpdate();
  }

  removeOption(key) {
    delete this.options[key];

    for (let cell of this.scenario.mapCells) {
      cell.setCellOptions({ [key]: null });
    }

    this.scenario.fireUpdate();
  }

  getOption(key) {
    if (!this.options[key]) {
      return { color: "#f0f" }
    }
    return this.options[key];
  }

  map(callback) {
    return Object.keys(this.options).map(callback);
  }

  serialize() {
    return this.options;
  }
}
