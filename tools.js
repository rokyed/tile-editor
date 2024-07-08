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
    const currentTile = cell.getTile();
    let cells = new Set();
    cell.getAdjacentCellsWhere(cells, (adjacent, arr) => {
      return adjacent.getTile() === currentTile;
    });


    cells.forEach((cell) => {
      cell.setTile(Tools.getInstance().currentBrush, layer);
    });
  }
}

window.TOOLS = Tools.getInstance();
