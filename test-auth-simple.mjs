import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://koowfhsaqmarfdkwsfiz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb3dmaHNhcW1hcmZka3dzZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTczNDAsImV4cCI6MjA3MTA5MzM0MH0.-lbQpF21xixgkdFtjx8Slqbe0go9h5ojN8GCGYDBDHo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔧 Testing Supabase Auth...\n');
  
  // Test 1: Check if we can connect
  const { data: { session } } = await supabase.auth.getSession();
  console.log('✅ Connected to Supabase');
  console.log('Current session:', session ? 'Active' : 'None');
  
  // Test 2: Try to sign up a test user
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  console.log(`\n📝 Testing signup with: ${testEmail}`);
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Test User'
      }
    }
  });
  
  if (signupError) {
    console.error('❌ Signup failed:', signupError.message);
  } else {
    console.log('✅ Signup successful!');
    console.log('User ID:', signupData.user?.id);
    console.log('Email confirmation required:', signupData.user?.email_confirmed_at ? 'No' : 'Yes');
  }
  
  // Test 3: Try to sign in
  console.log('\n🔑 Testing login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (loginError) {
    console.error('❌ Login failed:', loginError.message);
  } else {
    console.log('✅ Login successful!');
    console.log('Session token:', loginData.session?.access_token ? 'Present' : 'Missing');
  }
  
  // Test 4: Check auth settings
  console.log('\n⚙️ Auth Configuration:');
  console.log('- Email confirmations required: Check Supabase dashboard');
  console.log('- Site URL configured: Check Supabase dashboard');
  console.log('- Redirect URLs configured: Check Supabase dashboard');
  
  console.log('\n✨ Test complete!');
}

testAuth().catch(console.error);