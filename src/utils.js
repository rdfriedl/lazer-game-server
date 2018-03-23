import _ from "lodash";
import p2 from "p2";

export const NAME_TEMPLATES = [
	"nice {{name}}",
	"awesome {{name}}",
	"{{name}} the cool",
	"{{name}} the short",
	"{{name}} the tall",
	"{{name}} the fat",
	"{{name}} the thin",
	"{{name}} the scared",
	"insane {{name}}",
	"{{name}} the kid",
	"really fat {{name}}",
	"{{name}} the smart",
	"{{name}} the brave",
	"the amazing {{name}}",
	"{{name}} the bald"
];
export const NAMES = [
	"James",
	"John",
	"Robert",
	"Michael",
	"William",
	"David",
	"Richard",
	"Charles",
	"Joseph",
	"Thomas",
	"Christopher",
	"Daniel",
	"Paul",
	"Mark",
	"Donald",
	"George",
	"Kenneth",
	"Steven",
	"Edward",
	"Brian",
	"Ronald",
	"Anthony",
	"Kevin",
	"Jason",
	"Matthew",
	"Gary",
	"Timothy",
	"Jose",
	"Larry",
	"Jeffrey",
	"Frank",
	"Scott",
	"Eric",
	"Stephen",
	"Andrew",
	"Raymond",
	"Gregory",
	"Joshua",
	"Jerry",
	"Dennis",
	"Walter",
	"Patrick",
	"Peter",
	"Harold",
	"Douglas",
	"Henry",
	"Carl",
	"Arthur",
	"Ryan",
	"Roger",
	"Joe",
	"Juan",
	"Jack",
	"Albert",
	"Jonathan",
	"Justin",
	"Terry",
	"Gerald",
	"Keith",
	"Samuel",
	"Willie",
	"Ralph",
	"Lawrence",
	"Nicholas",
	"Roy",
	"Benjamin",
	"Bruce",
	"Brandon",
	"Adam",
	"Harry",
	"Fred",
	"Wayne",
	"Billy",
	"Steve",
	"Louis",
	"Jeremy",
	"Aaron",
	"Randy",
	"Howard",
	"Eugene",
	"Carlos",
	"Russell",
	"Bobby",
	"Victor",
	"Martin",
	"Ernest",
	"Phillip",
	"Todd",
	"Jesse",
	"Craig",
	"Alan",
	"Shawn",
	"Clarence",
	"Sean",
	"Philip",
	"Chris",
	"Johnny",
	"Earl",
	"Jimmy",
	"Antonio"
];

export function createName() {
	return NAME_TEMPLATES[Math.floor(Math.random() * NAME_TEMPLATES.length)].replace(
		"{{name}}",
		NAMES[Math.floor(Math.random() * NAMES.length)]
	);
}

export function lerp(v0, v1, t) {
	return v0 * (1 - t) + v1 * t;
}

export function parseSearch(url) {
	url = url || (window && window.location.href);
	parseSearch.cache = parseSearch.cache || {};
	if (!parseSearch.cache[url]) {
		let search = url.indexOf("?") !== -1 ? url.substr(url.indexOf("?") + 1, url.length + 1) : "";
		let queries = search
			.replace(/^\?/, "")
			.replace(/\+/g, " ")
			.split("&");
		parseSearch.cache[url] = {};
		for (let i = 0; i < queries.length; i++) {
			let split = queries[i].split("=");
			if (split[0] !== "") {
				let value = split[1];
				if (!isNaN(value)) value = parseFloat(value);
				else if (value === "true" || value === undefined || value === "on") value = true;
				else if (value === "false" || value === "off") value = false;
				else value = window.unescape(value);

				parseSearch.cache[url][split[0]] = value;
			}
		}
	}
	return parseSearch.cache[url];
}

const DEFAULT_SETTINGS = {
	color: undefined,
	name: undefined,
	shadows: true,
	debug: false
};
export function getURLSearchSettings(url = location.href) {
	if (!getURLSearchSettings.cache) getURLSearchSettings.cache = {};

	if (!getURLSearchSettings.cache[url]) {
		let params = parseSearch(url);
		let settings = _.clone(DEFAULT_SETTINGS);

		// only trun off the shadows if its set to false
		if (params.shadows === false) settings.shadows = false;

		settings.debug = !!params.debug;

		getURLSearchSettings.cache[url] = settings;
	}

	return getURLSearchSettings.cache[url];
}

export function buildCollisions(collisions) {
	let bodies = [];

	for (let i = 0; i < collisions.length; i++) {
		let object = collisions[i];

		if (!object.visible) continue;

		// create the shape
		if (Array.isArray(object.polygon)) {
			let body = new p2.Body({ mass: 0 });
			body.position[0] = object.x;
			body.position[1] = object.y;
			body.fromPolygon(object.polygon.map(point => [point.x, point.y]));
			bodies.push(body);
		} else if (Array.isArray(object.polyline)) {
			let body = new p2.Body({ mass: 0 });
			body.position[0] = object.x;
			body.position[1] = object.y;

			// start at the second point
			for (let i = 1; i < object.polyline.length; i++) {
				let prev = object.polyline[i - 1];
				let curr = object.polyline[i];
				let length = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
				let angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
				body.addShape(
					new p2.Line({
						position: [lerp(prev.x, curr.x, 0.5), lerp(prev.y, curr.y, 0.5)],
						length: length,
						angle: angle
					})
				);
			}

			bodies.push(body);
		} else if (object.height > 0 && object.width > 0) {
			let body = new p2.Body({ mass: 0 });
			body.position[0] = object.x + object.width / 2;
			body.position[1] = object.y + object.height / 2;
			body.addShape(
				new p2.Box({
					width: object.width,
					height: object.height
				})
			);
			bodies.push(body);
		}
	}

	return bodies;
}

export function clipDecimals(v, n = 3) {
	return Math.round(v * Math.pow(10, n)) / Math.pow(10, n);
}
