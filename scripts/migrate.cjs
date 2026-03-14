const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://csdgfqxnqdoqfgurhkxo.supabase.co';
const supabaseKey = 'sb_publishable_7xWvQBxN7WXSAT4w_Jxm-w_l0nzo8Pc'; // This is likely the anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  try {
    const questionsPath = path.join(__dirname, '../src/questions.json');
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    console.log(`Found ${questionsData.length} questions. Starting migration...`);

    // Prepare data for insertion (Object format)
    const toInsertObj = questionsData.map(q => ({
      id: q.id,
      text: q.text || q.question,
      options: q.options,
      answer: q.answer,
      category: q.category
    }));

    // Prepare data for insertion (Array format for fallback)
    const toInsertArr = questionsData.map(q => ({
      id: q.id,
      text: q.text || q.question,
      options: Object.values(q.options),
      answer: q.answer,
      category: q.category
    }));

    console.log('Attempting upsert with Object format...');
    let result = await supabase
      .from('questions')
      .upsert(toInsertObj, { onConflict: 'id' });

    let error = result.error;

    if (error && error.message.includes('expected JSON array')) {
      console.log('Object format failed with "expected JSON array". Trying Array format...');
      result = await supabase
        .from('questions')
        .upsert(toInsertArr, { onConflict: 'id' });
      error = result.error;
    }

    if (error) {
      console.error('Migration error:', JSON.stringify(error, null, 2));
      if (error.message && error.message.includes('relation "public.questions" does not exist')) {
        console.log('\nACTION REQUIRED: Please create the "questions" table in your Supabase SQL editor:');
        console.log(`
CREATE TABLE questions (
  id INT PRIMARY KEY,
  text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  answer TEXT NOT NULL,
  category TEXT
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON questions FOR SELECT USING (true);

-- Allow admin write access (using anon key for now, ideally service role)
CREATE POLICY "Allow anon insert/update" ON questions FOR ALL USING (true);
        `);
      }
    } else {
      console.log('Migration successful!');
    }
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

migrate();
