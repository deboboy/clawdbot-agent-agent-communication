# Clawdbot Communication Agent

This directory contains a comprehensive communication agent that interfaces with the Clawdbot agent running on this machine.

## Files Created

### 1. `clawdbot-communicator-v2.js`
The main communication agent with the following features:

- **Interactive CLI**: Chat with Clawdbot via command line
- **Multiple Commands**: Status checks, session management, memory search
- **History Support**: Command history stored in `~/.clawdbot-communicator-history`
- **JSON Output**: Optional JSON mode for programmatic use
- **WebSocket Support**: Experimental direct WebSocket connection (alternative mode)
- **Session Tracking**: Monitors session IDs and message counts

### 2. Supporting Files
- `clawdbot-agent-v2.js` - WebSocket-based agent (experimental)
- `test-connection.js` - Simple connection test
- `test-communicator.js` - Non-interactive test suite

## Usage

### Basic Interactive Mode
```bash
node clawdbot-communicator-v2.js
```

### With Options
```bash
node clawdbot-communicator-v2.js --agent main --verbose
node clawdbot-communicator-v2.js --json  # JSON output
node clawdbot-communicator-v2.js --websocket  # WebSocket mode
```

### Commands (Interactive)
- `<any text>` - Send message to Clawdbot
- `status` - Show Clawdbot system status
- `sessions` - List active agent sessions
- `memory <query>` - Search agent memory
- `help` - Show help
- `quit` - Exit

## Current Status

✅ **Gateway**: Running on port 18789
✅ **Agent**: Main agent active (Claude Opus 4.5)
✅ **Communication**: CLI-based agent working
✅ **Authentication**: Token-based auth configured
✅ **Sessions**: Active session with context

## Features Implemented

### 1. CLI Communication Agent
- Uses `npx clawdbot agent` for reliable communication
- Handles JSON responses and extracts text
- Command history and session tracking
- Multiple interaction modes

### 2. WebSocket Agent (Experimental)
- Direct WebSocket connection to gateway
- Challenge-response authentication
- Real-time bidirectional communication

### 3. Status Monitoring
- Gateway connectivity checks
- Agent session status
- Memory search capabilities

## Clawdbot Capabilities

The connected Clawdbot agent has access to:
- **Communication**: Discord, WhatsApp, Telegram, Slack, Signal
- **Web**: Search, browser automation, web fetching
- **Files**: Read, write, edit, git operations
- **Code**: Shell commands, coding agents
- **Memory**: Persistent storage and search
- **Scheduling**: Cron jobs, reminders
- **Devices**: Paired device control
- **Integrations**: GitHub, Notion, Slack, weather

## Configuration

The agent uses the configuration from `/root/.clawdbot/clawdbot.json`:
- **Gateway**: `ws://127.0.0.1:18789`
- **Auth Token**: `4216a85fa3b127f8e3594df21adac0201e2d0c96c04f9404`
- **Agent Workspace**: `/root/clawd`
- **Default Agent**: `main` (Claude Opus 4.5)

## Security Notes

- Gateway bound to loopback interface (local only)
- Token-based authentication
- Discord channel configured with open group policy
- State directory permissions should be restricted (chmod 700)

## Next Steps

To extend this agent:
1. Add more WebSocket protocol handlers for real-time features
2. Implement proactive message handling
3. Add file transfer capabilities
4. Integrate with external monitoring systems
5. Add multi-agent coordination features

## Testing

Run the test suite:
```bash
node test-communicator.js
```

Check Clawdbot status:
```bash
node clawdbot-communicator-v2.js --status
```