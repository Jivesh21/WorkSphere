package com.worksphere.assistant.controller;

import com.worksphere.assistant.dto.VoiceIntentRequest;
import com.worksphere.assistant.dto.VoiceIntentResponse;
import com.worksphere.assistant.service.VoiceIntentService;
import com.worksphere.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final VoiceIntentService voiceIntentService;

    public AssistantController(VoiceIntentService voiceIntentService) {
        this.voiceIntentService = voiceIntentService;
    }

    @PostMapping("/interpret")
    public ResponseEntity<ApiResponse<VoiceIntentResponse>> interpret(
            @Valid @RequestBody VoiceIntentRequest request,
            Authentication authentication
    ) {
        VoiceIntentResponse intent = voiceIntentService.interpret(request.transcript(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Voice intent interpreted", intent));
    }
}
