package com.worksphere.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VoiceIntentRequest(
        @NotBlank(message = "transcript is required")
        @Size(max = 1000, message = "transcript must be at most 1000 characters")
        String transcript
) {
}
