package com.clinic.api.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.dto.NewbornRecordRequest;
import com.clinic.api.dto.NewbornRecordResponse;
import com.clinic.api.service.NewbornRecordService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/maternity/newborn-records")
@CrossOrigin(origins = "http://localhost:5173")
public class NewbornRecordController {

    private final NewbornRecordService newbornRecordService;

    public NewbornRecordController(
            NewbornRecordService newbornRecordService
    ) {
        this.newbornRecordService = newbornRecordService;
    }

    // =========================================================
    // GET ALL NEWBORN RECORDS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<NewbornRecordResponse>> getAll() {

        return ResponseEntity.ok(
                newbornRecordService.getAll()
        );
    }

    // =========================================================
    // GET NEWBORN RECORD BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<NewbornRecordResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                newbornRecordService.getById(id)
        );
    }

    // =========================================================
    // GET NEWBORNS BY LABOUR RECORD
    // =========================================================

    @GetMapping("/labour/{labourRecordId}")
    public ResponseEntity<List<NewbornRecordResponse>> getByLabourRecord(
            @PathVariable Long labourRecordId
    ) {

        return ResponseEntity.ok(
                newbornRecordService.getByLabourRecord(
                        labourRecordId
                )
        );
    }

    // =========================================================
    // GET ACTIVE NEWBORNS BY LABOUR RECORD
    // =========================================================

    @GetMapping("/labour/{labourRecordId}/active")
    public ResponseEntity<List<NewbornRecordResponse>> getActiveByLabourRecord(
            @PathVariable Long labourRecordId
    ) {

        return ResponseEntity.ok(
                newbornRecordService.getActiveByLabourRecord(
                        labourRecordId
                )
        );
    }

    // =========================================================
    // CREATE NEWBORN RECORD
    // =========================================================

    @PostMapping
    public ResponseEntity<?> create(
            @Valid @RequestBody NewbornRecordRequest request
    ) {

        try {

            NewbornRecordResponse response =
                    newbornRecordService.create(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            ex.getMessage()
                    ));
        }
    }

    // =========================================================
    // UPDATE NEWBORN RECORD
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody NewbornRecordRequest request
    ) {

        try {

            NewbornRecordResponse response =
                    newbornRecordService.update(
                            id,
                            request
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            ex.getMessage()
                    ));
        }
    }

    // =========================================================
    // ARCHIVE NEWBORN RECORD
    // =========================================================

    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archive(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {

        try {

            newbornRecordService.archive(
                    id,
                    reason
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Newborn record archived successfully."
                    )
            );

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            ex.getMessage()
                    ));
        }
    }

    // =========================================================
    // COUNT NEWBORNS BY LABOUR RECORD
    // =========================================================

    @GetMapping("/labour/{labourRecordId}/count")
    public ResponseEntity<Map<String, Long>> countByLabourRecord(
            @PathVariable Long labourRecordId
    ) {

        long count =
                newbornRecordService.countByLabourRecord(
                        labourRecordId
                );

        return ResponseEntity.ok(
                Map.of("count", count)
        );
    }

    // =========================================================
    // COUNT ACTIVE NEWBORNS BY LABOUR RECORD
    // =========================================================

    @GetMapping("/labour/{labourRecordId}/active/count")
    public ResponseEntity<Map<String, Long>> countActiveByLabourRecord(
            @PathVariable Long labourRecordId
    ) {

        long count =
                newbornRecordService.countActiveByLabourRecord(
                        labourRecordId
                );

        return ResponseEntity.ok(
                Map.of("count", count)
        );
    }
}