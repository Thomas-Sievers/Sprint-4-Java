package br.com.fiap.nous_sight.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.fiap.nous_sight.dto.AlertRequest;
import br.com.fiap.nous_sight.dto.AlertValidationRequest;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Alerts", description = "Terms detected in transcript lines, with confidence score and human validation")
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService service;

    public AlertController(AlertService service) {
        this.service = service;
    }

    @Operation(summary = "List all alerts")
    @GetMapping
    public List<GeneratedAlert> findAll() {
        return service.findAll();
    }

    @Operation(summary = "List alerts waiting for human validation", description = "Alerts with status PENDING (confidence score below 80)")
    @GetMapping("/pending")
    public List<GeneratedAlert> findPending() {
        return service.findPending();
    }

    @Operation(summary = "Find a alert by id")
    @GetMapping("/{id}")
    public GeneratedAlert findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @Operation(summary = "Create an alert", description = "The status is derived from the score: below 80 -> PENDING, otherwise VALIDATED. The same (transcript line, term) pair cannot have two alerts")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GeneratedAlert create(@RequestBody @Valid AlertRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Update an alert", description = "The validation status is never changed here; use POST /api/alerts/{id}/validate")
    @PutMapping("/{id}")
    public GeneratedAlert update(@PathVariable Long id, @RequestBody @Valid AlertRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a alert")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @Operation(summary = "Register the human validation of an alert", description = "Only PENDING alerts can be reviewed. confirmed = true -> VALIDATED; confirmed = false -> CORRECTED, and correctedNote is required")
    @PostMapping("/{id}/validate")
    public GeneratedAlert validate(@PathVariable Long id, @RequestBody @Valid AlertValidationRequest request) {
        return service.registerHumanValidation(id, request.confirmed(), request.correctedNote());
    }
}
