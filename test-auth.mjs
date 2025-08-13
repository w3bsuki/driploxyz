import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwfuagrlrutfateekaro.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13ZnVhZ3JscnV0ZmF0ZWVrYXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzcyMjksImV4cCI6MjA3MDYxMzIyOX0.X9Fx2hVB27q6Yza9LXexPoY6IGg32BHkjb0IoV0ea4E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test signup
async function testAuth() {
  console.log('Testing Supabase connection...');
  
  // Test connection by fetching categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .limit(5);
    
  if (catError) {
    console.error('Error fetching categories:', catError);
  } else {
    console.log(`✓ Connected! Found ${categories.length} categories`);
  }
  
  // Test signup
  const email = `test${Date.now()}@example.com`;
  const password = 'TestPass123!';
  
  console.log('\nTesting signup with:', email);
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: `testuser${Date.now()}`,
        full_name: 'Test User'
      }
    }
  });
  
  if (signupError) {
    console.error('Signup error:', signupError);
  } else {
    console.log('✓ Signup successful!', signupData.user?.id);
  }
  
  // Test login
  console.log('\nTesting login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (loginError) {
    console.error('Login error:', loginError);
  } else {
    console.log('✓ Login successful!', loginData.user?.email);
  }
  
  // Check if profile was created
  if (loginData?.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();
      
    if (profileError) {
      console.error('Profile fetch error:', profileError);
    } else {
      console.log('✓ Profile found:', profile.username);
    }
  }
}

testAuth().catch(console.error);