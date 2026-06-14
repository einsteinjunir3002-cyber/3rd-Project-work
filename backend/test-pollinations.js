const axios = require('axios');

async function testPost() {
  try {
    console.log('Testing POST...');
    const response = await axios.post('https://text.pollinations.ai/', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'hello' }
      ],
      model: 'openai'
    }, { timeout: 10000 });
    console.log('POST Success:', response.status, response.data);
  } catch (err) {
    console.error('POST Error:', err.message);
  }
}

async function testGet() {
  try {
    console.log('Testing GET...');
    const response = await axios.get('https://text.pollinations.ai/hello?system=You are a helpful assistant&model=openai', { timeout: 10000 });
    console.log('GET Success:', response.status, response.data);
  } catch (err) {
    console.error('GET Error:', err.message);
  }
}

async function run() {
  await testPost();
  await testGet();
}

run();
