package com.example.bmi.service;

import com.example.bmi.dto.BmiRecordResponse;
import com.example.bmi.dto.BmiRequest;
import com.example.bmi.model.AppUser;
import com.example.bmi.model.BmiRecord;
import com.example.bmi.repository.AppUserRepository;
import com.example.bmi.repository.BmiRecordRepository;
import com.example.bmi.util.BmiCalculator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class BmiService {

    private final BmiRecordRepository bmiRecordRepository;
    private final AppUserRepository   userRepository;

    public BmiService(BmiRecordRepository bmiRecordRepository, AppUserRepository userRepository) {
        this.bmiRecordRepository = bmiRecordRepository;
        this.userRepository      = userRepository;
    }

    public BmiRecordResponse createRecord(BmiRequest request, String username) {
        AppUser owner  = findUserOrThrow(username);
        BmiRecord record = buildRecord(owner, request);
        return toResponse(bmiRecordRepository.save(record));
    }

    public List<BmiRecordResponse> getFilteredHistory(String username, LocalDate from, LocalDate to) {
        Instant fromInstant = toStartOfDayUtc(from);
        Instant toInstant   = toExclusiveEndOfDayUtc(to);

        return bmiRecordRepository
                .findByUserUsernameOrderByCreatedAtDesc(username)
                .stream()
                .filter(r -> fromInstant == null || !r.getCreatedAt().isBefore(fromInstant))
                .filter(r -> toInstant   == null || r.getCreatedAt().isBefore(toInstant))
                .map(this::toResponse)
                .toList();
    }

    public BmiRecordResponse updateRecord(Long recordId, BmiRequest request, String username) {
        BmiRecord record = findRecordOwnedBy(recordId, username);
        applyMeasurements(record, request);
        return toResponse(bmiRecordRepository.save(record));
    }

    public void deleteRecord(Long recordId, String username) {
        BmiRecord record = findRecordOwnedBy(recordId, username);
        bmiRecordRepository.delete(record);
    }

    public List<BmiRecordResponse> getAllRecords() {
        return bmiRecordRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private AppUser findUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    private BmiRecord findRecordOwnedBy(Long recordId, String username) {
        BmiRecord record = bmiRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));

        if (!record.getUser().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return record;
    }

    private BmiRecord buildRecord(AppUser owner, BmiRequest request) {
        BmiRecord record = new BmiRecord();
        record.setUser(owner);
        record.setCreatedAt(Instant.now());
        applyMeasurements(record, request);
        return record;
    }

    /** Updates height, weight and the derived BMI on an existing record. */
    private void applyMeasurements(BmiRecord record, BmiRequest request) {
        record.setHeightCm(request.getHeightCm());
        record.setWeightKg(request.getWeightKg());
        record.setBmi(BmiCalculator.compute(request.getHeightCm(), request.getWeightKg()));
    }

    private static Instant toStartOfDayUtc(LocalDate date) {
        return date == null ? null : date.atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private static Instant toExclusiveEndOfDayUtc(LocalDate date) {
        return date == null ? null : date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private BmiRecordResponse toResponse(BmiRecord record) {
        return new BmiRecordResponse(
                record.getId(),
                record.getUser().getUsername(),
                record.getHeightCm(),
                record.getWeightKg(),
                record.getBmi(),
                record.getCreatedAt()
        );
    }
}
