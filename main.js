import { Scenario } from "./scenario.js";
import { Tools } from "./tools.js";
//import './renderer.js';
import './canvasRenderer.js';
import './palette.js';
import './tileElement.js';

document.addEventListener("DOMContentLoaded", function () {
  Scenario.getInstance().setCurrentTool(Tools.getInstance().noopTool);

  let scenarioWidthInput = document.querySelector(`input#scenario_width`);
  let scenarioHeightInput = document.querySelector(`input#scenario_height`);
  let renderer = document.querySelector("x-renderer");

  scenarioWidthInput.value = Scenario.getInstance().getMapWidth();
  scenarioHeightInput.value = Scenario.getInstance().getMapHeight();


  scenarioWidthInput.addEventListener("change", function () {
    const scenario = Scenario.getInstance();
    scenario.setMapWidth(this.value);
    renderer.resetViewport();
  });

  scenarioHeightInput.addEventListener("change", function () {
    const scenario = Scenario.getInstance();
    scenario.setMapHeight(this.value);
    renderer.resetViewport();
  });

  let zoomInButton = document.querySelector("button#zoom_in");
  let zoomOutButton = document.querySelector("button#zoom_out");
  let zoomResetButton = document.querySelector("button#zoom_reset");
  let toggleStatsButton = document.querySelector("button#toggle_stats");

  zoomInButton.addEventListener("click", function () {
    renderer.zoomIn();
  });
  zoomOutButton.addEventListener("click", function () {
    renderer.zoomOut();
  });
  zoomResetButton.addEventListener("click", function () {
    renderer.zoomReset();
  });

  toggleStatsButton.addEventListener("click", function () {
    renderer.toggleStats();
  });

  let loadPaletteButton = document.querySelector("button#load_palette");
  let paletteTileSizeInput = document.querySelector("input#palette_tile_size");

  loadPaletteButton.addEventListener("click", function () {
    // load file then draw it on the canvas

    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".png, .jpg, .jpeg";

    fileInput.addEventListener("change", function () {
      let file = this.files[0];

      if (!file) {
        return;
      }

      let reader = new FileReader();

      reader.onload = function (e) {
        let img = new Image();
        img.onload = function () {
          let paletteTileSize = parseInt(paletteTileSizeInput.value);
          let canvas = document.createElement("canvas");

          canvas.width = img.width;
          canvas.height = img.height;

          if (img.width % paletteTileSize !== 0 || img.height % paletteTileSize !== 0) {
            alert("Image width and height must be divisible by palette tile size");
            return;
          }


          let ctx = canvas.getContext("2d");

          ctx.drawImage(img, 0, 0);

          let hCells = img.width / paletteTileSize;
          let vCells = img.height / paletteTileSize;
          const scenario = Scenario.getInstance();

          for (let y = 0; y < vCells; y++) {
            for (let x = 0; x < hCells; x++) {
              let tile = ctx.getImageData(x * paletteTileSize, y * paletteTileSize, paletteTileSize, paletteTileSize);
              let tileCanvas = document.createElement("canvas");
              tileCanvas.width = paletteTileSize;
              tileCanvas.height = paletteTileSize;
              tileCanvas.style.display = "none";
              tileCanvas.getContext("2d").putImageData(tile, 0, 0);
              document.body.appendChild(tileCanvas);
              const url = tileCanvas.toDataURL();
              scenario.pushImageIntoPalette(url, x, y);

              tileCanvas.remove();
            }
          }

          document.querySelector("x-renderer").lazyRender();
        }

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });

    fileInput.click();
  });

  const brushes = document.querySelectorAll('.brush');
  const visuallySelectBrush = (brush) => {
    brushes.forEach((brush) => {
      brush.classList.remove('selected');
    });
    brush.classList.add('selected');
  };

  const brushNone = document.querySelector('button[name="brush_none"]');
  brushNone.addEventListener("click", function () {
    const scenario = Scenario.getInstance();
    const tools = Tools.getInstance();
    scenario.setCurrentTool(tools.noopTool);
    visuallySelectBrush(brushNone);
  });

  const brushSingleButton = document.querySelector('button[name="brush_single"]');

  brushSingleButton.addEventListener("click", function () {
    const scenario = Scenario.getInstance();
    const tools = Tools.getInstance();
    scenario.setCurrentTool(tools.paintTool);
    visuallySelectBrush(brushSingleButton);
  });

  const brushFillButton = document.querySelector('button[name="brush_fill"]');

  brushFillButton.addEventListener("click", function () {
    const scenario = Scenario.getInstance();
    const tools = Tools.getInstance();
    scenario.setCurrentTool(tools.fillTool);
    visuallySelectBrush(brushFillButton);
  });

  let newScenarioButton = document.querySelector("button#new_scenario");

  newScenarioButton.addEventListener("click", function () {
    let scenarioWidth = parseInt(scenarioWidthInput.value);
    let scenarioHeight = parseInt(scenarioHeightInput.value);

    let scenario = Scenario.getInstance();
    scenario.newScenario(scenarioWidth, scenarioHeight);
  });

  window.addEventListener("brush.change", function (e) {
    document.querySelector('[name="brush_preview"]').setAttribute('image', e.detail.getImage());
  });
});
