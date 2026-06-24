package com.example.bmi.controller;

import com.example.bmi.dto.PasswordUpdateRequest;
import com.example.bmi.dto.ProfileResponse;
import com.example.bmi.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ProfileResponse getProfile(Authentication authentication) {
        return profileService.getProfile(authentication.getName());
    }

    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updatePassword(@Valid @RequestBody PasswordUpdateRequest request,
                               Authentication authentication) {
        profileService.updatePassword(authentication.getName(), request);
    }
}
