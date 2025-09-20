class FrenchLearningGame {
    constructor() {
        this.currentLevel = 'A1';
        this.currentTopic = '';
        this.allSentences = [];
        this.currentSentences = [];
        this.currentSentenceIndex = 0;
        this.currentSentence = null;
        this.selectedWords = [];
        this.availableWords = [];
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.correctCount = 0;
        this.totalCount = 0;
        this.usedSentences = [];
        this.wrongAnswers = [];
        this.sentenceCount = 0;
        this.hintUsed = false;
        this.isComplete = false;
        this.isCorrect = null;
        this.showExplanation = false;

        // Timer functionality
        this.timerDuration = 0; // Default: off
        this.timeLeft = 0;
        this.timerActive = false;
        this.timerEnabled = false;
        this.timerInterval = null;

        // Loading state
        this.loading = true;
        this.loadingError = null;

        // Progress persistence
        this.storageKey = 'frenchLearningProgress';

        // API integration for Wix website
        this.apiConfig = {
            baseUrl: this.getApiBaseUrl(),
            enabled: this.isApiEnabled()
        };

        // User management for premium features
        this.user = {
            isAuthenticated: false,
            isPremium: false,
            subscriptionType: 'free',
            userId: null
        };

        // Audio functionality
        this.speechSynthesis = window.speechSynthesis;
        this.frenchVoice = null;

        // Spaced repetition
        this.reviewQueue = [];

        // Random mode functionality
        this.isRandomMode = false;
        this.randomLevels = [];
        this.randomSentences = [];

        this.init();
    }

    async init() {
        this.sessionStartTime = Date.now();

        // Try to authenticate with Wix if in iframe
        await this.authenticateWithWix();

        this.loadProgress();
        this.bindEvents();
        this.setupKeyboardShortcuts();
        await this.loadAllSentences();
        await this.initializeAudio();
        this.loadTopicsForLevel(this.currentLevel);
        this.showVersionInfo();
    }

    // Enhanced JSON loading from multiple files
    async loadAllSentences() {
        this.loading = true;
        this.loadingError = null;
        this.showLoadingState();

        console.log('🎯 Wordie Budie v2.0.0 - Enhanced Features Loading...');
        console.log('Starting to load sentences...');
        console.log('Current URL:', window.location.href);

        // Check if running from file:// protocol
        if (window.location.protocol === 'file:') {
            console.error('App is running from file:// protocol. Fetch API requires HTTP server.');
            this.showErrorToast('Please run this app from a web server, not as a local file!');
            this.allSentences = this.getFallbackSentences();
            this.loading = false;
            this.hideLoadingState();
            return;
        }

        try {
            const sentences = [];
            
            // Define available levels and topics (only include files with content)
            const levelsAndTopics = {
                'A1': ['basic', 'colors', 'family', 'greetings', 'numbers'],
                'A2': ['daily-routine', 'food']
            };

            // Load sentences from each level/topic combination
            for (const [level, topics] of Object.entries(levelsAndTopics)) {
                for (const topic of topics) {
                    try {
                        console.log(`Loading ${level}/${topic}.json...`);
                        const response = await fetch(`data/sentences/${level}/${topic}.json`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.sentences && Array.isArray(data.sentences) && data.sentences.length > 0) {
                                // Add level info to each sentence if not present
                                data.sentences.forEach(sentence => {
                                    if (!sentence.level) {
                                        sentence.level = level;
                                    }
                                    if (!sentence.topic) {
                                        sentence.topic = topic;
                                    }
                                });
                                sentences.push(...data.sentences);
                                console.log(`Loaded ${data.sentences.length} sentences from ${level}/${topic}`);
                            } else {
                                console.warn(`${level}/${topic}.json has no sentences`);
                            }
                        } else {
                            console.warn(`Failed to fetch ${level}/${topic}.json: ${response.status}`);
                        }
                    } catch (error) {
                        console.warn(`Could not load ${level}/${topic}.json:`, error);
                    }
                }
            }

            console.log(`Total sentences collected: ${sentences.length}`);

            if (sentences.length === 0) {
                console.error('No sentences were loaded! Falling back to hardcoded sentences.');
                this.loadingError = 'No sentences could be loaded from JSON files.';
                this.allSentences = this.getFallbackSentences();
                this.showErrorToast('Failed to load questions. Using 2 sample questions only.');
            } else {
                this.allSentences = sentences;
                console.log(`Successfully loaded ${sentences.length} sentences from JSON files`);
                this.showSuccessToast(`Loaded ${sentences.length} questions successfully!`);
            }

        } catch (error) {
            console.error('Error loading sentences:', error);
            this.loadingError = 'Failed to load sentences. Using fallback data.';
            this.allSentences = this.getFallbackSentences();
            this.showErrorToast('Unable to load some content. App will work with limited data.');
        } finally {
            this.loading = false;
            this.hideLoadingState();
        }
    }

    getFallbackSentences() {
        return [
            {
                id: "fallback_001",
                english: "I am happy.",
                correctFrench: ["Je", "suis", "heureux"],
                wordOptions: ["Je", "suis", "heureux", "Tu", "es", "heureuse", "Il", "est", "triste"],
                explanation: "Basic être conjugation: je suis. 'Heureux' (masculine) / 'heureuse' (feminine).",
                level: "A1",
                topic: "basic"
            },
            {
                id: "fallback_002",
                english: "She has a red car.",
                correctFrench: ["Elle", "a", "une", "voiture", "rouge"],
                wordOptions: ["Elle", "a", "une", "voiture", "rouge", "Il", "ai", "un", "auto", "bleu"],
                explanation: "Avoir conjugation: elle a. 'Une voiture' (feminine). Colors follow nouns.",
                level: "A1",
                topic: "basic"
            }
        ];
    }

    showLoadingState() {
        document.getElementById('english-text').innerHTML = `
            <div style="text-align: center;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px;"></div>
                <p>Loading French sentences...</p>
                <p style="font-size: 0.9em; color: #666;">Loading from JSON files</p>
            </div>
        `;
        
        // Add CSS for spinner animation if not already present
        if (!document.getElementById('spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideLoadingState() {
        if (this.allSentences.length > 0) {
            document.getElementById('english-text').textContent = 'Select a level and topic to start!';
        }
    }

    bindEvents() {
        // Level selector
        document.getElementById('level').addEventListener('change', (e) => {
            this.currentLevel = e.target.value;
            this.handleLevelChange();
        });

        // Topic selector
        document.getElementById('topic').addEventListener('change', (e) => {
            this.currentTopic = e.target.value;
            if (this.currentTopic) {
                this.loadSentencesForTopic();
            }
        });

        // Timer duration selector
        document.getElementById('timer-duration').addEventListener('change', (e) => {
            this.timerDuration = parseInt(e.target.value);
            this.timerEnabled = this.timerDuration > 0;
            if (!this.timerEnabled) {
                this.stopTimer();
            }
            this.saveProgress();
        });

        // Game controls
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearAnswer();
        });

        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkAnswer();
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.getNewSentence();
        });

        document.getElementById('replay-btn').addEventListener('click', () => {
            this.replayAudio();
        });

        // Add timer toggle button
        this.addTimerControls();
    }

    addTimerControls() {
        const gameControls = document.querySelector('.game-controls');
        const timerBtn = document.createElement('button');
        timerBtn.id = 'timer-btn';
        timerBtn.className = 'btn btn-hint';
        timerBtn.innerHTML = '⏱️ Timer: OFF';
        timerBtn.addEventListener('click', () => this.toggleTimer());
        gameControls.insertBefore(timerBtn, gameControls.firstChild);

        // Add timer display
        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'timer-display';
        timerDisplay.className = 'timer-display';
        timerDisplay.innerHTML = `
            <div class="timer-bar-container">
                <div class="timer-label">Time: <span id="timer-seconds">10</span>s</div>
                <div class="timer-bar">
                    <div id="timer-progress" class="timer-progress"></div>
                </div>
            </div>
        `;
        document.querySelector('.score-board').appendChild(timerDisplay);

        // Add timer CSS
        const timerStyle = document.createElement('style');
        timerStyle.textContent = `
            .timer-display {
                text-align: center;
                margin-top: 10px;
            }
            .timer-bar-container {
                width: 100%;
            }
            .timer-label {
                font-size: 14px;
                margin-bottom: 5px;
            }
            .timer-bar {
                width: 100%;
                height: 8px;
                background: rgba(255,255,255,0.3);
                border-radius: 4px;
                overflow: hidden;
            }
            .timer-progress {
                height: 100%;
                background: linear-gradient(90deg, #48bb78, #38a169);
                transition: width 0.3s ease;
                border-radius: 4px;
            }
            .timer-progress.warning {
                background: linear-gradient(90deg, #ed8936, #dd6b20);
            }
            .timer-progress.danger {
                background: linear-gradient(90deg, #e53e3e, #c53030);
            }
        `;
        document.head.appendChild(timerStyle);
    }

    toggleTimer() {
        this.timerEnabled = !this.timerEnabled;
        const timerBtn = document.getElementById('timer-btn');
        timerBtn.innerHTML = this.timerEnabled ? '⏱️ Timer: ON' : '⏱️ Timer: OFF';
        
        if (!this.timerEnabled) {
            this.stopTimer();
        } else if (this.currentSentence && !this.isComplete) {
            this.startTimer();
        }
        
        this.updateTimerDisplay();
    }

    startTimer() {
        if (!this.timerEnabled) return;
        
        this.timeLeft = 10;
        this.timerActive = true;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimeOut();
            }
        }, 1000);
    }

    stopTimer() {
        this.timerActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const timerSeconds = document.getElementById('timer-seconds');
        const timerProgress = document.getElementById('timer-progress');
        const timerDisplay = document.getElementById('timer-display');
        
        if (!timerSeconds || !timerProgress) return;
        
        if (!this.timerEnabled) {
            timerDisplay.style.display = 'none';
            return;
        }
        
        timerDisplay.style.display = 'block';
        timerSeconds.textContent = this.timeLeft;
        
        const percentage = Math.max(0, (this.timeLeft / 10) * 100);
        timerProgress.style.width = `${percentage}%`;
        
        // Change color based on time left
        timerProgress.className = 'timer-progress';
        if (this.timeLeft <= 3) {
            timerProgress.classList.add('danger');
        } else if (this.timeLeft <= 6) {
            timerProgress.classList.add('warning');
        }
    }

    handleTimeOut() {
        this.stopTimer();
        this.isComplete = true;
        this.isCorrect = false;
        this.totalCount++;
        this.streak = 0;
        
        // Add to wrong answers for review
        this.wrongAnswers.push(this.currentSentence);
        
        this.showFeedback("⏰ Time's up! Don't worry, practice makes perfect.", 'incorrect');
        document.getElementById('explanation').textContent = `Correct answer: ${this.currentSentence.correctFrench.join(' ')}. ${this.currentSentence.explanation}`;
        
        this.updateStats();
        this.showNextButton();
    }

    async loadTopicsForLevel(level) {
        if (this.allSentences.length === 0) return;

        const topics = [...new Set(
            this.allSentences
                .filter(s => s.level === level)
                .map(s => s.topic)
        )].sort();

        const topicSelect = document.getElementById('topic');
        topicSelect.innerHTML = '<option value="">Choose a topic...</option>';

        // Topic descriptions
        const topicDescriptions = {
            'basic': 'Essential être/avoir verbs and simple adjectives',
            'colors': 'Color vocabulary and descriptions',
            'family': 'Family members and relationships',
            'greetings': 'Common greetings and polite expressions',
            'numbers': 'Numbers, counting, and quantities',
            'daily-routine': 'Daily activities and time expressions',
            'food': 'Food vocabulary, meals, and preferences',
            'hobbies': 'Leisure activities and interests',
            'transportation': 'Travel and transportation methods',
            'work': 'Jobs, professions, and workplace vocabulary',
            'conditionals': 'If/then statements and hypothetical situations',
            'future': 'Future tense and upcoming events',
            'opinions': 'Expressing opinions and preferences',
            'past-tense': 'Past actions and experiences',
            'travel': 'Travel vocabulary and experiences',
            'abstract': 'Abstract concepts and ideas',
            'business': 'Professional and business contexts',
            'complex': 'Complex sentence structures',
            'literature': 'Literary vocabulary and expressions',
            'subjunctive': 'Subjunctive mood and expressions',
            'academic': 'Academic and formal writing',
            'advanced': 'Advanced grammar and vocabulary',
            'formal': 'Formal register and expressions',
            'philosophy': 'Philosophical concepts and discussions'
        };

        topics.forEach(topic => {
            const sentenceCount = this.allSentences.filter(s => s.level === level && s.topic === topic).length;
            const option = document.createElement('option');
            option.value = topic;

            const topicName = topic.charAt(0).toUpperCase() + topic.slice(1).replace('-', ' ');
            const description = topicDescriptions[topic] || 'Practice sentences';

            option.textContent = `${topicName} (${sentenceCount} questions) - ${description}`;
            topicSelect.appendChild(option);
        });
    }

    loadSentencesForTopic() {
        this.currentSentences = this.allSentences.filter(s => 
            s.level === this.currentLevel && s.topic === this.currentTopic
        );
        
        if (this.currentSentences.length === 0) {
            this.showFeedback('No sentences found for this topic.', 'incorrect');
            return;
        }
        
        this.shuffleArray(this.currentSentences);
        this.currentSentenceIndex = 0;
        this.usedSentences = [];
        this.wrongAnswers = [];
        this.sentenceCount = 0;
        this.getNewSentence();
        this.updateProgress();
    }

    getNewSentence() {
        if (this.allSentences.length === 0) return;

        // Check if we should serve a wrong answer for review (every 5th sentence)
        if (this.wrongAnswers.length > 0 && this.sentenceCount > 0 && this.sentenceCount % 5 === 0) {
            const wrongSentence = this.wrongAnswers.shift();
            this.currentSentence = wrongSentence;
            this.sentenceCount++;
            this.resetGame(wrongSentence);
            this.showFeedback('📝 Review time! This sentence needs practice.', 'hint');
            return;
        }

        // Get available sentences (not recently used)
        let availableSentences = this.currentSentences.filter(s => 
            !this.usedSentences.some(used => used.id === s.id)
        );
        
        // If all sentences used, reset the used list
        if (availableSentences.length === 0) {
            this.usedSentences = [];
            availableSentences = this.currentSentences;
        }
        
        if (availableSentences.length === 0) {
            this.showCompletionMessage();
            return;
        }
        
        const randomSentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
        this.currentSentence = randomSentence;
        this.usedSentences.push(randomSentence);
        
        // Keep only last 10 used sentences
        if (this.usedSentences.length > 10) {
            this.usedSentences = this.usedSentences.slice(-10);
        }
        
        this.sentenceCount++;
        this.resetGame(randomSentence);
        this.updateProgress();
    }

    resetGame(sentence = this.currentSentence) {
        if (!sentence) return;
        
        this.selectedWords = [];
        this.availableWords = [...sentence.wordOptions];
        this.shuffleArray(this.availableWords);
        this.isComplete = false;
        this.isCorrect = null;
        this.showExplanation = false;
        this.hintUsed = false;

        // Update UI
        document.getElementById('english-text').textContent = sentence.english;
        this.clearAnswer();
        this.createWordBank();
        this.clearFeedback();
        
        // Reset buttons
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('check-btn').style.display = 'inline-block';
        document.getElementById('hint-btn').style.display = 'inline-block';
        
        // Start timer if enabled
        if (this.timerEnabled) {
            this.startTimer();
        }
    }

    createWordBank() {
        const wordBank = document.getElementById('word-bank');
        wordBank.innerHTML = '';

        this.availableWords.forEach((word, index) => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-option';
            wordElement.textContent = word;
            wordElement.setAttribute('role', 'button');
            wordElement.setAttribute('tabindex', '0');
            wordElement.setAttribute('aria-label', `Select word: ${word}`);

            const clickHandler = () => this.selectWord(word, index);
            wordElement.addEventListener('click', clickHandler);
            wordElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clickHandler();
                }
            });

            wordBank.appendChild(wordElement);
        });
    }

    selectWord(word, index) {
        if (this.isComplete || (this.timerEnabled && !this.timerActive)) return;

        this.selectedWords.push(word);
        this.availableWords.splice(index, 1);
        this.updateAnswerArea();
        this.createWordBank();
    }

    updateAnswerArea() {
        const answerArea = document.getElementById('answer-area');
        answerArea.innerHTML = '';

        if (this.selectedWords.length === 0) {
            answerArea.innerHTML = '<span style="color: #999; font-style: italic;">Click words below to build your sentence...</span>';
            return;
        }

        this.selectedWords.forEach((word, index) => {
            const wordElement = document.createElement('div');
            wordElement.className = 'selected-word';
            wordElement.textContent = word;
            wordElement.addEventListener('click', () => this.removeWord(index));
            answerArea.appendChild(wordElement);
        });
    }

    removeWord(index) {
        if (this.isComplete || (this.timerEnabled && !this.timerActive)) return;

        const removedWord = this.selectedWords.splice(index, 1)[0];
        this.availableWords.push(removedWord);
        this.shuffleArray(this.availableWords);
        this.updateAnswerArea();
        this.createWordBank();
    }

    clearAnswer() {
        if (!this.currentSentence) return;
        
        this.selectedWords = [];
        this.availableWords = [...this.currentSentence.wordOptions];
        this.shuffleArray(this.availableWords);
        this.updateAnswerArea();
        this.createWordBank();
    }

    checkAnswer() {
        if (!this.currentSentence || this.isComplete) return;
        if (this.selectedWords.length === 0) {
            this.showFeedback('Please select some words first!', 'incorrect');
            return;
        }

        this.stopTimer();
        const correct = this.arraysEqual(this.selectedWords, this.currentSentence.correctFrench);
        this.isCorrect = correct;
        this.isComplete = true;
        this.showExplanation = true;
        this.totalCount++;

        if (correct) {
            this.correctCount++;
            this.streak++;
            this.bestStreak = Math.max(this.bestStreak, this.streak);
            
            // Calculate score with bonuses
            const baseScore = 10;
            const streakBonus = this.streak * 2;
            const difficultyBonus = Math.floor((this.currentSentence.difficulty || 1.0) * 5);
            const hintPenalty = this.hintUsed ? -3 : 0;
            const timerBonus = this.timerEnabled && this.timeLeft > 5 ? 5 : 0;
            const points = Math.max(baseScore + streakBonus + difficultyBonus + hintPenalty + timerBonus, 1);
            
            this.score += points;
            
            this.showFeedback('🎉 Correct! Excellent work!', 'correct');
        } else {
            this.streak = 0;
            this.wrongAnswers.push(this.currentSentence);
            this.addToReviewQueue(this.currentSentence);
            this.showFeedback(`❌ Incorrect. The correct answer is: ${this.currentSentence.correctFrench.join(' ')}`, 'incorrect');
        }

        // Show explanation
        document.getElementById('explanation').textContent = this.currentSentence.explanation;
        if (!correct) {
            document.getElementById('explanation').textContent += ' 📝 This sentence will return for review practice.';
        }

        // Auto-pronounce correct answer
        if (this.currentSentence && this.currentSentence.correctFrench) {
            setTimeout(() => {
                this.pronounceFrench(this.currentSentence.correctFrench.join(' '));
            }, 1000);
        }

        this.updateStats();
        this.saveProgress();
        this.showNextButton();
    }

    showHint() {
        if (this.hintUsed || this.isComplete) return;
        
        this.hintUsed = true;
        const correctWords = this.currentSentence.correctFrench;
        
        if (correctWords.length > 0) {
            const nextCorrectWord = correctWords[this.selectedWords.length] || correctWords[0];
            
            // Highlight the next correct word
            const wordOptions = document.querySelectorAll('.word-option');
            wordOptions.forEach(option => {
                if (option.textContent === nextCorrectWord) {
                    option.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
                    option.style.color = '#744210';
                    option.style.transform = 'scale(1.05)';
                    option.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.6)';
                    
                    setTimeout(() => {
                        option.style.background = '';
                        option.style.color = '';
                        option.style.transform = '';
                        option.style.boxShadow = '';
                    }, 3000);
                }
            });
        }
        
        this.showFeedback(`💡 Hint: Look for "${correctWords[this.selectedWords.length] || correctWords[0]}"`, 'hint');
    }

    showNextButton() {
        document.getElementById('check-btn').style.display = 'none';
        document.getElementById('hint-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'inline-block';
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = message;
        feedback.className = `feedback ${type}`;
        feedback.style.display = 'block';
        
        // Add hint class styling if needed
        if (type === 'hint') {
            feedback.style.background = 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)';
            feedback.style.color = '#856404';
            feedback.style.border = '2px solid #ffc107';
        }
    }

    clearFeedback() {
        const feedback = document.getElementById('feedback');
        const explanation = document.getElementById('explanation');
        feedback.style.display = 'none';
        explanation.textContent = '';
    }

    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('correct-count').textContent = this.correctCount;
        document.getElementById('total-count').textContent = this.totalCount;
        document.getElementById('best-streak').textContent = this.bestStreak;
        
        const accuracy = this.totalCount > 0 ? Math.round((this.correctCount / this.totalCount) * 100) : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }

    updateProgress() {
        if (this.currentSentences.length === 0) {
            document.getElementById('progress').textContent = '0/0';
            return;
        }
        
        const completed = this.usedSentences.length;
        const total = this.currentSentences.length;
        document.getElementById('progress').textContent = `${completed}/${total}`;
    }

    showCompletionMessage() {
        const accuracy = this.totalCount > 0 ? Math.round((this.correctCount / this.totalCount) * 100) : 0;
        const reviewCount = this.wrongAnswers.length;
        
        let message = `🎉 Congratulations! You've completed all sentences in this topic!<br><br>`;
        message += `<strong>Final Stats:</strong><br>`;
        message += `• Score: ${this.score}<br>`;
        message += `• Accuracy: ${accuracy}%<br>`;
        message += `• Best Streak: ${this.bestStreak}<br>`;
        if (reviewCount > 0) {
            message += `• Sentences for Review: ${reviewCount}<br>`;
        }
        message += `<br>Choose another topic to continue learning!`;
        
        document.getElementById('english-text').innerHTML = message;
        document.getElementById('word-bank').innerHTML = '';
        document.getElementById('answer-area').innerHTML = '';
        document.getElementById('check-btn').style.display = 'none';
        document.getElementById('hint-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
        this.clearFeedback();
        this.stopTimer();
    }

    resetGameSession() {
        this.currentSentences = [];
        this.currentSentenceIndex = 0;
        this.currentSentence = null;
        this.selectedWords = [];
        this.availableWords = [];
        this.score = 0;
        this.streak = 0;
        this.correctCount = 0;
        this.totalCount = 0;
        this.usedSentences = [];
        this.wrongAnswers = [];
        this.sentenceCount = 0;
        this.isComplete = false;
        this.isCorrect = null;
        
        this.stopTimer();
        
        document.getElementById('english-text').textContent = 'Select a level and topic to start!';
        document.getElementById('word-bank').innerHTML = '';
        document.getElementById('answer-area').innerHTML = '';
        this.clearFeedback();
        this.updateStats();
        this.updateProgress();
        
        document.getElementById('check-btn').style.display = 'inline-block';
        document.getElementById('hint-btn').style.display = 'inline-block';
        document.getElementById('next-btn').style.display = 'none';
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const progress = JSON.parse(saved);
                this.score = progress.score || 0;
                this.bestStreak = progress.bestStreak || 0;
                this.correctCount = progress.correctCount || 0;
                this.totalCount = progress.totalCount || 0;
                this.currentLevel = progress.currentLevel || 'A1';
                this.currentTopic = progress.currentTopic || '';
                this.reviewQueue = progress.reviewQueue || [];
                this.wrongAnswers = progress.wrongAnswers || [];
                this.timerDuration = progress.timerDuration || 0;
                this.timerEnabled = this.timerDuration > 0;

                // Update UI to reflect loaded settings
                if (document.getElementById('timer-duration')) {
                    document.getElementById('timer-duration').value = this.timerDuration;
                }
                if (document.getElementById('level')) {
                    document.getElementById('level').value = this.currentLevel;
                }
            }
        } catch (error) {
            console.warn('Failed to load progress:', error);
            this.showErrorToast('Unable to restore previous progress. Starting fresh.');
        }
    }

    saveProgress() {
        try {
            const progress = {
                score: this.score,
                bestStreak: this.bestStreak,
                correctCount: this.correctCount,
                totalCount: this.totalCount,
                currentLevel: this.currentLevel,
                currentTopic: this.currentTopic,
                reviewQueue: this.reviewQueue,
                wrongAnswers: this.wrongAnswers,
                timerDuration: this.timerDuration,
                lastPlayed: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(progress));

            // Also sync to Wix if authenticated
            this.syncProgressToWix();
        } catch (error) {
            console.warn('Failed to save progress:', error);
            this.showErrorToast('Unable to save progress. Data may be lost.');
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (this.loading) return;

            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    if (document.getElementById('check-btn').style.display !== 'none') {
                        this.checkAnswer();
                    } else if (document.getElementById('next-btn').style.display !== 'none') {
                        this.nextQuestion();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.clearAnswer();
                    break;
                case 'h':
                case 'H':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.showHint();
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.resetGameSession();
                    }
                    break;
                case 'p':
                case 'P':
                    if (e.ctrlKey && this.currentSentence) {
                        e.preventDefault();
                        this.pronounceFrench(this.currentSentence.correctFrench.join(' '));
                    }
                    break;
            }
        });

        this.showKeyboardHelp();
    }

    showKeyboardHelp() {
        const helpText = `
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.9em;">
                <strong>Keyboard shortcuts:</strong><br>
                • Enter: Check answer / Next question<br>
                • Escape: Clear answer<br>
                • Ctrl+H: Show hint<br>
                • Ctrl+R: Reset session<br>
                • Ctrl+P: Pronounce French
            </div>
        `;

        const statsPanel = document.querySelector('.stats-panel');
        if (statsPanel && !document.getElementById('keyboard-help')) {
            const helpDiv = document.createElement('div');
            helpDiv.id = 'keyboard-help';
            helpDiv.innerHTML = helpText;
            statsPanel.appendChild(helpDiv);
        }
    }

    async initializeAudio() {
        if (this.speechSynthesis) {
            const voices = await new Promise(resolve => {
                const getVoices = () => {
                    const voices = this.speechSynthesis.getVoices();
                    if (voices.length > 0) {
                        resolve(voices);
                    } else {
                        setTimeout(getVoices, 100);
                    }
                };
                getVoices();
            });

            this.frenchVoice = voices.find(voice =>
                voice.lang.includes('fr') || voice.name.includes('French')
            ) || voices[0];
        }
    }

    pronounceFrench(text) {
        if (this.speechSynthesis && this.frenchVoice) {
            this.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.frenchVoice;
            utterance.rate = 0.8;
            utterance.pitch = 1;
            this.speechSynthesis.speak(utterance);
        }
    }

    addToReviewQueue(sentence) {
        const existing = this.reviewQueue.find(item => item.id === sentence.id);
        if (existing) {
            existing.mistakes += 1;
            existing.lastSeen = Date.now();
            existing.nextReview = Date.now() + (existing.mistakes * 3600000);
        } else {
            this.reviewQueue.push({
                id: sentence.id,
                sentence: sentence,
                mistakes: 1,
                lastSeen: Date.now(),
                nextReview: Date.now() + 3600000
            });
        }
        this.saveProgress();
    }

    getReviewSentences() {
        const now = Date.now();
        return this.reviewQueue
            .filter(item => item.nextReview <= now)
            .map(item => item.sentence)
            .slice(0, 5);
    }

    showErrorToast(message, duration = 4000) {
        const existingToast = document.getElementById('error-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'error-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            cursor: pointer;
        `;

        toast.textContent = message;
        toast.onclick = () => toast.remove();

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    showSuccessToast(message, duration = 3000) {
        const existingToast = document.getElementById('success-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'success-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            cursor: pointer;
        `;

        toast.textContent = message;
        toast.onclick = () => toast.remove();

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    handleLevelChange() {
        // Handle random modes and mixed levels
        if (this.currentLevel.startsWith('RANDOM_')) {
            this.setupRandomMode();
        } else if (this.currentLevel.includes(',')) {
            this.setupMixedLevels();
        } else {
            this.isRandomMode = false;
            this.loadTopicsForLevel(this.currentLevel);
            this.resetGameSession();
        }
    }

    setupRandomMode() {
        this.isRandomMode = true;
        const topicSelect = document.getElementById('topic');
        topicSelect.innerHTML = '<option value="RANDOM" selected>🎲 Random Questions</option>';
        this.currentTopic = 'RANDOM';

        if (this.currentLevel === 'RANDOM_A1') {
            this.randomLevels = ['A1'];
        } else if (this.currentLevel === 'RANDOM_A2') {
            this.randomLevels = ['A2'];
        } else if (this.currentLevel === 'RANDOM_A1_A2') {
            this.randomLevels = ['A1', 'A2'];
        }

        this.loadRandomSentences();
    }

    setupMixedLevels() {
        this.isRandomMode = false;
        const levels = this.currentLevel.split(',');
        const topicSelect = document.getElementById('topic');
        topicSelect.innerHTML = '<option value="">Choose a topic...</option>';

        const allTopics = new Set();
        levels.forEach(level => {
            const levelSentences = this.allSentences.filter(s => s.level === level.trim());
            levelSentences.forEach(s => allTopics.add(s.topic));
        });

        Array.from(allTopics).sort().forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            const topicName = topic.charAt(0).toUpperCase() + topic.slice(1).replace('-', ' ');
            const sentenceCount = this.allSentences.filter(s =>
                levels.some(level => level.trim() === s.level) && s.topic === topic
            ).length;
            option.textContent = `${topicName} (${sentenceCount} questions)`;
            topicSelect.appendChild(option);
        });
    }

    loadRandomSentences() {
        this.randomSentences = [];
        this.randomLevels.forEach(level => {
            const levelSentences = this.allSentences.filter(s => s.level === level);
            this.randomSentences.push(...levelSentences);
        });

        this.shuffleArray(this.randomSentences);
        this.currentSentences = [...this.randomSentences];
        this.currentSentenceIndex = 0;
        this.usedSentences = [];
        this.sentenceCount = this.currentSentences.length;
        this.getNewSentence();
    }

    replayAudio() {
        if (this.currentSentence && this.currentSentence.correctFrench) {
            this.pronounceFrench(this.currentSentence.correctFrench.join(' '));
        }
    }

    startTimer() {
        if (!this.timerEnabled || this.timerDuration <= 0) return;

        this.timeLeft = this.timerDuration;
        this.timerActive = true;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.handleTimerExpired();
            }
        }, 1000);
    }

    stopTimer() {
        this.timerActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.hideTimerDisplay();
    }

    updateTimerDisplay() {
        let timerDisplay = document.getElementById('timer-display');
        if (!timerDisplay) {
            timerDisplay = document.createElement('div');
            timerDisplay.id = 'timer-display';
            timerDisplay.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: ${this.timeLeft <= 5 ? '#ff6b6b' : '#667eea'};
                color: white;
                padding: 10px 15px;
                border-radius: 25px;
                font-weight: bold;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(timerDisplay);
        }

        timerDisplay.textContent = `⏱️ ${this.timeLeft}s`;
        timerDisplay.style.background = this.timeLeft <= 5 ? '#ff6b6b' : '#667eea';
    }

    hideTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.remove();
        }
    }

    handleTimerExpired() {
        this.stopTimer();
        this.isComplete = true;
        this.totalCount++;
        this.streak = 0;
        this.addToReviewQueue(this.currentSentence);

        this.showFeedback("⏰ Time's up! Keep practicing!", 'incorrect');
        document.getElementById('explanation').textContent = `Correct answer: ${this.currentSentence.correctFrench.join(' ')}. ${this.currentSentence.explanation}`;

        this.updateStats();
        this.saveProgress();
        this.showNextButton();
    }

    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    showVersionInfo() {
        // Show a brief version notification to confirm new features are loaded
        const versionInfo = document.createElement('div');
        versionInfo.id = 'version-info';
        versionInfo.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 18px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            z-index: 10000;
            font-size: 13px;
            max-width: 280px;
            transform: translateY(100%);
            transition: transform 0.4s ease;
            cursor: pointer;
            border: 2px solid white;
            font-family: 'Kalam', cursive;
        `;

        versionInfo.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 6px;">🎯 Wordie Budie v2.0.0</div>
            <div style="font-size: 12px; opacity: 0.9;">
                ✨ New: Timer, TTS, Randomization & Doodle Design!
            </div>
        `;

        versionInfo.onclick = () => versionInfo.remove();
        document.body.appendChild(versionInfo);

        // Animate in
        setTimeout(() => {
            versionInfo.style.transform = 'translateY(0)';
        }, 1000);

        // Auto-remove after 6 seconds
        setTimeout(() => {
            if (document.body.contains(versionInfo)) {
                versionInfo.style.transform = 'translateY(100%)';
                setTimeout(() => versionInfo.remove(), 400);
            }
        }, 6000);
    }

    // API Integration Methods for Wix Website
    getApiBaseUrl() {
        // Check if running in Wix iframe or standalone
        const urlParams = new URLSearchParams(window.location.search);
        const wixApiUrl = urlParams.get('wixApi');

        if (wixApiUrl) {
            return wixApiUrl; // Passed from Wix iframe
        } else if (window.parent !== window) {
            // Running in iframe, assume Wix integration
            return 'https://your-wix-site.wix.com/api';
        }

        return null; // Standalone mode
    }

    isApiEnabled() {
        return this.apiConfig.baseUrl !== null;
    }

    async authenticateWithWix() {
        if (!this.apiConfig.enabled) return false;

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('userId');
            const token = urlParams.get('token');

            if (!userId || !token) return false;

            const response = await fetch(`${this.apiConfig.baseUrl}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, token })
            });

            if (response.ok) {
                const userData = await response.json();
                this.user = {
                    isAuthenticated: true,
                    isPremium: userData.subscriptionType !== 'free',
                    subscriptionType: userData.subscriptionType,
                    userId: userData.userId
                };

                this.showWelcomeMessage(userData);
                return true;
            }
        } catch (error) {
            console.warn('Wix authentication failed:', error);
        }

        return false;
    }

    showWelcomeMessage(userData) {
        const welcome = document.createElement('div');
        welcome.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
        `;

        welcome.textContent = `Welcome back, ${userData.username || 'Learner'}! ${this.user.isPremium ? '✨ Premium' : '🆓 Free'}`;
        document.body.appendChild(welcome);

        setTimeout(() => welcome.remove(), 4000);
    }

    async syncProgressToWix() {
        if (!this.apiConfig.enabled || !this.user.isAuthenticated) {
            return; // Fallback to localStorage only
        }

        try {
            const progressData = {
                userId: this.user.userId,
                score: this.score,
                bestStreak: this.bestStreak,
                correctCount: this.correctCount,
                totalCount: this.totalCount,
                currentLevel: this.currentLevel,
                currentTopic: this.currentTopic,
                accuracy: this.totalCount > 0 ? Math.round((this.correctCount / this.totalCount) * 100) : 0,
                timeSpent: Date.now() - (this.sessionStartTime || Date.now()),
                lastPlayed: new Date().toISOString()
            };

            await fetch(`${this.apiConfig.baseUrl}/progress/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(progressData)
            });

        } catch (error) {
            console.warn('Failed to sync progress to Wix:', error);
        }
    }

    checkPremiumFeature(feature) {
        if (!this.apiConfig.enabled) {
            return true; // All features available in standalone mode
        }

        if (!this.user.isPremium) {
            switch (feature) {
                case 'advanced_levels': // B1, B2, C1
                    return false;
                case 'unlimited_questions':
                    return false;
                case 'advanced_timer':
                    return false;
                case 'offline_mode':
                    return false;
                default:
                    return true; // Free features
            }
        }

        return true; // Premium user gets everything
    }

    showPremiumUpgradePrompt(feature) {
        const prompt = document.createElement('div');
        prompt.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10001;
            text-align: center;
            max-width: 400px;
        `;

        prompt.innerHTML = `
            <h3 style="color: #667eea; margin-top: 0;">🔒 Premium Feature</h3>
            <p>This feature requires a Premium subscription.</p>
            <div style="margin: 15px 0;">
                <button onclick="window.parent.postMessage('upgrade-premium', '*')"
                        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                               color: white; border: none; padding: 10px 20px;
                               border-radius: 6px; cursor: pointer; margin: 5px;">
                    Upgrade to Premium
                </button>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="background: #ccc; color: #333; border: none;
                               padding: 10px 20px; border-radius: 6px;
                               cursor: pointer; margin: 5px;">
                    Continue with Free
                </button>
            </div>
        `;

        document.body.appendChild(prompt);
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (confirm('A new version is available. Reload to update?')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FrenchLearningGame();
});
