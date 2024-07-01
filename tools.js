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
    cell.setTile(this.currentBrush);
  }

  eraseTool(cell){
    let blankTile = Scenario.getInstance().getPalette()[0];

    cell.setTile(blankTile);
  }

  fillTool(cell) {
    const currentTile = cell.getTile();
    let cells = [];
    cell.getAdjacentWhere((adjacent) => {
      return adjacent.getTile() === currentTile;
    });

    cells.forEach((cell) => {
      cell.setTile(this.currentBrush);
    });
  }


}
