package com.example.bmi.dto;

import java.time.Instant;

public class BmiRecordResponse {
    private Long id;
    private String username;
    private double heightCm;
    private double weightKg;
    private double bmi;
    private Instant createdAt;

    public BmiRecordResponse(Long id, String username, double heightCm, double weightKg, double bmi, Instant createdAt) {
        this.id = id;
        this.username = username;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
        this.bmi = bmi;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public double getHeightCm() { return heightCm; }
    public double getWeightKg() { return weightKg; }
    public double getBmi() { return bmi; }
    public Instant getCreatedAt() { return createdAt; }
}
