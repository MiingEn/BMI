package com.example.bmi.controller;

import com.example.bmi.dto.BmiRecordResponse;
import com.example.bmi.dto.BmiRequest;
import com.example.bmi.service.BmiService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bmi")
public class BmiController {

    private final BmiService bmiService;

    public BmiController(BmiService bmiService) {
        this.bmiService = bmiService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BmiRecordResponse create(
            @Valid @RequestBody BmiRequest request,
            Authentication authentication) {
        return bmiService.createRecord(request, authentication.getName());
    }

    @GetMapping("/history")
    public List<BmiRecordResponse> getHistory(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return bmiService.getFilteredHistory(authentication.getName(), from, to);
    }

    @PutMapping("/{recordId}")
    public BmiRecordResponse update(
            @PathVariable Long recordId,
            @Valid @RequestBody BmiRequest request,
            Authentication authentication) {
        return bmiService.updateRecord(recordId, request, authentication.getName());
    }

    @DeleteMapping("/{recordId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long recordId,
            Authentication authentication) {
        bmiService.deleteRecord(recordId, authentication.getName());
    }
}
