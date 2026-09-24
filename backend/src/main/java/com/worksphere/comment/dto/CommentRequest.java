package com.worksphere.comment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequest {

    private String content;

    private Long userId;

    private Long taskId;

    private Long issueId;
}
