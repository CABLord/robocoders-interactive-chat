require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

const API_BASE_URL = 'https://api.robocoders.ai';
const ACCESS_TOKEN = process.env.ROBOCODERS_API_TOKEN;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let sessionId = null;

async function createSession() {
  try {
    const response = await axios.get(`${API_BASE_URL}/create-session`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
    });
    sessionId = response.data.sid;
    console.log('Session created:', sessionId);
  } catch (error) {
    console.error('Error creating session:', error.message);
  }
}

async function chat(prompt, agent) {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      sid: sessionId,
      prompt: prompt,
      agent: agent
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Agent response:', response.data);
  } catch (error) {
    console.error('Error chatting with agent:', error.message);
  }
}

async function getSessionCode(githubUsername) {
  try {
    const response = await axios.post(`${API_BASE_URL}/get-session-code`, {
      sid: sessionId,
      github_username: githubUsername
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Session code access:', response.data);
  } catch (error) {
    console.error('Error getting session code:', error.message);
  }
}

async function startInteractiveChat() {
  await createSession();

  const promptUser = () => {
    rl.question('Enter your prompt (or "exit" to quit): ', async (prompt) => {
      if (prompt.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      rl.question('Choose an agent (GeneralCodingAgent, RepoAgent, FrontEndAgent): ', async (agent) => {
        await chat(prompt, agent);
        promptUser();
      });
    });
  };

  promptUser();
}

startInteractiveChat();
