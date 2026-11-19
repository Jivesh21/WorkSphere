package com.worksphere.workspace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransferOwnershipRequest {

    @NotNull(message = "New owner member ID is required")
    private Long newOwnerMemberId;
}
