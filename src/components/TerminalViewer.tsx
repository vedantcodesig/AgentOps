import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function TerminalViewer() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ensure this only runs on the client and once
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !terminalRef.current || termInstance.current) return;

    const term = new Terminal({
      theme: { background: '#0a0a0f', foreground: '#e2e2f0' },
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13,
      disableStdin: true,
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    termInstance.current = term;

    // Use requestAnimationFrame to wait for the next browser paint
    requestAnimationFrame(() => {
      try { fitAddon.fit(); } catch (e) {}
    });

    term.writeln('\x1b[35m[AgentOps Sandbox Terminal Connected]\x1b[0m');

    const ws = new WebSocket('ws://localhost:8000/ws/terminal');
    ws.onmessage = (e) => term.write(e.data.replace(/\n/g, '\r\n'));
    ws.onerror = () => term.writeln('\x1b[31m\r\n[WebSocket Error]\x1b[0m');

    return () => {
      ws.close();
      term.dispose();
      termInstance.current = null;
    };
  }, [isMounted]);

  return (
    <div style={{ marginTop: '24px' }}>
      <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Live Execution Logs</label>
      <div 
        ref={terminalRef} 
        style={{ height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', padding: '8px', backgroundColor: '#0a0a0f' }} 
      />
    </div>
  );
}
