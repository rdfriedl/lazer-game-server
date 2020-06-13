import path from "path";
import { Router } from "express";
import qs from "qs";
import { mapManager } from "../gameServer/MapManager";
import { gameManager } from "../gameServer/GameManager";

const router = new Router();

router.param("gameId", (req, res, next, gameId) => {
	let game = gameManager.getGame(gameId);
	if (!game) throw new Error(`No game with id: ${gameId}`);

	// update the games last active
	game.info.lastActive = new Date();

	// attach game to request
	req.game = game;
	Object.assign(res.locals, {
		game,
		map: mapManager.getMap(game.info.map)
	});

	next();
});

router.get("/:gameId", (req, res) => {
	res.render("game/index");
});
router.get("/:gameId/thumbnail", (req, res) => {
	res.sendFile(path.resolve(__dirname, `../res/maps/${req.game.info.map}.png`));
});

router.all("/:gameId/play", (req, res) => {
	let game = req.game;

	if (game.info.password && req.query.password !== game.info.password) throw new Error("Incorrect password");

	if (game.players.players.length >= game.config.player.max)
		throw new Error(`This game has a limit of ${game.config.player.max} players`);

	const query = Object.assign({}, { game: res.locals.game.id }, req.query);

	res.redirect(process.env.CLIENT_URL + "?" + qs.stringify(query));
});

export default router;
