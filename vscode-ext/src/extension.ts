import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    // --- 1. START THE PYTHON ENGINE (LSP) ---
    const pythonPath = path.resolve(context.extensionPath, '..', 'backend', 'venv', 'bin', 'python');
    const serverScript = path.resolve(context.extensionPath, '..', 'backend', 'lsp_server.py');

    if (fs.existsSync(pythonPath)) {
        const serverOptions: ServerOptions = {
            command: pythonPath,
            args: ['-u', '-W', 'ignore', serverScript]
        };
        const clientOptions: LanguageClientOptions = {
            documentSelector: [{ scheme: 'file', language: 'python' }]
        };
        client = new LanguageClient('agentopsLSP', 'AgentOps Server', serverOptions, clientOptions);
        client.start().catch(err => console.error(`LSP Failed: ${err.message}`));
    }

    // --- 2. REGISTER THE FRONTEND UI (WEBVIEW) ---
    let disposable = vscode.commands.registerCommand('agentops-studio.openApp', () => {
        // Create and show a new webview panel
        const panel = vscode.window.createWebviewPanel(
            'agentopsApp', // Internal ID
            'AgentOps Studio', // The text on the tab
            vscode.ViewColumn.Beside, // Opens the app split-screen next to their code!
            {
                enableScripts: true, // Crucial for React/JS apps to work
                retainContextWhenHidden: true // Keeps the app running if they switch tabs
            }
        );

        // Inject the HTML/UI
        panel.webview.html = getWebviewContent();
    });

    context.subscriptions.push(disposable);
}

// This is the container where your actual app will go.
// For right now, we are putting a placeholder UI to test the connection.
function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AgentOps App</title>
        <style>
            body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-editor-foreground); }
            button { padding: 10px 20px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; border-radius: 4px; }
            button:hover { background: var(--vscode-button-hoverBackground); }
        </style>
    </head>
    <body>
        <h1>AgentOps Studio 🚀</h1>
        <p>Your full frontend application lives inside this secure tab.</p>
        <br>
        <button onclick="alert('React, Next.js, or Vue apps can be injected right here!')">Test App Interaction</button>
    </body>
    </html>`;
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) return undefined;
    return client.stop();
}
