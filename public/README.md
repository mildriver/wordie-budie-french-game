# 🎯 Wordie Budie - French Learning Game

Interactive French sentence construction game with pronunciation feedback and progress tracking.

## 🎮 Features
- **Multiple levels**: A1 (Beginner) to C1 (Advanced)
- **Rich content**: 10,000+ French sentences across topics
- **Audio pronunciation**: French TTS with native voice selection
- **Progress tracking**: Score, streaks, and accuracy statistics
- **Random modes**: Shuffle questions for varied practice
- **Mobile responsive**: Works on all devices

## 🚀 Live Demo
Visit: [Your Netlify URL will be here]

## 📁 File Structure
```
├── index.html          # Homepage with game info
├── game.html           # Game container page
├── play-test.html      # Main game (embedded in iframe)
├── styles.css          # Game styling
├── script.js           # Game logic
├── data/               # French sentence database
│   ├── A1/            # Beginner level
│   ├── A2/            # Elementary level
│   ├── B1/            # Intermediate level
│   ├── B2/            # Upper intermediate
│   └── C1/            # Advanced level
└── manifest.json       # PWA configuration

```

## 🛠 Development
1. Clone this repository
2. Edit sentence files in `/data` folder
3. Commit and push - auto-deploys to Netlify!

## 📝 Adding New Sentences
Add sentences to appropriate JSON files in `/data/[level]/[topic].json`

## 🌍 Deployment
- **Auto-deployment**: Connected to GitHub via Netlify
- **Custom domain**: Permanent URL (no more changing links!)
- **CDN**: Global fast loading via Netlify Edge

Built with ❤️ for French language learners