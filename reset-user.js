import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://koowfhsaqmarfdkwsfiz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb3dmaHNhcW1hcmZka3dzZml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxNzM0MCwiZXhwIjoyMDcxMDkzMzQwfQ.jNkekv2YVIijYS-NJd1wbhbriqkgxm3On9VfIImxSXc'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetUserPassword() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    '2a21c7f5-7149-4607-8b46-cb454e2fbfb1', // User ID for w3bsuki@gmail.com
    { password: 'newpassword123' }
  )
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Password reset successfully for w3bsuki@gmail.com')
    console.log('New password: newpassword123')
  }
}

resetUserPassword()