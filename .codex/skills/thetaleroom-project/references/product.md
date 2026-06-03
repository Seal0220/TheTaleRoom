# TheTaleRoom Product Reference

## Product Identity

TheTaleRoom is an empathy-driven interactive story room. The prototype uses familiar classic stories as a safety net so users can project difficult feelings into a narrative world, receive gentle containment, and return to the story line.

Keep the product language warm, non-judgmental, and grounded. Treat it as a psychological support prototype and narrative experience, not as diagnosis, therapy, emergency care, or a replacement for professional support.

## Core Emotional Loop

Use this loop for story interaction:

1. Invite narrative projection through a familiar story frame.
2. Listen to the user's emotional text.
3. Reflect the emotion with gentle, non-preachy language.
4. Contain the feeling without rushing to fix it.
5. Weave the user's meaning into the next story beat.
6. Return to the main story line with agency and softness.

The loop can be summarized as catharsis, gentle holding, and return to narrative movement.

## Initial Story Rooms

Use these initial rooms unless the user changes the product direction:

```txt
Cinderella
- Narrator: Glass Slipper
- Theme: being seen after being overlooked
- Emotional frame: exhaustion, neglect, hope, recognition

Alice's Dream Wonderland
- Narrator: Cheshire Cat
- Theme: self-recognition inside confusion
- Emotional frame: disorientation, identity, uncertainty, curiosity

The Little Prince
- Narrator: Fox
- Theme: attachment, memory, separation, growth
- Emotional frame: loneliness, meaning, care, goodbye

The Emperor's New Clothes
- Narrator: Tailor
- Theme: truth, performance, adulthood, social pressure
- Emotional frame: shame, pretending, courage, honesty
```

## Multimodal Architecture

The research direction plans five cooperating modules:

- LLM control brain: analyze emotion, generate gentle narrative responses, guide story state.
- TTS narrator: produce expressive narration with warmth, pacing, and emotional tone.
- Image generation: maintain consistent characters and scenes across story turns.
- Music generation: create context-aware background atmosphere from emotion tags.
- Web prototype: orchestrate route state, user input, story playback, AI interaction, and records.

Keep provider integrations behind server-side API routes and lib wrappers. Do not let client components call external provider secrets.

## AI Response Rules

Use high-context, empathy-driven responses. Avoid canned advice, moralizing, diagnosis, pressure, or quick positivity. Prefer:

- naming the feeling tentatively;
- reflecting the user's words without overclaiming;
- allowing ambivalence;
- offering a small next story beat;
- giving the user agency to continue, pause, or redirect.

For high-risk content, respond supportively and encourage immediate human support or local emergency resources. Keep the tone calm and non-clinical.

## Visual Direction

Use a nocturnal story-room atmosphere with warm gold, rose, violet, ink, and lantern-like contrast. The existing prototype images in `prototype_images/` show:

- a starry story hall;
- four arched story entrances;
- narrator avatars;
- story playback, AI interaction, and branch ending screens.

When building UI, make the first screen a usable story-room experience rather than a marketing landing page. The brand name is `TheTaleRoom`.
