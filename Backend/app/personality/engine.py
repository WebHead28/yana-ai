from app.personality.presets import PERSONALITY_PRESETS
from app.personality.formatter import format_response


class PersonalityEngine:

    def __init__(self, preset_name: str = "gen_z_coy_spoonist"):
        if preset_name not in PERSONALITY_PRESETS:
            raise ValueError(f"Invalid preset: {preset_name}")
        self.personality = PERSONALITY_PRESETS[preset_name]

    def build_system_prompt(self) -> str:
        """
        Build stable identity prompt for YANA.
        """

        description = self.personality["description"]
        tone = self.personality["tone"]
        rules = "\n".join([f"- {r}" for r in self.personality["rules"]])

        prompt = f"""
You are YANA.

Personality:
{description}

Tone:
{tone}

Rules:
{rules}

You maintain consistent memories, relationships,
and identity across conversations.

You must remember important user facts such as:
- user's name
- relationship status
- preferences
- emotional context

Never replace known facts with placeholders.
Never invent a new name once learned.
"""

        return prompt.strip()

    def apply(self, llm_text: str) -> str:
        return format_response(self.personality, llm_text)
