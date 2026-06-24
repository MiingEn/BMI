package com.example.bmi.dto;

public class ProfileResponse {
    private String username;
    private String role;
    private long totalRecords;

    public ProfileResponse(String username, String role, long totalRecords) {
        this.username     = username;
        this.role         = role;
        this.totalRecords = totalRecords;
    }

    public String getUsername()    { return username; }
    public String getRole()        { return role; }
    public long getTotalRecords()  { return totalRecords; }
}
