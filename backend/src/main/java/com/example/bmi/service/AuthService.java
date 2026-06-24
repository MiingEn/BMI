package com.example.bmi.service;

import com.example.bmi.dto.AuthRequest;
import com.example.bmi.dto.AuthResponse;
import com.example.bmi.model.AppUser;
import com.example.bmi.model.Role;
import com.example.bmi.repository.AppUserRepository;
import com.example.bmi.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "Invalid credentials";

    private final AppUserRepository userRepository;
    private final PasswordEncoder   passwordEncoder;
    private final JwtService        jwtService;

    public AuthService(AppUserRepository userRepository,
                       PasswordEncoder   passwordEncoder,
                       JwtService        jwtService) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService      = jwtService;
    }

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        AppUser newUser = createUser(request.getUsername(), request.getPassword());
        userRepository.save(newUser);
        return buildAuthResponse(newUser);
    }

    public AuthResponse login(AuthRequest request) {
        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }
        return buildAuthResponse(user);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private AppUser createUser(String username, String rawPassword) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.ROLE_USER);
        return user;
    }

    private AuthResponse buildAuthResponse(AppUser user) {
        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }
}
