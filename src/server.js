import express from "express";
import http from "http";
import chalk from "chalk";
import expressStatusMonitor from "express-status-monitor";

import * as paths from "./paths";
import gameServer from "./gameServer";
import views from "./views";

let app = express();
let server = http.createServer(app);

// register the template engine
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8000);
app.set("view engine", "pug");
app.set("views", paths.views);
app.use("/", views);

app.use(expressStatusMonitor());

// attach the game server
gameServer.attach(server);

// start the server
server.listen(app.get("port"), app.get("host"), () => {
	console.log(
		"%s App is running at http://%s:%d in %s mode",
		chalk.green("✓"),
		app.get("host"),
		app.get("port"),
		app.get("env")
	);
	console.log("  Press CTRL-C to stop\n");
});
