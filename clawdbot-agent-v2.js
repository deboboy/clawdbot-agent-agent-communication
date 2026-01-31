#!/usr/bin/env node

const WebSocket = require('ws');
const crypto = require('crypto');

const GATEWAY_URL = 'ws://127.0.0.1:18789';
const AUTH_TOKEN = '4216a85fa3b127f8e3594df21adac0201e2d0c96c04f9404';

class ClawdbotAgent {
  constructor() {
    this.ws = null;
    this.authenticated = false;
    this.messageId = 1;
  }

  async connect() {
    console.log('🤖 Connecting to Clawdbot gateway...');
    
    this.ws = new WebSocket(GATEWAY_URL, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    this.ws.on('open', () => {
      console.log('✅ WebSocket connection established');
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

    this.ws.on('close', (code, reason) => {
      console.log(`🔌 Connection closed: ${code} - ${reason}`);
      process.exit(0);
    });
  }

  handleMessage(message) {
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
        this.startInteraction();
        break;
      case 'auth.error':
        console.error('❌ Authentication failed:', message.payload);
        this.ws.close();
        break;
      case 'agent.response':
      case 'message':
        console.log(`🤖 Clawdbot: ${message.content || message.text || message.payload?.message || 'No content'}`);
        break;
    }
  }

  handleChallenge(payload) {
    console.log('🔐 Handling authentication challenge...');
    
    const response = {
      type: 'auth.response',
      id: this.messageId++,
      timestamp: new Date().toISOString(),
      payload: {
        nonce: payload.nonce,
        token: AUTH_TOKEN
      }
    };
    
    console.log('📤 Sending auth response...');
    this.ws.send(JSON.stringify(response));
  }

  startInteraction() {
    console.log('\n🦞 Clawdbot Communication Agent Ready!');
    console.log('Type your messages and press Enter to send them to Clawdbot.');
    console.log('Type "quit" to exit.\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const prompt = () => {
      rl.question('> ', (input) => {
        if (input.toLowerCase() === 'quit') {
          this.ws.close();
          rl.close();
          return;
        }
        
        if (input.trim()) {
          this.sendMessage(input);
        }
        prompt();
      });
    };

    prompt();
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
  }
}

// Start the agent
const agent = new ClawdbotAgent();
agent.connect();

// Handle Ctrl+C
process.on('SIGINT', () => {
  if (agent.ws) {
    agent.ws.close();
  }
  process.exit(0);
});