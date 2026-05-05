def format_response(personality_config: dict, llm_text: str) -> str:
    """
    Clean final output sent to user.
    """
    return llm_text.strip()
