package com.worksphere.assistant;

import com.worksphere.security.JwtService;
import com.worksphere.user.entity.Role;
import com.worksphere.user.entity.User;
import com.worksphere.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.gemini.api-key=")
@AutoConfigureMockMvc
class AssistantApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanUsers() {
        userRepository.deleteAll();
    }

    @Test
    void interpretationRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/assistant/interpret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"transcript\":\"open the board\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void missingGeminiConfigurationReturnsServiceUnavailable() throws Exception {
        User user = new User();
        user.setName("Voice Test");
        user.setEmail("voice-test@example.com");
        user.setPassword("not-used-in-this-test");
        user.setRole(Role.DEVELOPER);
        String token = jwtService.generateToken(userRepository.save(user));

        mockMvc.perform(post("/api/assistant/interpret")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"transcript\":\"open the board\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Voice intent service is not configured."));
    }
}
