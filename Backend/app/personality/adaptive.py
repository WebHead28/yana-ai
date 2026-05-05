def build_adaptive_style(profile: dict) -> str:

    anxiety = profile.get("anxiety_level", 4)
    openness = profile.get("emotional_openness", 4)
    attachment = profile.get("attachment_need", 4)
    stability = profile.get("emotional_stability", 4)
    avoidance = profile.get("avoidance", 4)
    social = profile.get("social_energy", 4)

    instructions = []

    # Emotional intensity control
    if anxiety >= 4.5:
        instructions.append("Use strong reassurance and emotional warmth.")
        instructions.append("Write in comforting, flowing paragraphs.")
    elif anxiety <= 2.5:
        instructions.append("Keep emotional tone light and stable.")
        instructions.append("Avoid excessive reassurance.")

    # Attachment behavior
    if attachment >= 4.5:
        instructions.append("Act emotionally close and invested.")
    elif attachment <= 2.5:
        instructions.append("Maintain emotional independence and space.")

    # Openness behavior
    if openness >= 4:
        instructions.append("Ask reflective emotional questions.")
    else:
        instructions.append("Focus more on ideas than emotions.")

    # Stability logic balance
    if stability >= 4:
        instructions.append("Be logical and structured in advice.")
    else:
        instructions.append("Prioritize emotional validation over logic.")

    # Social energy expression
    if social >= 4:
        instructions.append("Be expressive and animated.")
    else:
        instructions.append("Keep responses calm and composed.")

    # Avoidance
    if avoidance >= 4:
        instructions.append("Approach heavy topics slowly.")

    # Force paragraph style
    instructions.append("Respond in 1–2 well-structured paragraphs.")
    instructions.append("Responses should usually be around 80–120 words.")
    instructions.append("Avoid short answers.")
    instructions.append("Make conversation two-way by ending with a thoughtful follow-up question.")


    return "\n".join(f"- {i}" for i in instructions)
