import { Scenario } from "./scenario.js";
import { Tools } from "./tools.js";
import { defaultImage, defaultImageWidth, defaultImageHeight } from "./staticData.js";
//import './renderer.js';
import './canvasRenderer.js';
import './palette.js';
import './tileElement.js';
import { ScenarioOptionsModal } from "./scenarioOptionsModal.js";
import { ContextWheel } from './contextWheel.js';
import './layerOptions.js';

/*
 * In this file all the different modules are imported, used and fused together
 */

document.addEventListener("DOMContentLoaded", function () {
  Scenario.getInstance().setCurrentTool(Tools.getInstance().noopTool);
  let renderer = document.querySelector("x-renderer");
  let saveButton = document.querySelector("button#save");
  let loadButton = document.querySelector("button#load");
  let currentToolSpan = document.querySelector("span#current_tool");
  let currentTileSpan = document.querySelector("span#current_tile");
  let scenarioOptionsButton = document.querySelector("button#scenario_options");

  window.addEventListener("tile.interact", function (event) {
    currentTileSpan.innerText = `${event.detail.x}, ${event.detail.y}`;
  });

  scenarioOptionsButton.addEventListener("click", function () {
    const scenarioOptionsModal = document.querySelector("scenario-options-modal");

    if (!scenarioOptionsModal) {
      const modal = new ScenarioOptionsModal();
      document.body.appendChild(modal);
    }

    scenarioOptionsModal.openDialog();
  });

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

  const layerOptions = document.querySelector('layer-options');
  const layerShadow = layerOptions?.shadowRoot;
  let layerUpButton = layerShadow?.querySelector(`#layer_up`);
  let layerDownButton = layerShadow?.querySelector(`#layer_down`);
  let layerView = layerShadow?.querySelector('[name="current_layer"]');
  let layerOnlyButton = layerShadow?.querySelector(`#toggle_only_layer`);
  if (layerView)
    layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
  layerOnlyButton?.addEventListener('click', function () {
    renderer.toggleRenderOnlyCurrentLayer();
  });
  layerUpButton?.addEventListener('click', function () {
    Scenario.getInstance().incrementLayer();
    if (layerView)
      layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
    renderer.lazyRender();
  });

  layerDownButton?.addEventListener('click', function () {
    Scenario.getInstance().decrementLayer();
    if (layerView)
      layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
    renderer.lazyRender();
  });

  window.addEventListener('resize', function () {
    renderer.lazyRender();
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
  loadPaletteButton.addEventListener("click", function () {
    let paletteTileSize = parseInt(prompt("Enter the size of the palette tile (in pixels)", "16"));

    if (isNaN(paletteTileSize)) {
      alert("Invalid palette tile size");
      return;
    }

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

  let generatePaletteButton = document.querySelector("button#generate_palette");
  generatePaletteButton.addEventListener("click", function () {
    const scenario = Scenario.getInstance();
    if (scenario.getPalette().length > 0)
      return;
    scenario.pushImageIntoPalette(defaultImage, defaultImageWidth, defaultImageHeight);
    renderer.lazyRender();
  });

  let newScenarioButton = document.querySelector("button#new_scenario");

  newScenarioButton.addEventListener("click", function () {
    let confirm = window.confirm("Are you sure you want to create a new scenario?");

    if (!confirm) {
      return;
    }

    let scenarioWidth = parseInt(prompt("Enter the width of the scenario", "32"));
    let scenarioHeight = parseInt(prompt("Enter the height of the scenario", "32"));

    if (isNaN(scenarioWidth) || isNaN(scenarioHeight)) {
      alert("Invalid scenario dimensions");
      return;
    }

    let scenario = Scenario.getInstance();
    scenario.newScenario(scenarioWidth, scenarioHeight);
    renderer.lazyRender();
    renderer.resetViewport();
  });

  window.addEventListener("brush.change", function (e) {
    let tile = e.detail;
    let preview = document.querySelector('[name="brush_preview"]');

    if (tile) {
      preview.setAttribute('image', tile?.getImage());
      preview.removeAttribute('data-no-tile');
    } else {
      preview.setAttribute('data-no-tile', 'true');
      preview.removeAttribute('image');
    }
  });

  let body = document.querySelector("body");

  body.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    ContextWheel.Show(event.clientX, event.clientY, [
      {
        name: "🖌️",
        detail: "Paint tool",
        color: "rgba(255, 165, 0, 0.5)",
        action: function () {
          const scenario = Scenario.getInstance();
          const tools = Tools.getInstance();
          scenario.setCurrentTool(tools.paintTool);
          currentToolSpan.innerHTML = "🖌️ Paint tool";
        }
      },
      {
        name: "🪣",
        detail: "Fill tool",
        color: "rgba(255, 165, 0, 0.5)",
        action: function () {
          const scenario = Scenario.getInstance();
          const tools = Tools.getInstance();
          scenario.setCurrentTool(tools.fillTool);
          currentToolSpan.innerHTML = "🪣 Fill tool";
        }
      },
      {
        name: "🚫",
        detail: "No tool",
        color: "rgba(255, 165, 0, 0.5)",
        action: function () {
          const scenario = Scenario.getInstance();
          const tools = Tools.getInstance();
          scenario.setCurrentTool(tools.noopTool);
          currentToolSpan.innerHTML = "🚫 No tool";
        }
      },
      {
        name: "📥",
        detail: "Layer Down",
        color: "rgba(255, 0, 0, 0.5)",
        action: function () {
          Scenario.getInstance().decrementLayer();
          layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
          renderer.lazyRender();
        }
      },
      {
        name: "👁️",
        detail: "See Layer Only",
        color: "rgba(255, 0, 0, 0.5)",
        action: function () {
          renderer.toggleRenderOnlyCurrentLayer();
        }
      },

      {
        name: "📤",
        detail: "Layer Up",
        color: "rgba(255, 0, 0, 0.5)",
        action: function () {
          Scenario.getInstance().incrementLayer();
          layerView.innerHTML = `Current layer: ${Scenario.getInstance().currentLayer}`;
          renderer.lazyRender();
        }
      },
      {
        name: "🔎+",
        detail: "Zoom In",
        color: "rgba(0, 255, 255, 0.5)",
        action: function () {
          renderer.zoomIn();
        }
      },
      {
        name: "🔎-",
        detail: "Zoom Out",
        color: "rgba(0, 255, 255, 0.5)",
        action: function () {
          renderer.zoomOut();

        }
      },
      {
        name: "🔎↺",
        detail: "Reset Zoom",
        color: "rgba(0, 255, 255, 0.5)",
        action: function () {
          renderer.zoomReset();
        }
      },
      {
        name: "🧹",
        detail: "Clear options",
        color: "rgba(0, 100, 255, 0.5)",
        action: function () {
          renderer.toggleStats(true);
          Scenario.getInstance().setCurrentTool((cell) => {
            cell.clearCellOptions();
          });
          currentToolSpan.innerHTML = "🧹 Clear options";
        }
      },
      {
        detail: "Remove option",
        name: "🔧-",
        color: "rgba(0, 100, 255, 0.5)",
        action: function () {
          let options = Scenario.getInstance().getOptions();
          let buttons = Scenario.getInstance().getOptions().map((option, index, arr) => {
            let optObj = options.getOption(option);
            return {
              name: option || "No key",
              color: optObj.color,
              detail: optObj.value || "",
              action: () => {
                let opts = {};
                opts[option] = null;
                Scenario.getInstance().setCurrentTool((cell) => {
                  renderer.toggleStats(true)
                  cell.setCellOptions(opts);
                });
                currentToolSpan.innerHTML = `🔧 Remove option (${option})`;
              }
            };
          });

          setTimeout(() => {
            if (!buttons || buttons.length === 0) {
              buttons = [{
                name: "None",
                detail: "Set in options",
                action: () => {
                  renderer.toggleStats(true)
                }

              }];
            }
            ContextWheel.Show(event.clientX, event.clientY, buttons);
          });


        }
      },
      {
        detail: "Add option",
        name: "🔧+",
        color: "rgba(0, 100, 255, 0.5)",
        action: function () {
          let options = Scenario.getInstance().getOptions();
          let buttons = Scenario.getInstance().getOptions().map((option, index, arr) => {
            let optObj = options.getOption(option);
            return {
              name: option,
              color: optObj.color,
              detail: optObj.value || "",
              action: () => {
                let opts = {};
                opts[option] = true;
                renderer.toggleStats(true)
                Scenario.getInstance().setCurrentTool((cell) => {
                  cell.setCellOptions(opts);
                });
                currentToolSpan.innerHTML = `🔧 Add option (${option})`;
              }
            };
          });

          setTimeout(() => {
            if (!buttons || buttons.length === 0) {
              buttons = [{
                name: "None",
                detail: "Set in options",
                action: () => {
                  renderer.toggleStats(true)
                }

              }];
            }
            ContextWheel.Show(event.clientX, event.clientY, buttons);
          });
        }
      }
    ]);
  });
});
