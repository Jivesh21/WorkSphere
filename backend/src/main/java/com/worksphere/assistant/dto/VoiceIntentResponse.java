package com.worksphere.assistant.dto;

public record VoiceIntentResponse(
        String intent,
        String destination,
        String filter,
        String value
) {
}
