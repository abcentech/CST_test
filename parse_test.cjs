const fs = require('fs');
const text = fs.readFileSync('TEST.md', 'utf8');

const qSection = text.split('### **Answer Key**')[0];
const aSection = text.split('### **Answer Key**')[1];

const lines = qSection.split('\n');
const questions = [];
let currentQ = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line || line.startsWith('#')) continue;
  
  const qMatch = line.match(/^(\d+)\.\s+(.*)$/);
  if (qMatch) {
    if (currentQ) questions.push(currentQ);
    currentQ = {
      id: parseInt(qMatch[1]),
      text: qMatch[2],
      options: {}
    };
  } else if (currentQ) {
    const optMatch = line.match(/^\|?([A-C])\)\s+(.*)$/);
    if (optMatch) {
      currentQ.options[optMatch[1]] = optMatch[2];
    } else {
        if (Object.keys(currentQ.options).length === 0) {
            currentQ.text += ' ' + line;
        }
    }
  }
}
if (currentQ) questions.push(currentQ);

const aLines = aSection.split('\n');
const answers = {};
for(const line of aLines) {
  if (line.includes('|')) {
    const parts = line.split('|').map(s => s.trim()).filter(Boolean);
    if (parts[0] !== 'Question' && !parts[0].includes(':---')) {
        for(let j=0; j<parts.length; j+=2) {
            if (parts[j] && parts[j+1]) {
                const qNum = parseInt(parts[j]);
                if (!isNaN(qNum)) {
                    answers[qNum] = parts[j+1].replace(/[^A-C]/g, '');
                }
            }
        }
    }
  }
}

questions.forEach(q => {
  q.answer = answers[q.id];
});

fs.writeFileSync('src/questions.json', JSON.stringify(questions, null, 2));
console.log('Parsed successfully! Found ' + questions.length + ' questions.');
