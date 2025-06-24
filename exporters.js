import { Scenario } from './scenario.js';
import { Tile } from './tile.js';
import { defaultImage, defaultImageWidth, defaultImageHeight } from './staticData.js';

export function scenarioToCSV(scenario) {
  const lines = [];
  const width = scenario.getMapWidth();
  const height = scenario.getMapHeight();
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const cell = scenario.getCellAt(x, y);
      const tile = cell?.getTile(0);
      row.push(tile ? tile.getIndex() : -1);
    }
    lines.push(row.join(','));
  }
  return lines.join('\n');
}

export function csvToScenario(csv) {
  const rows = csv.trim().split(/\r?\n/).filter(r => r.length > 0);
  const height = rows.length;
  const width = rows[0].split(',').length;
  const scenario = Scenario.getInstance();
  scenario.newScenario(width, height);
  scenario.layerCount = 1;
  const palette = [];
  for (let y = 0; y < height; y++) {
    const values = rows[y].split(',').map(v => parseInt(v, 10));
    for (let x = 0; x < width; x++) {
      const idx = values[x];
      const cell = scenario.getCellAt(x, y);
      if (idx >= 0) {
        if (!palette[idx]) {
          const color = '#' + ((idx * 999999) % 0xffffff).toString(16).padStart(6, '0');
          palette[idx] = new Tile(idx, defaultImageWidth, defaultImageHeight, defaultImage, color);
        }
        cell.setTile(palette[idx], 0);
      } else {
        cell.setTile(null, 0);
      }
    }
  }
  scenario.palette = palette;
  scenario.fireUpdate(true);
}

export function scenarioToTMX(scenario) {
  const width = scenario.getMapWidth();
  const height = scenario.getMapHeight();
  const tileWidth = scenario.getPalette()[0]?.width || defaultImageWidth;
  const tileHeight = scenario.getPalette()[0]?.height || defaultImageHeight;
  const parts = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push(`<map version="1.0" tiledversion="1.10" orientation="orthogonal" renderorder="right-down" width="${width}" height="${height}" tilewidth="${tileWidth}" tileheight="${tileHeight}">`);
  parts.push(` <tileset firstgid="1" name="tileset" tilewidth="${tileWidth}" tileheight="${tileHeight}" tilecount="${scenario.getPalette().length}" columns="0">`);
  scenario.getPalette().forEach(tile => {
    parts.push(`  <tile id="${tile.getIndex()}">`);
    parts.push(`   <image width="${tile.width}" height="${tile.height}" source="${tile.getImage()}"/>`);
    parts.push('  </tile>');
  });
  parts.push(' </tileset>');
  for (let l = 0; l < scenario.layerCount; l++) {
    parts.push(` <layer id="${l + 1}" name="Layer ${l}" width="${width}" height="${height}">`);
    parts.push('  <data encoding="csv">');
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        const cell = scenario.getCellAt(x, y);
        const tile = cell?.getTile(l);
        row.push(tile ? tile.getIndex() + 1 : 0);
      }
      parts.push(row.join(','));
    }
    parts.push('  </data>');
    parts.push(' </layer>');
  }
  parts.push('</map>');
  return parts.join('\n');
}

export function tmxToScenario(tmx) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(tmx, 'text/xml');
  const map = doc.querySelector('map');
  const width = parseInt(map.getAttribute('width'));
  const height = parseInt(map.getAttribute('height'));
  const mapTileWidth = parseInt(map.getAttribute('tilewidth')) || defaultImageWidth;
  const mapTileHeight = parseInt(map.getAttribute('tileheight')) || defaultImageHeight;
  const tileset = doc.querySelector('tileset');
  const tileEls = tileset ? Array.from(tileset.querySelectorAll('tile')) : [];
  const palette = [];
  tileEls.forEach(tileEl => {
    const id = parseInt(tileEl.getAttribute('id'));
    const img = tileEl.querySelector('image');
    const src = img?.getAttribute('source') || defaultImage;
    const w = parseInt(img?.getAttribute('width')) || mapTileWidth;
    const h = parseInt(img?.getAttribute('height')) || mapTileHeight;
    const tile = new Tile(id, w, h, src);
    palette[id] = tile;
  });
  const scenario = Scenario.getInstance();
  scenario.newScenario(width, height);
  scenario.layerCount = doc.querySelectorAll('layer').length;
  scenario.palette = palette;
  const layers = Array.from(doc.querySelectorAll('layer'));
  layers.forEach((layerEl, lIdx) => {
    const data = layerEl.querySelector('data');
    const rows = data.textContent.trim().split(/\r?\n/);
    for (let y = 0; y < rows.length; y++) {
      const values = rows[y].split(',').map(v => parseInt(v, 10));
      for (let x = 0; x < values.length; x++) {
        const gid = values[x];
        if (gid > 0) {
          const tile = palette[gid - 1];
          const cell = scenario.getCellAt(x, y);
          cell.setTile(tile, lIdx);
        }
      }
    }
  });
  scenario.fireUpdate(true);
}
