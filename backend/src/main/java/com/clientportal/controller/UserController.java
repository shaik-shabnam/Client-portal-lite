package com.clientportal.controller;

import com.clientportal.dto.ApiResponse;
import com.clientportal.dto.UserDto;
import com.clientportal.entity.User;
import com.clientportal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMe(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(UserDto.from(currentUser)));
    }

    @GetMapping("/clients")
    public ResponseEntity<ApiResponse<List<UserDto>>> getClients() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllClients()));
    }

    @GetMapping("/admins")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAdmins() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllAdmins()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAll()));
    }
}
