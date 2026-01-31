#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

/**
 * Clawdbot Communication Agent
 * 
 * This agent provides a command-line interface to communicate with the Clawdbot agent
 * running on this machine. It supports various interaction modes and features.
 */
class ClawdbotCommunicator {
  constructor(options = {}) {
    this.options = {
      agent: 'main',
      json: false,
      verbose: false,
      ...options
    };
    
    this.rl = null;
    this.historyFile = path.join(process.env.HOME || '/root', '.clawdbot-communicator-history');
    this.sessionId = null;
    this.messageCount = 0;
  }

  /**
   * Start the interactive communicator
   */
  start() {
    console.log('🦞 Clawdbot Communication Agent v1.0');
    console.log('=====================================');
    console.log(`Target agent: ${this.options.agent}`);
    console.log('Commands:');
    console.log('  message <text>  - Send a message');
    console.log('  status          - Check Clawdbot status');
    console.log('  sessions        - List active sessions');
    console.log('  memory <query>  - Search memory');
    console.log('  help            - Show this help');
    console.log('  quit            - Exit');
    console.log('');
    
    this.setupReadline();
    this.prompt();
  }

  /**
   * Setup readline interface with history
   */
  setupReadline() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      history: this.loadHistory(),
      historySize: 100
    });

    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
      this.saveHistory();
    });

    this.rl.on('close', () => {
      console.log('\n👋 Goodbye!');
      process.exit(0);
    });
  }

  /**
   * Handle user commands
   */
  handleCommand(input) {
    if (!input) return;

    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
      case 'message':
      case 'msg':
        if (!args) {
          console.log('❌ Please provide a message');
        } else {
          this.sendMessage(args);
        }
        break;
      case 'status':
        this.checkStatus();
        break;
      case 'sessions':
        this.listSessions();
        break;
      case 'memory':
        if (!args) {
          console.log('❌ Please provide a search query');
        } else {
          this.searchMemory(args);
        }
        break;
      case 'help':
        this.showHelp();
        break;
      case 'quit':
      case 'exit':
        this.rl.close();
        break;
      default:
        // Treat any other input as a message
        this.sendMessage(input);
        break;
    }
  }

  /**
   * Send message to Clawdbot agent
   */
  async sendMessage(message) {
    console.log('📤 Sending to Clawdbot...');
    this.messageCount++;

    const args = [
      'clawdbot', 'agent', 
      '--agent', this.options.agent,
      '--message', message
    ];

    if (this.options.json) {
      args.push('--json');
    }

    const clawdbot = spawn('npx', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let error = '';

    clawdbot.stdout.on('data', (data) => {
      output += data.toString();
    });

    clawdbot.stderr.on('data', (data) => {
      error += data.toString();
    });

    clawdbot.on('close', (code) => {
      if (code === 0) {
        this.handleResponse(output);
      } else {
        console.error('❌ Error:', error || `Process exited with code ${code}`);
      }
      this.prompt();
    });
  }

  /**
   * Handle response from Clawdbot
   */
  handleResponse(output) {
    try {
      const response = JSON.parse(output);
      if (response.status === 'ok' && response.result && response.result.payloads) {
        response.result.payloads.forEach((payload, index) => {
          console.log(`🤖 Clawdbot [${index + 1}]: ${payload.text}`);
        });

        // Update session info if available
        if (response.result.meta && response.result.meta.agentMeta) {
          this.sessionId = response.result.meta.agentMeta.sessionId;
        }
      } else {
        console.log('🤖 Clawdbot: No response');
      }
    } catch (e) {
      console.log('🤖 Clawdbot (raw):', output);
    }

    if (this.options.verbose) {
      console.log(`\n📊 Message #${this.messageCount} sent`);
      if (this.sessionId) {
        console.log(`📋 Session ID: ${this.sessionId}`);
      }
    }
  }

  /**
   * Check Clawdbot status
   */
  checkStatus() {
    console.log('📊 Checking Clawdbot status...');
    
    const clawdbot = spawn('npx', ['clawdbot', 'status'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    clawdbot.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    clawdbot.stderr.on('data', (data) => {
      process.stderr.write(`Error: ${data}`);
    });

    clawdbot.on('close', () => {
      this.prompt();
    });
  }

  /**
   * List active sessions
   */
  listSessions() {
    console.log('📋 Listing sessions...');
    
    const clawdbot = spawn('npx', ['clawdbot', 'sessions'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    clawdbot.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    clawdbot.stderr.on('data', (data) => {
      process.stderr.write(`Error: ${data}`);
    });

    clawdbot.on('close', () => {
      this.prompt();
    });
  }

  /**
   * Search agent memory
   */
  searchMemory(query) {
    console.log(`🧠 Searching memory for: "${query}"`);
    
    const clawdbot = spawn('npx', ['clawdbot', 'memory', 'search', query], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    clawdbot.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    clawdbot.stderr.on('data', (data) => {
      process.stderr.write(`Error: ${data}`);
    });

    clawdbot.on('close', () => {
      this.prompt();
    });
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log('\n🦞 Clawdbot Communication Agent Help');
    console.log('===================================');
    console.log('');
    console.log('Interactive Commands:');
    console.log('  <any text>       - Send message to Clawdbot');
    console.log('  message <text>   - Explicit message command');
    console.log('  status           - Show Clawdbot system status');
    console.log('  sessions         - List active agent sessions');
    console.log('  memory <query>   - Search agent memory');
    console.log('  help             - Show this help');
    console.log('  quit             - Exit the communicator');
    console.log('');
    console.log('Examples:');
    console.log('  Hello, how are you?');
    console.log('  message Write a Python script to fetch weather');
    console.log('  status');
    console.log('  memory weather API keys');
    console.log('');
    this.prompt();
  }

  /**
   * Prompt for user input
   */
  prompt() {
    this.rl.question('> ', () => {});
  }

  /**
   * Load command history
   */
  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        return fs.readFileSync(this.historyFile, 'utf8').split('\n').filter(line => line.trim());
      }
    } catch (error) {
      // Ignore errors
    }
    return [];
  }

  /**
   * Save command history
   */
  saveHistory() {
    try {
      fs.writeFileSync(this.historyFile, this.rl.history.join('\n'));
    } catch (error) {
      // Ignore errors
    }
  }
}

/**
 * WebSocket-based Clawdbot Agent (Advanced)
 * 
 * Provides direct WebSocket communication with the Clawdbot gateway
 * for real-time bidirectional communication.
 */
class ClawdbotWebSocketAgent {
  constructor(options = {}) {
    this.gatewayUrl = options.gatewayUrl || 'ws://127.0.0.1:18789';
    this.authToken = options.authToken || '4216a85fa3b127f8e3594df21adac0201e2d0c96c04f9404';
    this.ws = null;
    this.messageId = 1;
    this.connected = false;
    this.authenticated = false;
  }

  /**
   * Connect to Clawdbot gateway
   */
  async connect() {
    const WebSocket = require('ws');
    
    console.log('🔌 Connecting to Clawdbot gateway...');
    
    this.ws = new WebSocket(this.gatewayUrl, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });

    return new Promise((resolve, reject) => {
      this.ws.on('open', () => {
        console.log('✅ WebSocket connection established');
        this.connected = true;
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        this.connected = false;
        this.authenticated = false;
      });
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log('📨 Received:', JSON.stringify(message, null, 2));
      
      switch (message.type) {
        case 'event':
          if (message.event === 'connect.challenge') {
            this.handleChallenge(message.payload);
          }
          break;
        case 'auth.success':
          console.log('✅ Authentication successful');
          this.authenticated = true;
          break;
        case 'auth.error':
          console.error('❌ Authentication failed:', message.payload);
          break;
        case 'agent.response':
          console.log(`🤖 Agent: ${message.payload?.message || 'No content'}`);
          break;
      }
    } catch (error) {
      console.log('📩 Raw message:', data);
    }
  }

  /**
   * Handle authentication challenge
   */
  handleChallenge(payload) {
    console.log('🔐 Handling authentication challenge...');
    
    const response = {
      type: 'auth.response',
      id: this.messageId++,
      timestamp: new Date().toISOString(),
      payload: {
        nonce: payload.nonce,
        token: this.authToken
      }
    };
    
    this.ws.send(JSON.stringify(response));
  }

  /**
   * Send message via WebSocket
   */
  sendAgentMessage(text) {
    if (!this.connected || !this.authenticated) {
      console.error('❌ Not connected or authenticated');
      return;
    }

    const message = {
      type: 'agent.request',
      id: this.messageId++,
      timestamp: new Date().toISOString(),
      payload: {
        message: text,
        channel: 'gateway'
      }
    };

    console.log('📤 Sending:', text);
    this.ws.send(JSON.stringify(message));
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const options = {};
  let useWebSocket = false;
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--agent':
        options.agent = args[++i];
        break;
      case '--json':
        options.json = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--websocket':
      case '--ws':
        useWebSocket = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Clawdbot Communication Agent

Usage: node clawdbot-communicator.js [options]

Options:
  --agent <name>     Target agent name (default: main)
  --json             Output responses in JSON format
  --verbose          Show verbose output
  --websocket, --ws  Use WebSocket connection (experimental)
  --help, -h         Show this help

Examples:
  node clawdbot-communicator.js
  node clawdbot-communicator.js --agent main --verbose
  node clawdbot-communicator.js --websocket
        `);
        process.exit(0);
    }
  }

  // Start the appropriate agent
  if (useWebSocket) {
    const wsAgent = new ClawdbotWebSocketAgent(options);
    wsAgent.connect().then(() => {
      console.log('🚀 WebSocket agent ready');
      // Add interactive mode here if needed
    }).catch(error => {
      console.error('Failed to connect:', error.message);
      process.exit(1);
    });
  } else {
    const communicator = new ClawdbotCommunicator(options);
    communicator.start();
  }
}

module.exports = { ClawdbotCommunicator, ClawdbotWebSocketAgent };