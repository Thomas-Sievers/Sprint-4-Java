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

import br.com.fiap.nous_sight.dto.ParticipantRequest;
import br.com.fiap.nous_sight.entity.Participant;
import br.com.fiap.nous_sight.service.ParticipantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Participants", description = "People who take part in the monitored meetings")
@RequestMapping("/api/participants")
public class ParticipantController {

    private final ParticipantService service;

    public ParticipantController(ParticipantService service) {
        this.service = service;
    }

    @Operation(summary = "List all participants")
    @GetMapping
    public List<Participant> findAll() {
        return service.findAll();
    }

    @Operation(summary = "Find a participant by id")
    @GetMapping("/{id}")
    public Participant findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @Operation(summary = "Create a participant", description = "The email must be unique (case-insensitive) and the department must exist")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Participant create(@RequestBody @Valid ParticipantRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Update a participant", description = "The email must be unique (case-insensitive) and the department must exist")
    @PutMapping("/{id}")
    public Participant update(@PathVariable Long id, @RequestBody @Valid ParticipantRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a participant", description = "A participant who has transcript lines or is linked to a meeting cannot be deleted")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
