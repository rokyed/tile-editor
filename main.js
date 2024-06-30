import './renderer.js';
import * as Core from "./core.js";
import { Scenario } from "./scenario.js";

document.addEventListener("DOMContentLoaded", function () {
  let scenarioWidthInput = document.querySelector(`input#scenario_width`);
  let scenarioHeightInput = document.querySelector(`input#scenario_height`);
  let renderer = document.querySelector("x-renderer");

  scenarioWidthInput.value = Scenario.getInstance().getMapWidth();
  scenarioHeightInput.value = Scenario.getInstance().getMapHeight();


  scenarioWidthInput.addEventListener("change", function () {
    const scenario = Scenario.getInstance();
    scenario.setMapWidth(this.value);
    renderer.lazyRender();
  });

  scenarioHeightInput.addEventListener("change", function () {
    const scenario = Scenario.getInstance();
    scenario.setMapHeight(this.value);
    renderer.lazyRender();
  });

  let zoomInButton = document.querySelector("button#zoom_in");
  let zoomOutButton = document.querySelector("button#zoom_out");
  let zoomResetButton = document.querySelector("button#zoom_reset");

  zoomInButton.addEventListener("click", function () {
    renderer.zoomIn();
  });
  zoomOutButton.addEventListener("click", function () {
    renderer.zoomOut();
  });
  zoomResetButton.addEventListener("click", function () {
    renderer.zoomReset();
  });

});
