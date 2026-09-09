package com.worksphere.security;

import com.worksphere.user.entity.Role;

import java.util.Collections;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Central mapping from roles to permissions.
 * Future Team/Project services should authorize with
 * {@code @PreAuthorize("hasAuthority('CREATE_PROJECT')")} (or similar)
 * rather than hardcoding role names.
 */
public final class RolePermissions {

    private static final Map<Role, Set<Permission>> PERMISSIONS_BY_ROLE = new EnumMap<>(Role.class);

    static {
        PERMISSIONS_BY_ROLE.put(Role.ADMIN, EnumSet.allOf(Permission.class));
        PERMISSIONS_BY_ROLE.put(Role.PROJECT_MANAGER, EnumSet.of(
                Permission.CREATE_PROJECT,
                Permission.UPDATE_PROJECT,
                Permission.DELETE_PROJECT,
                Permission.MANAGE_TEAM,
                Permission.CREATE_TASK,
                Permission.ASSIGN_TASK,
                Permission.CREATE_ISSUE,
                Permission.RESOLVE_ISSUE,
                Permission.VIEW_ANALYTICS
        ));
        PERMISSIONS_BY_ROLE.put(Role.TEAM_LEAD, EnumSet.of(
                Permission.MANAGE_TEAM,
                Permission.CREATE_TASK,
                Permission.ASSIGN_TASK,
                Permission.CREATE_ISSUE,
                Permission.RESOLVE_ISSUE
        ));
        PERMISSIONS_BY_ROLE.put(Role.DEVELOPER, EnumSet.of(
                Permission.CREATE_TASK,
                Permission.CREATE_ISSUE
        ));
        PERMISSIONS_BY_ROLE.put(Role.QA, EnumSet.of(
                Permission.CREATE_ISSUE,
                Permission.RESOLVE_ISSUE,
                Permission.VIEW_ANALYTICS
        ));
    }

    private RolePermissions() {
    }

    public static Set<Permission> forRole(Role role) {
        Set<Permission> permissions = PERMISSIONS_BY_ROLE.get(role);
        return permissions == null ? Collections.emptySet() : Collections.unmodifiableSet(permissions);
    }
}
