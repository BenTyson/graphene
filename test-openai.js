// OpenAI Connection Test Script
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

async function testOpenAI() {
  console.log('🧪 Testing OpenAI API Connection...\n');
  
  // Check environment variables
  console.log('✅ Environment Variables:');
  console.log(`   API Key: ${process.env.OPENAI_API_KEY ? 'Set (' + process.env.OPENAI_API_KEY.substring(0, 10) + '...)' : 'Missing'}`);
  console.log(`   Model: ${process.env.OPENAI_MODEL || 'Not set'}`);
  console.log(`   Summary Enabled: ${process.env.SUMMARY_ENABLED || 'Not set'}\n`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    return;
  }
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('📞 Testing API connection with a simple request...\n');
    
    // Test with a very simple prompt
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with exactly one word."
        },
        {
          role: "user", 
          content: "Say 'Hello'"
        }
      ],
      max_tokens: 5,
      temperature: 0
    });
    
    console.log('✅ API Connection Successful!');
    console.log('📊 Response Details:');
    console.log(`   Model Used: ${completion.model}`);
    console.log(`   Response: "${completion.choices[0].message.content}"`);
    console.log(`   Input Tokens: ${completion.usage.prompt_tokens}`);
    console.log(`   Output Tokens: ${completion.usage.completion_tokens}`);
    console.log(`   Total Tokens: ${completion.usage.total_tokens}`);
    
    // Calculate cost
    const inputCost = completion.usage.prompt_tokens * 0.00015 / 1000000;
    const outputCost = completion.usage.completion_tokens * 0.0006 / 1000000;
    const totalCost = inputCost + outputCost;
    
    console.log(`   Estimated Cost: $${totalCost.toFixed(8)}\n`);
    
    console.log('🎉 OpenAI setup is working correctly!');
    console.log('You can now generate article summaries.');
    
  } catch (error) {
    console.error('❌ OpenAI API Error:');
    console.error(`   Error Code: ${error.status || 'Unknown'}`);
    console.error(`   Error Type: ${error.type || 'Unknown'}`);
    console.error(`   Error Message: ${error.message}`);
    
    if (error.status === 401) {
      console.error('\n💡 This looks like an authentication error.');
      console.error('   Check that your API key is correct and active.');
    } else if (error.status === 429) {
      console.error('\n💡 Rate limit or quota exceeded.');
      console.error('   Check your usage at: https://platform.openai.com/usage');
    } else if (error.status === 403) {
      console.error('\n💡 Forbidden - your API key may not have access to this model.');
    }
  }
}

testOpenAI().catch(console.error);