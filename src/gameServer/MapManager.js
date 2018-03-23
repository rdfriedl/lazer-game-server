import fs from "fs";
import { Tilemap } from "lazer-game-core";

export default class MapManager {
	constructor() {
		this.maps = [];
	}

	static get inst() {
		return this._inst || (this._inst = new this());
	}

	addMap(id, json, thumbnail) {
		if (typeof json === "string" && fs.existsSync(json)) {
			try {
				json = Tilemap.parseTiledJSON(JSON.parse(fs.readFileSync(json)));
			} catch (err) {
				return this;
			}
		}

		this.maps.push({
			id,
			json,
			thumbnail
		});

		return this;
	}

	hasMap(id) {
		return !!this.getMap(id);
	}

	getMap(id) {
		return this.maps.find(map => map.id === id);
	}
}

let mapManager = MapManager.inst;
export { mapManager, MapManager };
