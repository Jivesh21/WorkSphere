package com.worksphere.comment.controller;

import com.worksphere.comment.dto.CommentRequest;
import com.worksphere.comment.dto.CommentResponse;
import com.worksphere.comment.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @RequestBody CommentRequest request) {

        CommentResponse response =
                commentService.createComment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getAllComments() {

        return ResponseEntity.ok(
                commentService.getAllComments()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<CommentResponse> getCommentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                commentService.getCommentById(id)
        );
    }

    // GET TASK COMMENTS
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByTask(
            @PathVariable Long taskId) {

        return ResponseEntity.ok(
                commentService.getCommentsByTask(taskId)
        );
    }

    // GET ISSUE COMMENTS
    @GetMapping("/issue/{issueId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByIssue(
            @PathVariable Long issueId) {

        return ResponseEntity.ok(
                commentService.getCommentsByIssue(issueId)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @RequestBody CommentRequest request) {

        return ResponseEntity.ok(
                commentService.updateComment(id, request)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id) {

        commentService.deleteComment(id);

        return ResponseEntity.noContent().build();
    }
}
