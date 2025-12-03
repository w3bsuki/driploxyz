
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from apps/web/.env
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('Checking products country codes...');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, country_code')
    .limit(20);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products.`);
  const countryCounts = {};
  products.forEach(p => {
    const code = p.country_code || 'NULL';
    countryCounts[code] = (countryCounts[code] || 0) + 1;
    console.log(`- ${p.title}: ${code}`);
  });

  console.log('Country distribution:', countryCounts);
}

checkProducts();
