import json

# B1 Complex Grammar Questions Generator
def generate_complex_grammar_questions():
    questions = []

    # Relative Pronouns (QUI, QUE, DONT, OÙ) - 100 questions
    relative_templates = [
        {
            "english": "The student who studies hard will succeed.",
            "correctFrench": ["L'étudiant", "qui", "étudie", "sérieusement", "réussira"],
            "grammar_points": ["relative_pronouns", "future_simple", "academic_success"],
            "difficulty": 3.2
        },
        {
            "english": "The book that you recommended is excellent.",
            "correctFrench": ["Le", "livre", "que", "vous", "avez", "recommandé", "est", "excellent"],
            "grammar_points": ["relative_pronouns", "passe_compose", "book_recommendations"],
            "difficulty": 3.3
        },
        # Add more relative pronoun patterns...
    ]

    # Subjunctive with complex expressions - 100 questions
    subjunctive_templates = [
        {
            "english": "I doubt that he knows the answer.",
            "correctFrench": ["Je", "doute", "qu'il", "connaisse", "la", "réponse"],
            "grammar_points": ["subjunctive_doubt", "knowledge_expressions", "uncertainty"],
            "difficulty": 3.5
        },
        # Add more subjunctive patterns...
    ]

    # Participle constructions - 100 questions
    participle_templates = [
        {
            "english": "Having read the article, I changed my opinion.",
            "correctFrench": ["Ayant", "lu", "l'article", "j'ai", "changé", "d'avis"],
            "grammar_points": ["participe_present", "opinion_change", "literary_style"],
            "difficulty": 3.9
        },
        # Add more participle patterns...
    ]

    # Complex conditional structures - 100 questions
    conditional_templates = [
        {
            "english": "If I had studied medicine, I would be a doctor now.",
            "correctFrench": ["Si", "j'avais", "étudié", "la", "médecine", "je", "serais", "médecin", "maintenant"],
            "grammar_points": ["conditional_past", "hypothetical_careers", "regret_expressions"],
            "difficulty": 4.1
        },
        # Add more conditional patterns...
    ]

    # Generate questions systematically
    question_id = 16  # Starting from where we left off

    for category, templates in [
        ("relative", relative_templates),
        ("subjunctive", subjunctive_templates),
        ("participle", participle_templates),
        ("conditional", conditional_templates)
    ]:
        for template in templates:
            questions.append({
                "id": f"b1_complex_{question_id:03d}",
                "english": template["english"],
                "correctFrench": template["correctFrench"],
                "wordOptions": template["correctFrench"] + ["incorrect", "options", "here"],
                "explanation": f"Complex {category} construction.",
                "grammar_points": template["grammar_points"],
                "difficulty": template["difficulty"]
            })
            question_id += 1

    return questions

# For now, let's create a comprehensive template
if __name__ == "__main__":
    print("Complex grammar generator ready")