import { Scenario } from './scenario.js';

export class History {
  static instance = null;

  static getInstance() {
    if (!History.instance) {
      History.instance = new History();
    }
    return History.instance;
  }

  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  pushState(state) {
    // store state as JSON string to avoid mutation
    const serialized = JSON.stringify(state);
    this.undoStack.push(serialized);
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length <= 1) return;
    const current = this.undoStack.pop();
    this.redoStack.push(current);
    const prev = this.undoStack[this.undoStack.length - 1];
    if (prev) {
      Scenario.deserialize(JSON.parse(prev));
    }
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const state = this.redoStack.pop();
    this.undoStack.push(state);
    Scenario.deserialize(JSON.parse(state));
  }
}

window.HISTORY = History.getInstance();
