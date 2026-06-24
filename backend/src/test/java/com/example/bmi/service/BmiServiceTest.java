package com.example.bmi.service;

import com.example.bmi.dto.BmiRecordResponse;
import com.example.bmi.dto.BmiRequest;
import com.example.bmi.model.AppUser;
import com.example.bmi.model.BmiRecord;
import com.example.bmi.repository.AppUserRepository;
import com.example.bmi.repository.BmiRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BmiServiceTest {

    @Mock
    private BmiRecordRepository bmiRecordRepository;

    @Mock
    private AppUserRepository appUserRepository;

    private BmiService bmiService;

    @BeforeEach
    void setUp() {
        bmiService = new BmiService(
                bmiRecordRepository,
                appUserRepository
        );
    }

    @Test
    void calculateAndSaveShouldCalculateCorrectBmi() {
        AppUser user = new AppUser();
        user.setUsername("heng");

        BmiRequest request = new BmiRequest();
        request.setHeightCm(170.0);
        request.setWeightKg(70.0);

        when(appUserRepository.findByUsername("heng"))
                .thenReturn(Optional.of(user));

        when(bmiRecordRepository.save(any(BmiRecord.class)))
                .thenAnswer(invocation -> {
                    BmiRecord record = invocation.getArgument(0);
                    record.setId(1L);
                    return record;
                });

        BmiRecordResponse response =
                bmiService.createRecord(request, "heng");

        assertEquals(1L, response.getId());
        assertEquals("heng", response.getUsername());
        assertEquals(170.0, response.getHeightCm());
        assertEquals(70.0, response.getWeightKg());
        assertEquals(24.22, response.getBmi());
    }

    @Test
    void updateRecordShouldReturnNotFoundWhenRecordDoesNotExist() {
        BmiRequest request = new BmiRequest();
        request.setHeightCm(170.0);
        request.setWeightKg(70.0);

        when(bmiRecordRepository.findById(99L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> bmiService.updateRecord(
                                99L,
                                request,
                                "heng"
                        )
                );

        assertEquals(
                HttpStatus.NOT_FOUND,
                exception.getStatusCode()
        );

        assertEquals(
                "Record not found",
                exception.getReason()
        );
    }

    @Test
    void deleteRecordShouldRejectAnotherUsersRecord() {
        AppUser owner = new AppUser();
        owner.setUsername("owner");

        BmiRecord record = new BmiRecord();
        record.setId(1L);
        record.setUser(owner);

        when(bmiRecordRepository.findById(1L))
                .thenReturn(Optional.of(record));

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> bmiService.deleteRecord(
                                1L,
                                "heng"
                        )
                );

        assertEquals(
                HttpStatus.FORBIDDEN,
                exception.getStatusCode()
        );

        assertEquals(
                "Access denied",
                exception.getReason()
        );

        verify(bmiRecordRepository, never())
                .delete(any(BmiRecord.class));
    }
}