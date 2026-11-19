package com.worksphere.workspace;

import com.worksphere.security.JwtService;
import com.worksphere.user.entity.Role;
import com.worksphere.user.entity.User;
import com.worksphere.user.repository.UserRepository;
import com.worksphere.workspace.entity.Workspace;
import com.worksphere.workspace.entity.WorkspaceMember;
import com.worksphere.workspace.entity.WorkspaceRole;
import com.worksphere.workspace.repository.WorkspaceMemberRepository;
import com.worksphere.workspace.repository.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WorkspaceLifecycleTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanup() {
        workspaceMemberRepository.deleteAll();
        workspaceRepository.deleteAll();
        userRepository.deleteAll();
    }

    // ==========================================
    // 1. Get User Workspaces
    // ==========================================

    @Test
    @DisplayName("getUserWorkspaces returns only workspaces where user is a member")
    void getUserWorkspaces_returnsOnlyMemberWorkspaces() throws Exception {
        User user1 = createAndSaveUser("User 1", "user1@example.com");
        User user2 = createAndSaveUser("User 2", "user2@example.com");

        Workspace ws1 = createAndSaveWorkspace("Workspace 1", user1);
        Workspace ws2 = createAndSaveWorkspace("Workspace 2", user2);
        // Add user1 to ws2 as a worker
        addMember(ws2, user1, WorkspaceRole.WORKER);

        // ws3 has only user2
        createAndSaveWorkspace("Workspace 3", user2);

        String token1 = jwtService.generateToken(user1);

        mockMvc.perform(get("/api/workspaces")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Workspace 1"))
                .andExpect(jsonPath("$[1].name").value("Workspace 2"));
    }

    // ==========================================
    // 2. Update Workspace
    // ==========================================

    @Test
    @DisplayName("Owner can update workspace name and description")
    void updateWorkspace_asOwner_succeeds() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        Workspace workspace = createAndSaveWorkspace("Original Name", owner);
        String token = jwtService.generateToken(owner);

        mockMvc.perform(put("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Updated Name",
                                  "description": "Updated Description"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(workspace.getId()))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.description").value("Updated Description"));

        Workspace updated = workspaceRepository.findById(workspace.getId()).orElseThrow();
        assertThat(updated.getName()).isEqualTo("Updated Name");
        assertThat(updated.getDescription()).isEqualTo("Updated Description");
    }

    @Test
    @DisplayName("Admin can update workspace name and description")
    void updateWorkspace_asAdmin_succeeds() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User admin = createAndSaveUser("Admin", "admin@example.com");
        Workspace workspace = createAndSaveWorkspace("Original Name", owner);
        addMember(workspace, admin, WorkspaceRole.ADMIN);

        String token = jwtService.generateToken(admin);

        mockMvc.perform(put("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Admin Updated",
                                  "description": "New Desc"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Admin Updated"));
    }

    @Test
    @DisplayName("Worker cannot update workspace")
    void updateWorkspace_asWorker_returnsUnauthorized() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("Original Name", owner);
        addMember(workspace, worker, WorkspaceRole.WORKER);

        String token = jwtService.generateToken(worker);

        mockMvc.perform(put("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Worker Updated",
                                  "description": "Hacked"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You do not have permission to manage workspace members"));
    }

    @Test
    @DisplayName("Update workspace with blank name returns 400 Bad Request")
    void updateWorkspace_blankName_returnsBadRequest() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        Workspace workspace = createAndSaveWorkspace("Original Name", owner);
        String token = jwtService.generateToken(owner);

        mockMvc.perform(put("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "   ",
                                  "description": "desc"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ==========================================
    // 3. Delete Workspace
    // ==========================================

    @Test
    @DisplayName("Owner can delete workspace")
    void deleteWorkspace_asOwner_succeeds() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User member = createAndSaveUser("Member", "member@example.com");
        Workspace workspace = createAndSaveWorkspace("To Delete", owner);
        addMember(workspace, member, WorkspaceRole.WORKER);

        String token = jwtService.generateToken(owner);

        mockMvc.perform(delete("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertThat(workspaceRepository.findById(workspace.getId())).isEmpty();
        assertThat(workspaceMemberRepository.findByWorkspaceId(workspace.getId())).isEmpty();
    }

    @Test
    @DisplayName("Admin cannot delete workspace")
    void deleteWorkspace_asAdmin_returnsUnauthorized() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User admin = createAndSaveUser("Admin", "admin@example.com");
        Workspace workspace = createAndSaveWorkspace("To Delete", owner);
        addMember(workspace, admin, WorkspaceRole.ADMIN);

        String token = jwtService.generateToken(admin);

        mockMvc.perform(delete("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Only the workspace owner can perform this operation"));

        assertThat(workspaceRepository.findById(workspace.getId())).isPresent();
    }

    // ==========================================
    // 4. Transfer Ownership
    // ==========================================

    @Test
    @DisplayName("Owner can transfer ownership to another member")
    void transferOwnership_asOwner_succeeds() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User newOwner = createAndSaveUser("NewOwner", "newowner@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        WorkspaceMember newOwnerMember = addMember(workspace, newOwner, WorkspaceRole.WORKER);

        String token = jwtService.generateToken(owner);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/transfer-ownership", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "newOwnerMemberId": %d
                                }
                                """.formatted(newOwnerMember.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ownerId").value(newOwner.getId()));

        // Invariant check: workspace.owner must be newOwner
        Workspace reloadedWs = workspaceRepository.findById(workspace.getId()).orElseThrow();
        assertThat(reloadedWs.getOwner().getId()).isEqualTo(newOwner.getId());

        // Invariant check: newOwner member has role OWNER
        WorkspaceMember updatedTargetMember = workspaceMemberRepository.findById(newOwnerMember.getId()).orElseThrow();
        assertThat(updatedTargetMember.getRole()).isEqualTo(WorkspaceRole.OWNER);

        // Invariant check: previous owner has role ADMIN
        WorkspaceMember previousOwnerMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspace.getId(), owner.getId()).orElseThrow();
        assertThat(previousOwnerMember.getRole()).isEqualTo(WorkspaceRole.ADMIN);
    }

    @Test
    @DisplayName("Admin cannot transfer workspace ownership")
    void transferOwnership_asAdmin_returnsUnauthorized() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User admin = createAndSaveUser("Admin", "admin@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, admin, WorkspaceRole.ADMIN);
        WorkspaceMember workerMember = addMember(workspace, worker, WorkspaceRole.WORKER);

        String token = jwtService.generateToken(admin);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/transfer-ownership", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "newOwnerMemberId": %d
                                }
                                """.formatted(workerMember.getId())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Only the workspace owner can perform this operation"));
    }

    @Test
    @DisplayName("Owner cannot transfer ownership to themselves")
    void transferOwnership_toSelf_returnsConflict() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        WorkspaceMember ownerMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspace.getId(), owner.getId()).orElseThrow();

        String token = jwtService.generateToken(owner);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/transfer-ownership", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "newOwnerMemberId": %d
                                }
                                """.formatted(ownerMember.getId())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("User is already the workspace owner"));
    }

    // ==========================================
    // 5. Get My Membership
    // ==========================================

    @Test
    @DisplayName("Member can get their own membership details")
    void getMyMembership_asMember_returnsDetails() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, worker, WorkspaceRole.WORKER);

        String token = jwtService.generateToken(worker);

        mockMvc.perform(get("/api/workspaces/{workspaceId}/members/me", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(worker.getId()))
                .andExpect(jsonPath("$.name").value("Worker"))
                .andExpect(jsonPath("$.email").value("worker@example.com"))
                .andExpect(jsonPath("$.role").value("WORKER"));
    }

    @Test
    @DisplayName("Non-member cannot get membership details")
    void getMyMembership_asNonMember_returnsUnauthorized() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User stranger = createAndSaveUser("Stranger", "stranger@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);

        String token = jwtService.generateToken(stranger);

        mockMvc.perform(get("/api/workspaces/{workspaceId}/members/me", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You are not a member of this workspace"));
    }

    // ==========================================
    // 6. Leave Workspace
    // ==========================================

    @Test
    @DisplayName("Worker can leave the workspace")
    void leaveWorkspace_asWorker_succeeds() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        WorkspaceMember workerMember = addMember(workspace, worker, WorkspaceRole.WORKER);

        String token = jwtService.generateToken(worker);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/members/leave", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertThat(workspaceMemberRepository.findById(workerMember.getId())).isEmpty();
    }

    @Test
    @DisplayName("Owner cannot leave the workspace")
    void leaveWorkspace_asOwner_returnsConflict() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);

        String token = jwtService.generateToken(owner);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/members/leave", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Workspace owner cannot leave the workspace. Transfer ownership or delete the workspace instead."
                ));
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    private User createAndSaveUser(String name, String email) {
        User user = new User();
        user.setName(name);
        user.setEmail(email.toLowerCase());
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(Role.DEVELOPER);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    private Workspace createAndSaveWorkspace(String name, User owner) {
        Workspace ws = new Workspace();
        ws.setName(name);
        ws.setOwner(owner);
        Workspace savedWs = workspaceRepository.save(ws);

        WorkspaceMember ownerMember = new WorkspaceMember();
        ownerMember.setWorkspace(savedWs);
        ownerMember.setUser(owner);
        ownerMember.setRole(WorkspaceRole.OWNER);
        workspaceMemberRepository.save(ownerMember);

        return savedWs;
    }

    private WorkspaceMember addMember(Workspace workspace, User user, WorkspaceRole role) {
        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(user);
        member.setRole(role);
        return workspaceMemberRepository.save(member);
    }
}
