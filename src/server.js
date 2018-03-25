import path from "path";
import express from "express";
import chalk from "chalk";
import expressStatusMonitor from "express-status-monitor";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import session from "express-session";
import logger from "morgan";
import bodyParser from "body-parser";

import * as paths from "./paths";
import gameServer from "./gameServer";
import routes from "./routes";

let app = express();

// register the template engine
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8000);
app.set("view engine", "pug");
app.set("views", paths.views);

app.use(cookieParser(process.env.APP_SECRET));
app.use(
	session({
		secret: process.env.APP_SECRET
	})
);
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger(process.env.NODE_ENV === "development" ? "dev" : "tiny"));

app.use("/public", express.static(path.resolve(__dirname, "../public")));
app.use("/", routes);

// start the server
const server = app.listen(app.get("port"), app.get("host"), () => {
	console.log(
		"%s App is running at http://%s:%d in %s mode",
		chalk.green("✓"),
		app.get("host"),
		app.get("port"),
		app.get("env")
	);
	console.log("  Press CTRL-C to stop\n");
});

// attach the game server
gameServer.attach(server);

app.use(
	expressStatusMonitor({
		websocket: gameServer
	})
);
