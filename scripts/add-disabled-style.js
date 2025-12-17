const fs = require('fs');
const path = 'src/app/[stationId]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldStyle = `  optionItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    textAlign: 'right',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderBottom: '1px solid #334155',
  },
  // Modal styles`;

const newStyle = `  optionItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    textAlign: 'right',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderBottom: '1px solid #334155',
  },
  optionItemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // Modal styles`;

if (content.includes(oldStyle)) {
  content = content.replace(oldStyle, newStyle);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS - Added disabled style');
} else {
  console.log('ERROR - Could not find style to replace');
}
