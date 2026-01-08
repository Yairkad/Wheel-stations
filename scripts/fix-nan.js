const fs = require('fs');
const path = require('path');

for (let i = 1; i <= 10; i++) {
  const file = path.join(__dirname, `upsert_part_${i}.sql`);
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(', NaN,')) {
      content = content.replace(/, NaN,/g, ', NULL,');
      fs.writeFileSync(file, content);
      console.log(`Fixed NaN in upsert_part_${i}.sql`);
    }
  }
}
console.log('Done!');
