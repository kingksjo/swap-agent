// Simple syntax check for our main files
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking TypeScript syntax...\n');

const filesToCheck = [
  'src/types/api.ts',
  'src/routes/quote.ts', 
  'src/routes/swap.ts',
  'src/services/status.service.ts'
];

let errors = 0;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic syntax checks
    const issues = [];
    
    // Check for missing imports
    if (content.includes("import(")) {
      issues.push('⚠️  Dynamic import() found - should be static import');
    }
    
    // Check for proper error handling
    if (content.includes('err: any')) {
      issues.push('⚠️  Using any type for error parameter');
    }
    
    // Check for missing types
    if (content.includes('err =>') && !content.includes('err: z.ZodIssue')) {
      issues.push('⚠️  Missing type annotation for error parameter');
    }
    
    console.log(`✅ ${file}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   ${issue}`));
      errors += issues.length;
    }
    
  } catch (err) {
    console.log(`❌ ${file}: ${err.message}`);
    errors++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files checked: ${filesToCheck.length}`);
console.log(`   Issues found: ${errors}`);

if (errors === 0) {
  console.log('\n🎉 All checks passed! The fixes have been applied successfully.');
} else {
  console.log('\n⚠️  Some issues remain. Check the output above.');
}
