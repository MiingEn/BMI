package com.example.bmi.controller;

import com.example.bmi.dto.BmiRecordResponse;
import com.example.bmi.dto.UserResponse;
import com.example.bmi.service.AdminService;
import com.example.bmi.service.BmiService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final BmiService   bmiService;

    public AdminController(AdminService adminService, BmiService bmiService) {
        this.adminService = adminService;
        this.bmiService   = bmiService;
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @DeleteMapping("/users/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long userId, Authentication authentication) {
        adminService.deleteUser(userId, authentication.getName());
    }

    @GetMapping("/bmi")
    public List<BmiRecordResponse> getAllBmiRecords() {
        return bmiService.getAllRecords();
    }
}
