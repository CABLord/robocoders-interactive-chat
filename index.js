require('dotenv').config();
const axios = require('axios');
const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

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
    await mirrorAgentActions(response.data);
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
    await cloneRepository(response.data.repo_url);
  } catch (error) {
    console.error('Error getting session code:', error.message);
  }
}

async function mirrorAgentActions(agentResponse) {
  // This function will interpret the agent's response and perform local actions
  // For demonstration, we'll assume the agent's response includes file operations
  if (agentResponse.files) {
    for (const file of agentResponse.files) {
      await createOrUpdateFile(file.path, file.content);
    }
  }
}

async function createOrUpdateFile(filePath, content) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
    console.log(`File created/updated: ${filePath}`);
  } catch (error) {
    console.error(`Error creating/updating file ${filePath}:, error.message`);
  }
}

async function cloneRepository(repoUrl) {
  // This function would clone the repository locally
  // For demonstration, we'll just log the action
  console.log(`Cloning repository: ${repoUrl}`);
  // In a real implementation, you'd use a library like simple-git to clone the repo
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
