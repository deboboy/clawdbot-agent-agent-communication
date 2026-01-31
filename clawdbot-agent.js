#!/usr/bin/env node

const WebSocket = require('ws');
const readline = require('readline');

// Configuration from clawdbot.json
const GATEWAY_URL = 'ws://127.0.0.1:18789';
const AUTH_TOKEN = '4216a85fa3b127f8e3594df21adac0201e2d0c96c04f9404';

class ClawdbotAgent {
  constructor() {
    this.ws = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.messageId = 1;
  }

  connect() {
    console.log('🤖 Connecting to Clawdbot gateway...');
    
    this.ws = new WebSocket(GATEWAY_URL, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    this.ws.on('open', () => {
      console.log('✅ Connected to Clawdbot gateway');
      this.showMenu();
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.log('📩 Raw message:', data.toString());
      }
    });

    this.ws.on('error', (error) => {
      console.error('❌ Connection error:', error.message);
      process.exit(1);
    });

    this.ws.on('close', () => {
      console.log('🔌 Connection closed');
      process.exit(0);
    });
  }

  handleMessage(message) {
    console.log('📨 Received:', JSON.stringify(message, null, 2));
    
    if (message.type === 'agent.response' || message.type === 'message') {
      console.log(`🤖 Clawdbot: ${message.content || message.text || 'No content'}`);
    }
  }

  showMenu() {
    console.log('\n🦞 Clawdbot Communication Agent');
    console.log('Commands:');
    console.log('  message <text>  - Send a message to Clawdbot');
    console.log('  status          - Check agent status');
    console.log('  help            - Show this menu');
    console.log('  quit            - Exit');
    console.log('');
    this.prompt();
  }

  prompt() {
    this.rl.question('> ', (input) => {
      this.handleCommand(input.trim());
    });
  }

  handleCommand(input) {
    if (!input) {
      this.prompt();
      return;
    }

    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
      case 'message':
        if (!args) {
          console.log('❌ Please provide a message');
        } else {
          this.sendMessage(args);
        }
        break;
      case 'status':
        this.sendStatus();
        break;
      case 'help':
        this.showMenu();
        break;
      case 'quit':
      case 'exit':
        this.disconnect();
        break;
      default:
        console.log('❌ Unknown command. Type "help" for available commands.');
        this.prompt();
    }
  }

  sendMessage(text) {
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
    this.prompt();
  }

  sendStatus() {
    const message = {
      type: 'system.status',
      id: this.messageId++,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Requesting status...');
    this.ws.send(JSON.stringify(message));
    this.prompt();
  }

  disconnect() {
    console.log('👋 Disconnecting...');
    if (this.ws) {
      this.ws.close();
    }
    this.rl.close();
    process.exit(0);
  }
}

// Start the agent
const agent = new ClawdbotAgent();
agent.connect();

// Handle Ctrl+C
process.on('SIGINT', () => {
  agent.disconnect();
});