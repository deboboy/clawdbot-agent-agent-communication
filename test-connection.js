#!/usr/bin/env node

const WebSocket = require('ws');

const GATEWAY_URL = 'ws://127.0.0.1:18789';
const AUTH_TOKEN = '4216a85fa3b127f8e3594df21adac0201e2d0c96c04f9404';

console.log('🔍 Testing Clawdbot gateway connection...');

const ws = new WebSocket(GATEWAY_URL, {
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
});

ws.on('open', () => {
  console.log('✅ WebSocket connection established');
  
  // Send a test message
  const testMessage = {
    type: 'ping',
    id: Date.now(),
    timestamp: new Date().toISOString()
  };
  
  console.log('📤 Sending ping:', JSON.stringify(testMessage));
  ws.send(JSON.stringify(testMessage));
  
  // Send an agent message
  setTimeout(() => {
    const agentMessage = {
      type: 'agent.request',
      id: Date.now() + 1,
      timestamp: new Date().toISOString(),
      payload: {
        message: 'Hello Clawdbot! Can you respond?',
        channel: 'gateway'
      }
    };
    
    console.log('📤 Sending agent message:', JSON.stringify(agentMessage));
    ws.send(JSON.stringify(agentMessage));
  }, 1000);
  
  // Close after 10 seconds
  setTimeout(() => {
    ws.close();
  }, 10000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 Received:', JSON.stringify(message, null, 2));
  } catch (error) {
    console.log('📩 Raw message:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

ws.on('close', (code, reason) => {
  console.log(`🔌 Connection closed: ${code} - ${reason}`);
  process.exit(0);
});