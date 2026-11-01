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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WorkspaceApiTest {

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
    // 1. Workspace Creation & Ownership Invariant
    // ==========================================

    @Test
    @DisplayName("Create workspace creates workspace with creator as owner and OWNER member")
    void createWorkspace_establishesOwnerAndMemberRepresentation() throws Exception {
        User creator = createAndSaveUser("Creator", "creator@example.com");
        String token = jwtService.generateToken(creator);

        mockMvc.perform(post("/api/workspaces")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Backend Team Workspace",
                                  "description": "Workspace for backend developers"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Backend Team Workspace"))
                .andExpect(jsonPath("$.ownerId").value(creator.getId()));

        List<Workspace> workspaces = workspaceRepository.findAll();
        assertThat(workspaces).hasSize(1);
        Workspace savedWs = workspaces.get(0);
        assertThat(savedWs.getOwner().getId()).isEqualTo(creator.getId());

        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(savedWs.getId());
        assertThat(members).hasSize(1);
        WorkspaceMember ownerMember = members.get(0);
        assertThat(ownerMember.getUser().getId()).isEqualTo(creator.getId());
        assertThat(ownerMember.getRole()).isEqualTo(WorkspaceRole.OWNER);
        assertThat(savedWs.getOwner().getId()).isEqualTo(ownerMember.getUser().getId());
    }

    // ==========================================
    // 2. Workspace Access Authorization
    // ==========================================

    @Test
    @DisplayName("Owner can access workspace details")
    void getWorkspace_ownerCanAccess() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        String token = jwtService.generateToken(owner);

        mockMvc.perform(get("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(workspace.getId()))
                .andExpect(jsonPath("$.name").value("HQ"))
                .andExpect(jsonPath("$.ownerId").value(owner.getId()));
    }

    @Test
    @DisplayName("Member can access workspace details")
    void getWorkspace_memberCanAccess() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User member = createAndSaveUser("Member", "member@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, member, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(member);

        mockMvc.perform(get("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(workspace.getId()));
    }

    @Test
    @DisplayName("Non-member cannot access workspace details")
    void getWorkspace_nonMemberCannotAccess() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User outsider = createAndSaveUser("Outsider", "outsider@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        String token = jwtService.generateToken(outsider);

        mockMvc.perform(get("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("You are not a member of this workspace"));
    }

    @Test
    @DisplayName("Unknown workspace returns 404 Not Found")
    void getWorkspace_unknownWorkspaceReturnsNotFound() throws Exception {
        User user = createAndSaveUser("User", "user@example.com");
        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/workspaces/{workspaceId}", 9999L)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Workspace not found"));
    }

    // ==========================================
    // 3. Workspace Member List Authorization
    // ==========================================

    @Test
    @DisplayName("Workspace member can list workspace members")
    void getMembers_memberCanList() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, worker, WorkspaceRole.WORKER);

        String token = jwtService.generateToken(worker);

        mockMvc.perform(get("/api/workspaces/{workspaceId}/members", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("Non-member cannot list workspace members")
    void getMembers_nonMemberCannotList() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User outsider = createAndSaveUser("Outsider", "outsider@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);

        String token = jwtService.generateToken(outsider);

        mockMvc.perform(get("/api/workspaces/{workspaceId}/members", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("You are not a member of this workspace"));
    }

    @Test
    @DisplayName("Member list on unknown workspace returns 404")
    void getMembers_unknownWorkspaceReturnsNotFound() throws Exception {
        User user = createAndSaveUser("User", "user@example.com");
        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/workspaces/{workspaceId}/members", 9999L)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Workspace not found"));
    }

    // ==========================================
    // 4. Add Member
    // ==========================================

    @Test
    @DisplayName("OWNER can add a member")
    void addMember_ownerCanAdd() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User target = createAndSaveUser("Target", "target@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        String token = jwtService.generateToken(owner);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/members", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "target@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userEmail").value("target@example.com"))
                .andExpect(jsonPath("$.role").value("WORKER"));
    }

    @Test
    @DisplayName("ADMIN can add a member")
    void addMember_adminCanAdd() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User admin = createAndSaveUser("Admin", "admin@example.com");
        User target = createAndSaveUser("Target", "target@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, admin, WorkspaceRole.ADMIN);
        String token = jwtService.generateToken(admin);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/members", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "target@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userEmail").value("target@example.com"))
                .andExpect(jsonPath("$.role").value("WORKER"));
    }

    @Test
    @DisplayName("WORKER cannot add a member")
    void addMember_workerCannotAdd() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        User target = createAndSaveUser("Target", "target@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, worker, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(worker);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/members", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "target@example.com"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("You do not have permission to manage workspace members"));
    }

    @Test
    @DisplayName("Non-member cannot add a member")
    void addMember_nonMemberCannotAdd() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User outsider = createAndSaveUser("Outsider", "outsider@example.com");
        User target = createAndSaveUser("Target", "target@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        String token = jwtService.generateToken(outsider);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/members", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "target@example.com"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("You are not a member of this workspace"));
    }

    @Test
    @DisplayName("Duplicate member is rejected with 409 Conflict")
    void addMember_duplicateMemberRejected() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User member = createAndSaveUser("Member", "member@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, member, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(owner);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/members", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "member@example.com"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("User is already a member of this workspace"));
    }

    @Test
    @DisplayName("Nonexistent target user is rejected with 404 Not Found")
    void addMember_nonexistentUserRejected() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        String token = jwtService.generateToken(owner);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/members", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "doesnotexist@example.com"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("User not found"));
    }

    // ==========================================
    // 5. Change Role
    // ==========================================

    @Test
    @DisplayName("OWNER can promote WORKER to ADMIN")
    void changeRole_ownerCanPromoteWorkerToAdmin() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        WorkspaceMember member = addMember(workspace, worker, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(owner);

        mockMvc.perform(patch("/api/workspaces/{workspaceId}/members/{memberId}/role", workspace.getId(), member.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("ADMIN can change WORKER role")
    void changeRole_adminCanChangeWorkerRole() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User admin = createAndSaveUser("Admin", "admin@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, admin, WorkspaceRole.ADMIN);
        WorkspaceMember workerMember = addMember(workspace, worker, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(admin);

        mockMvc.perform(patch("/api/workspaces/{workspaceId}/members/{memberId}/role", workspace.getId(), workerMember.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("WORKER cannot change member roles")
    void changeRole_workerCannotChangeRole() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User worker1 = createAndSaveUser("Worker1", "worker1@example.com");
        User worker2 = createAndSaveUser("Worker2", "worker2@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, worker1, WorkspaceRole.WORKER);
        WorkspaceMember target = addMember(workspace, worker2, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(worker1);

        mockMvc.perform(patch("/api/workspaces/{workspaceId}/members/{memberId}/role", workspace.getId(), target.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You do not have permission to manage workspace members"));
    }

    @Test
    @DisplayName("Non-member cannot change member roles")
    void changeRole_nonMemberCannotChangeRole() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User outsider = createAndSaveUser("Outsider", "outsider@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        WorkspaceMember target = addMember(workspace, worker, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(outsider);

        mockMvc.perform(patch("/api/workspaces/{workspaceId}/members/{memberId}/role", workspace.getId(), target.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You are not a member of this workspace"));
    }

    @Test
    @DisplayName("Existing OWNER cannot be demoted through normal role endpoint")
    void changeRole_ownerCannotBeDemoted() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User admin = createAndSaveUser("Admin", "admin@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, admin, WorkspaceRole.ADMIN);
        WorkspaceMember ownerMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), owner.getId()).orElseThrow();
        String token = jwtService.generateToken(admin);

        mockMvc.perform(patch("/api/workspaces/{workspaceId}/members/{memberId}/role", workspace.getId(), ownerMember.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "WORKER"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Owner role cannot be changed"));
    }

    @Test
    @DisplayName("Normal role change endpoint cannot assign OWNER role")
    void changeRole_cannotAssignOwnerRole() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User admin = createAndSaveUser("Admin", "admin@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        WorkspaceMember adminMember = addMember(workspace, admin, WorkspaceRole.ADMIN);
        String token = jwtService.generateToken(owner);

        mockMvc.perform(patch("/api/workspaces/{workspaceId}/members/{memberId}/role", workspace.getId(), adminMember.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "OWNER"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Cannot assign OWNER role"));
    }

    @Test
    @DisplayName("Target member from another workspace cannot be modified")
    void changeRole_crossWorkspaceTargetRejected() throws Exception {
        User owner1 = createAndSaveUser("Owner1", "owner1@example.com");
        User owner2 = createAndSaveUser("Owner2", "owner2@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace ws1 = createAndSaveWorkspace("Workspace1", owner1);
        Workspace ws2 = createAndSaveWorkspace("Workspace2", owner2);
        WorkspaceMember memberInWs2 = addMember(ws2, worker, WorkspaceRole.WORKER);

        String token = jwtService.generateToken(owner1);

        mockMvc.perform(patch("/api/workspaces/{workspaceId}/members/{memberId}/role", ws1.getId(), memberInWs2.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Workspace member not found"));
    }

    // ==========================================
    // 6. Remove Member
    // ==========================================

    @Test
    @DisplayName("OWNER can remove eligible member")
    void removeMember_ownerCanRemoveMember() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        WorkspaceMember member = addMember(workspace, worker, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(owner);

        mockMvc.perform(delete("/api/workspaces/{workspaceId}/members/{memberId}", workspace.getId(), member.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertThat(workspaceMemberRepository.existsById(member.getId())).isFalse();
    }

    @Test
    @DisplayName("ADMIN can remove eligible member")
    void removeMember_adminCanRemoveMember() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User admin = createAndSaveUser("Admin", "admin@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, admin, WorkspaceRole.ADMIN);
        WorkspaceMember workerMember = addMember(workspace, worker, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(admin);

        mockMvc.perform(delete("/api/workspaces/{workspaceId}/members/{memberId}", workspace.getId(), workerMember.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertThat(workspaceMemberRepository.existsById(workerMember.getId())).isFalse();
    }

    @Test
    @DisplayName("WORKER cannot remove members")
    void removeMember_workerCannotRemove() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User worker1 = createAndSaveUser("Worker1", "worker1@example.com");
        User worker2 = createAndSaveUser("Worker2", "worker2@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, worker1, WorkspaceRole.WORKER);
        WorkspaceMember member2 = addMember(workspace, worker2, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(worker1);

        mockMvc.perform(delete("/api/workspaces/{workspaceId}/members/{memberId}", workspace.getId(), member2.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You do not have permission to manage workspace members"));
    }

    @Test
    @DisplayName("Non-member cannot remove members")
    void removeMember_nonMemberCannotRemove() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User outsider = createAndSaveUser("Outsider", "outsider@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        WorkspaceMember target = addMember(workspace, worker, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(outsider);

        mockMvc.perform(delete("/api/workspaces/{workspaceId}/members/{memberId}", workspace.getId(), target.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You are not a member of this workspace"));
    }

    @Test
    @DisplayName("OWNER cannot be removed")
    void removeMember_ownerCannotBeRemoved() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com");
        User admin = createAndSaveUser("Admin", "admin@example.com");
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, admin, WorkspaceRole.ADMIN);
        WorkspaceMember ownerMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), owner.getId()).orElseThrow();
        String token = jwtService.generateToken(admin);

        mockMvc.perform(delete("/api/workspaces/{workspaceId}/members/{memberId}", workspace.getId(), ownerMember.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Workspace owner cannot be removed"));
    }

    @Test
    @DisplayName("Target member from another workspace cannot be removed")
    void removeMember_crossWorkspaceTargetRejected() throws Exception {
        User owner1 = createAndSaveUser("Owner1", "owner1@example.com");
        User owner2 = createAndSaveUser("Owner2", "owner2@example.com");
        User worker = createAndSaveUser("Worker", "worker@example.com");
        Workspace ws1 = createAndSaveWorkspace("Workspace1", owner1);
        Workspace ws2 = createAndSaveWorkspace("Workspace2", owner2);
        WorkspaceMember memberInWs2 = addMember(ws2, worker, WorkspaceRole.WORKER);

        String token = jwtService.generateToken(owner1);

        mockMvc.perform(delete("/api/workspaces/{workspaceId}/members/{memberId}", ws1.getId(), memberInWs2.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Workspace member not found"));
    }

    // ==========================================
    // 7. Global Role Separation
    // ==========================================

    @Test
    @DisplayName("User with global ADMIN role but non-member cannot access workspace")
    void globalAdmin_nonMemberCannotAccessWorkspace() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com", Role.DEVELOPER);
        User globalAdmin = createAndSaveUser("GlobalAdmin", "globaladmin@example.com", Role.ADMIN);
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        String token = jwtService.generateToken(globalAdmin);

        mockMvc.perform(get("/api/workspaces/{workspaceId}", workspace.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You are not a member of this workspace"));
    }

    @Test
    @DisplayName("User with global ADMIN role who is WORKER cannot manage members")
    void globalAdmin_workerRoleCannotManageMembers() throws Exception {
        User owner = createAndSaveUser("Owner", "owner@example.com", Role.DEVELOPER);
        User globalAdmin = createAndSaveUser("GlobalAdmin", "globaladmin@example.com", Role.ADMIN);
        User target = createAndSaveUser("Target", "target@example.com", Role.DEVELOPER);
        Workspace workspace = createAndSaveWorkspace("HQ", owner);
        addMember(workspace, globalAdmin, WorkspaceRole.WORKER);
        String token = jwtService.generateToken(globalAdmin);

        mockMvc.perform(post("/api/workspaces/{workspaceId}/members", workspace.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "target@example.com"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You do not have permission to manage workspace members"));
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    private User createAndSaveUser(String name, String email) {
        return createAndSaveUser(name, email, Role.DEVELOPER);
    }

    private User createAndSaveUser(String name, String email, Role role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email.toLowerCase());
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(role);
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
