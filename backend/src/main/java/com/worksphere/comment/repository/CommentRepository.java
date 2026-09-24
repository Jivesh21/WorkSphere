package com.worksphere.comment.repository;

import com.worksphere.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository
        extends JpaRepository<Comment, Long> {

    List<Comment> findByTaskId(Long taskId);

    List<Comment> findByIssueId(Long issueId);

    List<Comment> findByUserId(Long userId);
}
