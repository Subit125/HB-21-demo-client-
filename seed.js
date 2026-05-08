import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lvyfneczskorkrrbasnk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eWZuZWN6c2tvcmtycmJhc25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjE1NjYsImV4cCI6MjA5MDUzNzU2Nn0.8nSO2MBjVVsD0dUIvsHjoz8pfBDWFELy5MOGc_hVRLc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('Seeding initial data...');
  
  // Seed Profile
  const { data: profile, error: pError } = await supabase.from('profiles').upsert([
    { id: '00000000-0000-0000-0000-000000000001', name: 'Alex Reeves', team_name: 'Iron Wolves', points: 230 }
  ]).select().single();
  if (pError) console.error('Profile Seed Error:', pError);

  // Seed Tasks
  const { error: tError } = await supabase.from('tasks').upsert([
    { title: 'Morning Workout', points: 15, proof_type: 'video', week: 2, day: 12 },
    { title: 'Meal Prep Snap', points: 10, proof_type: 'photo', week: 2, day: 12 },
    { title: 'Evening Reflection', points: 20, proof_type: 'text', week: 2, day: 12 }
  ]);
  if (tError) console.error('Task Seed Error:', tError);

  // Seed Flashcards
  const { error: fError } = await supabase.from('flashcards').upsert([
    { text: 'Morning Intensity: Iron Wolves leading the pack!', type: 'achievement' },
    { text: 'New protocol expansion coming this weekend.', type: 'announcement' }
  ]);
  if (fError) console.error('Flashcard Seed Error:', fError);

  console.log('Seeding complete.');
}

seed();
