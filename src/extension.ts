import * as ChildProcess from "child_process";
import { ExtensionContext } from "vscode";
import { LanguageClient, LanguageClientOptions } from "vscode-languageclient/node";
import { waitForSocket } from "socket-retry-connect";
import denodeify from "denodeify";

let client: LanguageClient;

async function startServer(dev: boolean) {
	if(!dev) {
		const susc = ChildProcess.exec("susc -si");
		return susc;
	}

	const wait = denodeify(waitForSocket) as ({ port: number }) => any;
	const socket = await wait({ port: 9090 });
	console.log("connected");
	return { writer: socket, reader: socket };
}

export function activate(context: ExtensionContext) {
	const clientOptions: LanguageClientOptions = {
		documentSelector: ["sus"],
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		"suslang",
		"SUS Language Server",
		() => startServer(true),
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if(!client)
		return undefined;
	return client.stop();
}