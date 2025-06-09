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
    const brush = Tools.getInstance().currentBrush;
    cell.setTile(brush, layer);
    if (brush) {
      const options = brush.getTileOptions();
      if (Object.keys(options).length === 0) {
        cell.clearCellOptions();
      } else {
        cell.setCellOptions(options);
      }
    }
  }

  fillTool(cell, layer) {
    const brush = Tools.getInstance().currentBrush;
    const currentTile = cell.getTile(layer);
    let cells = new Set();
    cell.getAdjacentCellsWhere(cells, (adjacent, arr) => {
      return adjacent.getTile(layer) === currentTile;
    });


    cells.forEach((cell) => {
      cell.setTile(brush, layer);
      if (brush) {
        const options = brush.getTileOptions();
        if (Object.keys(options).length === 0) {
          cell.clearCellOptions();
        } else {
          cell.setCellOptions(options);
        }
      }
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
