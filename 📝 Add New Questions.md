# 📝 How to Add New Questions/Topics

## 🎯 Quick Start

1. **To add questions to existing topics**:
   - Edit the JSON files in `data/sentences/[Level]/[topic].json`
   - Just add more sentence objects to the `sentences` array

2. **To add new topics**:
   - Create a new JSON file: `data/sentences/[Level]/[new-topic].json`
   - Add the topic to the `levelsAndTopics` object in `script.js`

## 📁 File Structure

```
data/sentences/
├── A1/
│   ├── basic.json       (300 questions)
│   ├── colors.json      (50 questions)
│   ├── family.json      (40 questions)
│   ├── greetings.json   (30 questions)
│   └── numbers.json     (35 questions)
└── A2/
    ├── daily-routine.json (20 questions)
    └── food.json         (20 questions)
```

## ➕ Adding New Questions to Existing Topics

Open any JSON file and add new sentence objects:

```json
{
  "id": "a1_basic_999",
  "english": "The cat is sleeping.",
  "correctFrench": ["Le", "chat", "dort"],
  "wordOptions": ["Le", "chat", "dort", "La", "chien", "mange", "joue", "cours"],
  "explanation": "'Le chat' (masculine). 'Dormir' = to sleep.",
  "grammar_points": ["definite_articles", "present_tense"],
  "difficulty": 1.2
}
```

## 🆕 Adding New Topics

1. **Create JSON file**: `data/sentences/A1/animals.json`
2. **Update script.js** - find `levelsAndTopics` and add:
```javascript
const levelsAndTopics = {
    'A1': ['basic', 'colors', 'family', 'greetings', 'numbers', 'animals'],
    'A2': ['daily-routine', 'food']
};
```

## 🔄 After Adding Content

Just **refresh your browser** - changes are automatic!

## 📋 JSON Template for New Topics

```json
{
  "level": "A1",
  "topic": "animals",
  "description": "Animal vocabulary and basic descriptions",
  "total_sentences": 25,
  "sentences": [
    {
      "id": "a1_animals_001",
      "english": "The dog is big.",
      "correctFrench": ["Le", "chien", "est", "grand"],
      "wordOptions": ["Le", "chien", "est", "grand", "La", "chat", "petit", "grosse"],
      "explanation": "'Le chien' (masculine). 'Grand' agrees with masculine noun.",
      "grammar_points": ["definite_articles", "adjective_agreement"],
      "difficulty": 1.1
    }
  ]
}
```

## 💡 Tips

- **Keep word options challenging** - include similar/incorrect words
- **Add good explanations** - helps learning
- **Use progressive difficulty** - 1.0 = easiest, 3.0 = hardest
- **Test your additions** - refresh browser to see changes immediately