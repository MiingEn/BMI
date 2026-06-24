package com.example.bmi.service;

import com.example.bmi.dto.PasswordUpdateRequest;
import com.example.bmi.dto.ProfileResponse;
import com.example.bmi.model.AppUser;
import com.example.bmi.repository.AppUserRepository;
import com.example.bmi.repository.BmiRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

    private final AppUserRepository   userRepository;
    private final BmiRecordRepository bmiRecordRepository;
    private final PasswordEncoder     passwordEncoder;

    public ProfileService(AppUserRepository   userRepository,
                          BmiRecordRepository bmiRecordRepository,
                          PasswordEncoder     passwordEncoder) {
        this.userRepository      = userRepository;
        this.bmiRecordRepository = bmiRecordRepository;
        this.passwordEncoder     = passwordEncoder;
    }

    public ProfileResponse getProfile(String username) {
        AppUser user     = findUserOrThrow(username);
        long totalRecords = bmiRecordRepository.countByUserUsername(username);
        return new ProfileResponse(user.getUsername(), user.getRole().name(), totalRecords);
    }

    public void updatePassword(String username, PasswordUpdateRequest request) {
        AppUser user = findUserOrThrow(username);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private AppUser findUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
