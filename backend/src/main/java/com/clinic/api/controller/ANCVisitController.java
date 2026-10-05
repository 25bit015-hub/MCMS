package com.clinic.api.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.dto.ANCVisitRequest;
import com.clinic.api.dto.ANCVisitResponse;
import com.clinic.api.service.ANCVisitService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/maternity/anc-visits")
@CrossOrigin(origins = "http://localhost:5173")
public class ANCVisitController {

    private final ANCVisitService ancVisitService;

    public ANCVisitController(ANCVisitService ancVisitService) {
        this.ancVisitService = ancVisitService;
    }

    // ============================================================
    // HANDLE DUPLICATE / BUSINESS RULE ANC ERRORS
    // ============================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
            IllegalArgumentException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "message",
                        ex.getMessage()
                ));
    }

    // ============================================================
    // GET ALL ANC VISITS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<ANCVisitResponse>> getAllVisits() {

        return ResponseEntity.ok(
                ancVisitService.getAllVisits()
        );
    }

    // ============================================================
    // GET ANC VISIT BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<ANCVisitResponse> getVisitById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ancVisitService.getVisitById(id)
        );
    }

    // ============================================================
    // GET ALL VISITS FOR A PREGNANCY
    // ============================================================

    @GetMapping("/pregnancy/{pregnancyId}")
    public ResponseEntity<List<ANCVisitResponse>> getVisitsByPregnancy(
            @PathVariable Long pregnancyId
    ) {

        return ResponseEntity.ok(
                ancVisitService.getVisitsByPregnancy(
                        pregnancyId
                )
        );
    }

    // ============================================================
    // GET ACTIVE VISITS FOR A PREGNANCY
    // ============================================================

    @GetMapping("/pregnancy/{pregnancyId}/active")
    public ResponseEntity<List<ANCVisitResponse>> getActiveVisitsByPregnancy(
            @PathVariable Long pregnancyId
    ) {

        return ResponseEntity.ok(
                ancVisitService.getActiveVisitsByPregnancy(
                        pregnancyId
                )
        );
    }

    // ============================================================
    // GET VISITS BY DATE
    // ============================================================

    @GetMapping("/date/{visitDate}")
    public ResponseEntity<List<ANCVisitResponse>> getVisitsByDate(
            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate visitDate
    ) {

        return ResponseEntity.ok(
                ancVisitService.getVisitsByDate(
                        visitDate
                )
        );
    }

    // ============================================================
    // GET VISITS BETWEEN TWO DATES
    // ============================================================

    @GetMapping("/date-range")
    public ResponseEntity<List<ANCVisitResponse>> getVisitsBetweenDates(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {

        return ResponseEntity.ok(
                ancVisitService.getVisitsBetweenDates(
                        startDate,
                        endDate
                )
        );
    }

    // ============================================================
    // CREATE NEW ANC VISIT
    // ============================================================

    @PostMapping
    public ResponseEntity<ANCVisitResponse> createVisit(
            @Valid @RequestBody ANCVisitRequest request
    ) {

        ANCVisitResponse createdVisit =
                ancVisitService.createVisit(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdVisit);
    }

    // ============================================================
    // UPDATE EXISTING ANC VISIT
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<ANCVisitResponse> updateVisit(
            @PathVariable Long id,
            @Valid @RequestBody ANCVisitRequest request
    ) {

        return ResponseEntity.ok(
                ancVisitService.updateVisit(
                        id,
                        request
                )
        );
    }

    // ============================================================
    // ARCHIVE ANC VISIT
    // ============================================================

    @PutMapping("/{id}/archive")
    public ResponseEntity<ANCVisitResponse> archiveVisit(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {

        return ResponseEntity.ok(
                ancVisitService.archiveVisit(
                        id,
                        reason
                )
        );
    }

    // ============================================================
    // COUNT ALL VISITS FOR A PREGNANCY
    // ============================================================

    @GetMapping("/pregnancy/{pregnancyId}/count")
    public ResponseEntity<Long> countVisitsByPregnancy(
            @PathVariable Long pregnancyId
    ) {

        return ResponseEntity.ok(
                ancVisitService.countVisitsByPregnancy(
                        pregnancyId
                )
        );
    }

    // ============================================================
    // COUNT ACTIVE VISITS FOR A PREGNANCY
    // ============================================================

    @GetMapping("/pregnancy/{pregnancyId}/active/count")
    public ResponseEntity<Long> countActiveVisitsByPregnancy(
            @PathVariable Long pregnancyId
    ) {

        return ResponseEntity.ok(
                ancVisitService.countActiveVisitsByPregnancy(
                        pregnancyId
                )
        );
    }
}