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

  paintTool(cell) {
    cell.setTile(Tools.getInstance().currentBrush);
  }

  eraseTool(cell){
    let blankTile = Scenario.getInstance().getPalette()[0];

    cell.setTile(blankTile);
  }

  fillTool(cell) {
    const currentTile = cell.getTile();
    let cells = new Set();
    cell.getAdjacentCellsWhere(cells, (adjacent, arr) => {
      return adjacent.getTile() === currentTile;
    });


    cells.forEach((cell) => {
      cell.setTile(Tools.getInstance().currentBrush);
    });
  }
}

window.TOOLS = Tools.getInstance();
