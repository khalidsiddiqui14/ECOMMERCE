import os

from openai import OpenAI


def ask_ai(message):
    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not loaded."
        )

    client = OpenAI(
        api_key=api_key,
    )

    response = client.responses.create(
        model="gpt-5-mini",
        input=message,
    )

    return response.output_text