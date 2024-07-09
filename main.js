import { Scenario } from "./scenario.js";
import { Tools } from "./tools.js";
//import './renderer.js';
import './canvasRenderer.js';
import './palette.js';
import './tileElement.js';
import { ContextWheel } from './contextWheel.js';

document.addEventListener("DOMContentLoaded", function () {
  Scenario.getInstance().setCurrentTool(Tools.getInstance().noopTool);
  let renderer = document.querySelector("x-renderer");
  let saveButton = document.querySelector("button#save");
  let loadButton = document.querySelector("button#load");

  saveButton.addEventListener("click", function () {
    let scenario = Scenario.getInstance();
    let data = scenario.serialize();
    let json = JSON.stringify(data);
    let blob = new Blob([json], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href
      = url;
    a.download = "scenario.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  loadButton.addEventListener("click", function () {
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.addEventListener("change", function () {
      let file = fileInput.files[0];
      let reader = new FileReader();
      reader.onload = function () {
        let json = reader.result;
        let data = JSON.parse(json);
        Scenario.deserialize(data);
      };
      reader.readAsText(file);
    });
    fileInput.click();
  });

  let layerUpButton = document.querySelector(`button#layer_up`);
  let layerDownButton = document.querySelector(`button#layer_down`);
  let layerView = document.querySelector(`span[name="current_layer"]`);
  let layerOnlyButton = document.querySelector(`button#toggle_only_layer`);
  layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
  layerOnlyButton.addEventListener('click', function () {
    renderer.toggleRenderOnlyCurrentLayer();
  });
  layerUpButton.addEventListener('click', function () {
    Scenario.getInstance().incrementLayer();
    layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
    renderer.lazyRender();
  });

  layerDownButton.addEventListener('click', function () {
    Scenario.getInstance().decrementLayer();
    layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
    renderer.lazyRender();
  });

  let scenarioWidthInput = document.querySelector(`input#scenario_width`);
  let scenarioHeightInput = document.querySelector(`input#scenario_height`);

  window.addEventListener('resize', function () {
    renderer.lazyRender();
  });

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

  let body = document.querySelector("body");

  body.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    ContextWheel.Show(event.clientX, event.clientY, [
      {
        name: "Paint",
        action: function () {
          const scenario = Scenario.getInstance();
          const tools = Tools.getInstance();
          scenario.setCurrentTool(tools.paintTool);
          visuallySelectBrush(brushSingleButton);
        }
      },
      {
        name: "Fill",
        action: function () {
          const scenario = Scenario.getInstance();
          const tools = Tools.getInstance();
          scenario.setCurrentTool(tools.fillTool);
          visuallySelectBrush(brushFillButton);
        }
      },
      {
        name: "No tool",
        action: function () {
          const scenario = Scenario.getInstance();
          const tools = Tools.getInstance();
          scenario.setCurrentTool(tools.noopTool);
          visuallySelectBrush(brushNone);
        }
      },
      {
        name: "Layer Up",
        action: function () {
          Scenario.getInstance().incrementLayer();
          layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
          renderer.lazyRender();
        }
      },
      {
        name: "Layer Down",
        action: function () {
          Scenario.getInstance().decrementLayer();
          layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
          renderer.lazyRender();
        }
      },
      {
        name: "Only Layer",
        action: function () {
          renderer.toggleRenderOnlyCurrentLayer();
        }
      },
      {
        name: "Toggle Stats",
        action: function () {
          renderer.toggleStats();
        }
      },
      {
        name: "Zoom In",
        action: function () {
          renderer.zoomIn();
        }
      },
      {
        name: "Zoom Out",
        action: function () {
          renderer.zoomOut();

        }
      },
      {
        name: "Zoom Reset",
        action: function () {
          renderer.zoomReset();
        }
      }
    ]);
  });
});
