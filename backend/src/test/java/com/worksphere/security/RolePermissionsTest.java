package com.worksphere.security;

import com.worksphere.user.entity.Role;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RolePermissionsTest {

    @Test
    void adminHasEveryPermission() {
        assertThat(RolePermissions.forRole(Role.ADMIN)).containsExactlyInAnyOrder(Permission.values());
    }

    @Test
    void developerDoesNotHaveManageUsers() {
        assertThat(RolePermissions.forRole(Role.DEVELOPER)).doesNotContain(Permission.MANAGE_USERS);
        assertThat(RolePermissions.forRole(Role.DEVELOPER)).contains(Permission.CREATE_TASK, Permission.CREATE_ISSUE);
    }
}
