import { Scenario } from "./scenario.js";

export class Tools {
  static instance = null;

  static getInstance() {
    if (!Tools.instance) {
      Tools.instance = new Tools();
    }
    return Tools.instance;
  }

  currentBrush = null;
  noopTool() { };

  eraseTool() {
    cell.setTile(null, layer);
  }

  paintTool(cell, layer) {
    cell.setTile(Tools.getInstance().currentBrush, layer);
  }

  fillTool(cell, layer) {
    const currentTile = cell.getTile(layer);
    let cells = new Set();
    cell.getAdjacentCellsWhere(cells, (adjacent, arr) => {
      return adjacent.getTile(layer) === currentTile;
    });


    cells.forEach((cell) => {
      cell.setTile(Tools.getInstance().currentBrush, layer);
    });
  }

  clearPropertiesTool(cell, layer) {
    cell.clearCellOptions();
  }

  setColliderTool(cell, layer) {
    cell.setCellOptions({ collision: true });
  }

  removeColliderTool(cell, layer) {
    cell.setCellOptions({ collision: false });
  }
}

window.TOOLS = Tools.getInstance();
