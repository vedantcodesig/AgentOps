import re
from pygls.lsp.server import LanguageServer
from lsprotocol.types import (
    TEXT_DOCUMENT_DID_OPEN, TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_SAVE,
    DidOpenTextDocumentParams, DidChangeTextDocumentParams, DidSaveTextDocumentParams,
    Diagnostic, Position, Range, DiagnosticSeverity, MessageType,
    ShowMessageParams, PublishDiagnosticsParams
)

server = LanguageServer("agentops-server", "v1.0")

def validate_document(ls: LanguageServer, uri: str):
    # Visually confirm Python is actually receiving the file text (v2 API)
    ls.window_show_message(
        ShowMessageParams(
            message="AgentOps Engine is scanning your code!", 
            type=MessageType.Info
        )
    )
    
    doc = ls.workspace.get_text_document(uri)
    lines = doc.lines
    diagnostics = []

    for line_num, line_content in enumerate(lines):
        if "TODO" in line_content:
            start_idx = line_content.find("TODO")
            diagnostic = Diagnostic(
                range=Range(
                    start=Position(line=line_num, character=start_idx),
                    end=Position(line=line_num, character=start_idx + 4)
                ),
                message="AgentOps Warning: Resolve outstanding TODO.",
                severity=DiagnosticSeverity.Warning,
                source="AgentOps Engine"
            )
            diagnostics.append(diagnostic)

        empty_agent_match = re.search(r'(agent\s*=\s*["\']["\'])', line_content)
        if empty_agent_match:
            start_idx, end_idx = empty_agent_match.span()
            diagnostic = Diagnostic(
                range=Range(
                    start=Position(line=line_num, character=start_idx),
                    end=Position(line=line_num, character=end_idx)
                ),
                message="AgentOps Error: Agent definitions cannot be blank.",
                severity=DiagnosticSeverity.Error,
                source="AgentOps Engine"
            )
            diagnostics.append(diagnostic)

    # Publish the diagnostics back to VS Code (v2 API)
    ls.text_document_publish_diagnostics(
        PublishDiagnosticsParams(
            uri=uri,
            diagnostics=diagnostics
        )
    )

@server.feature(TEXT_DOCUMENT_DID_OPEN)
def did_open(ls: LanguageServer, params: DidOpenTextDocumentParams):
    validate_document(ls, params.text_document.uri)

@server.feature(TEXT_DOCUMENT_DID_CHANGE)
def did_change(ls: LanguageServer, params: DidChangeTextDocumentParams):
    validate_document(ls, params.text_document.uri)

@server.feature(TEXT_DOCUMENT_DID_SAVE)
def did_save(ls: LanguageServer, params: DidSaveTextDocumentParams):
    validate_document(ls, params.text_document.uri)

if __name__ == '__main__':
    server.start_io()
