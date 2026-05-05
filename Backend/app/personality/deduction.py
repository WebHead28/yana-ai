def build_personality_vector(answers: dict):

    def avg(keys):
        values = [answers.get(k, 4) for k in keys]
        return sum(values) / len(values)

    personality = {

        # Emotional openness
        "emotional_openness": avg([
            "open_emotions",
            "talk_when_bothered",
            "share_day",
            "safe_talking"
        ]),

        # Anxiety tendency
        "anxiety_level": avg([
            "overthink",
            "overwhelmed",
            "feel_too_much",
            "negative_thoughts",
            "lonely"
        ]),

        # Attachment style
        "attachment_need": avg([
            "attach_easy",
            "want_company",
            "need_reassurance"
        ]),

        # Emotional stability
        "emotional_stability": avg([
            "stay_calm",
            "recover_fast",
            "hopeful"
        ]),

        # Avoidance
        "avoidance": avg([
            "avoid_problems",
            "shutdown",
            "avoid_conflict"
        ]),

        # Social confidence
        "social_energy": avg([
            "trust_quickly",
            "fake_confidence"
        ]),
    }

    return personality
