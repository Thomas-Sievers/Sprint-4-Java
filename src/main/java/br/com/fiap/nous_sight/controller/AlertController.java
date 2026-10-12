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
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService service;

    public AlertController(AlertService service) {
        this.service = service;
    }

    @GetMapping
    public List<GeneratedAlert> findAll() {
        return service.findAll();
    }

    @GetMapping("/pending")
    public List<GeneratedAlert> findPending() {
        return service.findPending();
    }

    @GetMapping("/{id}")
    public GeneratedAlert findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GeneratedAlert create(@RequestBody @Valid AlertRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public GeneratedAlert update(@PathVariable Long id, @RequestBody @Valid AlertRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/{id}/validate")
    public GeneratedAlert validate(@PathVariable Long id, @RequestBody @Valid AlertValidationRequest request) {
        return service.registerHumanValidation(id, request.confirmed(), request.correctedNote());
    }
}
