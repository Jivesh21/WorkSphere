package com.worksphere.assistant.service;

import com.worksphere.assistant.dto.VoiceIntentResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class VoiceIntentServiceTest {

    private final VoiceIntentService service = new VoiceIntentService(new ObjectMapper(), "", "gemini-3.8-flash");

    @Test
    void missingApiKeyReturnsServiceUnavailableWithoutCallingProvider() {
        assertThatThrownBy(() -> service.interpret("open the board", "user@example.com"))
                .isInstanceOf(AssistantServiceException.class)
                .satisfies(exception -> assertThat(((AssistantServiceException) exception).getStatus())
                        .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
    }

    @Test
    void acceptsOnlyAllowlistedStructuredNavigationIntent() throws Exception {
        String providerResponse = """
                {"candidates":[{"content":{"parts":[{"text":"{\\"intent\\":\\"NAVIGATE\\",\\"destination\\":\\"BOARD\\",\\"filter\\":\\"NONE\\",\\"value\\":\\"NONE\\"}"}]}}]}
                """;

        VoiceIntentResponse intent = service.parseProviderResponse(providerResponse);

        assertThat(intent).isEqualTo(new VoiceIntentResponse("NAVIGATE", "BOARD", "NONE", "NONE"));
    }

    @Test
    void rejectsUnexpectedActionsAndInconsistentFields() {
        String providerResponse = """
                {"candidates":[{"content":{"parts":[{"text":"{\\"intent\\":\\"NAVIGATE\\",\\"destination\\":\\"https://example.com\\",\\"filter\\":\\"NONE\\",\\"value\\":\\"NONE\\"}"}]}}]}
                """;

        assertThatThrownBy(() -> service.parseProviderResponse(providerResponse))
                .isInstanceOf(AssistantServiceException.class)
                .satisfies(exception -> assertThat(((AssistantServiceException) exception).getStatus())
                        .isEqualTo(HttpStatus.BAD_GATEWAY));
    }
}
