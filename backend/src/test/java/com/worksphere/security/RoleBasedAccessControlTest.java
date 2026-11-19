package com.worksphere.security;

import com.worksphere.user.entity.Role;
import com.worksphere.user.entity.User;
import com.worksphere.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RoleBasedAccessControlTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    private String createUserAndToken(String email, Role role) {
        User user = new User();
        user.setName(role.name() + " User");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setEnabled(true);
        User saved = userRepository.save(user);
        return jwtService.generateToken(saved);
    }

    // ==============================================================
    // 1. Analytics Access Control (Requires VIEW_ANALYTICS)
    // ADMIN, PROJECT_MANAGER, QA have VIEW_ANALYTICS
    // DEVELOPER, TEAM_LEAD do NOT have VIEW_ANALYTICS
    // ==============================================================

    @Test
    @DisplayName("DEVELOPER cannot access analytics (403 Forbidden)")
    void developerCannotAccessAnalytics() throws Exception {
        String token = createUserAndToken("dev@example.com", Role.DEVELOPER);

        mockMvc.perform(get("/api/analytics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Forbidden"));
    }

    @Test
    @DisplayName("TEAM_LEAD cannot access analytics (403 Forbidden)")
    void teamLeadCannotAccessAnalytics() throws Exception {
        String token = createUserAndToken("lead@example.com", Role.TEAM_LEAD);

        mockMvc.perform(get("/api/analytics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("QA can access analytics (200 OK)")
    void qaCanAccessAnalytics() throws Exception {
        String token = createUserAndToken("qa@example.com", Role.QA);

        mockMvc.perform(get("/api/analytics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PROJECT_MANAGER can access analytics (200 OK)")
    void projectManagerCanAccessAnalytics() throws Exception {
        String token = createUserAndToken("pm@example.com", Role.PROJECT_MANAGER);

        mockMvc.perform(get("/api/analytics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("ADMIN can access analytics (200 OK)")
    void adminCanAccessAnalytics() throws Exception {
        String token = createUserAndToken("admin@example.com", Role.ADMIN);

        mockMvc.perform(get("/api/analytics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ==============================================================
    // 2. Project Creation Access Control (Requires CREATE_PROJECT)
    // ADMIN, PROJECT_MANAGER have CREATE_PROJECT
    // DEVELOPER, QA, TEAM_LEAD do NOT have CREATE_PROJECT
    // ==============================================================

    @Test
    @DisplayName("DEVELOPER cannot create projects (403 Forbidden)")
    void developerCannotCreateProject() throws Exception {
        String token = createUserAndToken("dev@example.com", Role.DEVELOPER);

        mockMvc.perform(post("/api/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Unauthorized Project",
                                  "code": "UNAUTH"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("QA cannot create projects (403 Forbidden)")
    void qaCannotCreateProject() throws Exception {
        String token = createUserAndToken("qa@example.com", Role.QA);

        mockMvc.perform(post("/api/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "QA Project",
                                  "code": "QAPROJ"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PROJECT_MANAGER can create projects (201 Created)")
    void projectManagerCanCreateProject() throws Exception {
        String token = createUserAndToken("pm@example.com", Role.PROJECT_MANAGER);

        mockMvc.perform(post("/api/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Platform Redesign",
                                  "code": "REDESIGN"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("REDESIGN"));
    }

    // ==============================================================
    // 3. Task Creation Access Control (Requires CREATE_TASK)
    // ADMIN, PROJECT_MANAGER, TEAM_LEAD, DEVELOPER have CREATE_TASK
    // QA does NOT have CREATE_TASK (QA creates issues)
    // ==============================================================

    @Test
    @DisplayName("QA cannot create tasks (403 Forbidden)")
    void qaCannotCreateTask() throws Exception {
        String token = createUserAndToken("qa@example.com", Role.QA);

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Unauthorized QA Task"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DEVELOPER can create tasks (201 Created)")
    void developerCanCreateTask() throws Exception {
        String token = createUserAndToken("dev@example.com", Role.DEVELOPER);

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Backend API Implementation",
                                  "description": "Implement RBAC"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    // ==============================================================
    // 4. Sprint Management Access Control
    // ADMIN, PROJECT_MANAGER, TEAM_LEAD can manage sprints
    // DEVELOPER, QA cannot create sprints
    // ==============================================================

    @Test
    @DisplayName("DEVELOPER cannot create sprints (403 Forbidden)")
    void developerCannotCreateSprint() throws Exception {
        String token = createUserAndToken("dev@example.com", Role.DEVELOPER);

        mockMvc.perform(post("/api/sprints")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Sprint 1",
                                  "startDate": "2026-11-20",
                                  "endDate": "2026-12-04"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("TEAM_LEAD can create sprints (201 Created)")
    void teamLeadCanCreateSprint() throws Exception {
        String token = createUserAndToken("lead@example.com", Role.TEAM_LEAD);

        mockMvc.perform(post("/api/sprints")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Sprint 1",
                                  "startDate": "2026-11-20",
                                  "endDate": "2026-12-04"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    // ==============================================================
    // 5. User & Role Management (Requires MANAGE_USERS / ADMIN)
    // ADMIN only
    // ==============================================================

    @Test
    @DisplayName("DEVELOPER cannot list or manage users (403 Forbidden)")
    void developerCannotManageUsers() throws Exception {
        String token = createUserAndToken("dev@example.com", Role.DEVELOPER);

        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ADMIN can list and promote user role (200 OK)")
    void adminCanManageUsersAndChangeRole() throws Exception {
        String adminToken = createUserAndToken("admin@example.com", Role.ADMIN);

        User targetDev = new User();
        targetDev.setName("Junior Dev");
        targetDev.setEmail("junior@example.com");
        targetDev.setPassword(passwordEncoder.encode("password123"));
        targetDev.setRole(Role.DEVELOPER);
        targetDev.setEnabled(true);
        User savedDev = userRepository.save(targetDev);

        // Admin lists users
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Admin promotes user to TEAM_LEAD
        mockMvc.perform(patch("/api/users/" + savedDev.getId() + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "TEAM_LEAD"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("TEAM_LEAD"));
    }
}
