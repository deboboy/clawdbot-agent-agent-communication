#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

class ClawdbotAgent {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  start() {
    console.log('🦞 Clawdbot Communication Agent');
    console.log('This agent communicates with the Clawdbot main agent via CLI.');
    console.log('Type your messages and press Enter to send them to Clawdbot.');
    console.log('Type "quit" to exit.\n');
    
    this.prompt();
  }

  prompt() {
    this.rl.question('> ', (input) => {
      if (input.toLowerCase() === 'quit') {
        this.rl.close();
        return;
      }
      
      if (input.trim()) {
        this.sendMessage(input);
      }
      this.prompt();
    });
  }

  sendMessage(message) {
    console.log('📤 Sending to Clawdbot...');
    
    // Use the clawdbot CLI to send message to main agent
    const clawdbot = spawn('npx', ['clawdbot', 'agent', '--agent', 'main', '--message', message, '--json'], {
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
        try {
          const response = JSON.parse(output);
          if (response.status === 'ok' && response.result && response.result.payloads) {
            response.result.payloads.forEach((payload, index) => {
              console.log(`🤖 Clawdbot [${index + 1}]: ${payload.text}`);
            });
          } else {
            console.log('🤖 Clawdbot: No response');
          }
        } catch (e) {
          console.log('🤖 Clawdbot (raw):', output);
        }
      } else {
        console.error('❌ Error:', error || `Process exited with code ${code}`);
      }
    });
  }

  // Send status check command
  checkStatus() {
    console.log('📊 Checking Clawdbot status...');
    
    const clawdbot = spawn('npx', ['clawdbot', 'status'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    clawdbot.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    clawdbot.stderr.on('data', (data) => {
      console.error('Error:', data.toString());
    });
  }
}

// Alternative: Use Agent Control Protocol (ACP)
class ClawdbotWebSocketAgent {
  constructor() {
    this.messageId = 1;
  }

  async connectViaACP() {
    console.log('🔌 Connecting via Agent Control Protocol...');
    
    // Use clawdbot acp commands to communicate
    const { spawn } = require('child_process');
    
    const processCommand = (command, args) => {
      return new Promise((resolve, reject) => {
        const proc = spawn('npx', ['clawdbot', ...args], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';

        proc.stdout.on('data', (data) => {
          output += data.toString();
        });

        proc.stderr.on('data', (data) => {
          error += data.toString();
        });

        proc.on('close', (code) => {
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(error || `Process exited with code ${code}`));
          }
        });
      });
    };

    try {
      // List agents
      const agentsList = await processCommand('list', ['agents']);
      console.log('Available agents:', agentsList);

      // Send message via ACP
      const response = await processCommand('acp', ['send', '--agent', 'main', '--message', 'Hello from ACP agent!']);
      console.log('ACP Response:', response);

    } catch (error) {
      console.error('ACP Error:', error.message);
    }
  }
}

// Main execution
if (require.main === module) {
  const agent = new ClawdbotAgent();
  
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    agent.checkStatus();
  } else if (args.includes('--acp')) {
    const acpAgent = new ClawdbotWebSocketAgent();
    acpAgent.connectViaACP();
  } else {
    agent.start();
  }
}

module.exports = { ClawdbotAgent, ClawdbotWebSocketAgent };