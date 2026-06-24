package com.example.bmi.service;

import com.example.bmi.dto.UserResponse;
import com.example.bmi.model.AppUser;
import com.example.bmi.repository.AppUserRepository;
import com.example.bmi.repository.BmiRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final AppUserRepository   userRepository;
    private final BmiRecordRepository bmiRecordRepository;

    public AdminService(AppUserRepository userRepository, BmiRecordRepository bmiRecordRepository) {
        this.userRepository      = userRepository;
        this.bmiRecordRepository = bmiRecordRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getRole().name()))
                .toList();
    }

    public void deleteUser(Long targetUserId, String requestingUsername) {
        AppUser target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        preventSelfDeletion(target, requestingUsername);

        bmiRecordRepository.deleteByUserId(target.getId());
        userRepository.delete(target);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private void preventSelfDeletion(AppUser target, String requestingUsername) {
        if (target.getUsername().equals(requestingUsername)) {
            throw new IllegalArgumentException("Admin cannot delete their own account");
        }
    }
}
