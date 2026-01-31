#!/usr/bin/env node

const { ClawdbotCommunicator } = require('./clawdbot-communicator-v2.js');

async function testCommunicator() {
  console.log('🧪 Testing Clawdbot Communication Agent...');
  
  const communicator = new ClawdbotCommunicator({ verbose: true });
  
  // Test 1: Send a message
  console.log('\n📤 Test 1: Sending message...');
  await communicator.sendMessage("Hello! Tell me briefly what you are.");
  
  // Wait a bit then test 2
  setTimeout(async () => {
    console.log('\n📊 Test 2: Checking status...');
    await communicator.checkStatus();
    
    console.log('\n✅ Tests completed!');
    process.exit(0);
  }, 3000);
}

// Mock the readline prompt for non-interactive use
ClawdbotCommunicator.prototype.prompt = function() {
  // Do nothing in test mode
};

testCommunicator().catch(console.error);