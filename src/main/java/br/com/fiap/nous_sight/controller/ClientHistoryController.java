package br.com.fiap.nous_sight.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.fiap.nous_sight.service.ClientHistoryService;
import br.com.fiap.nous_sight.service.MeetingService;

@RestController
@RequestMapping("/clients")
public class ClientHistoryController {

    private final ClientHistoryService clientHistoryService;
    private final MeetingService meetingService;

    public ClientHistoryController(ClientHistoryService clientHistoryService, MeetingService meetingService) {
        this.clientHistoryService = clientHistoryService;
        this.meetingService = meetingService;
    }

    @GetMapping("/{id}/history/churn-risk")
    public ResponseEntity<?> churnRisk(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(clientHistoryService.calculateChurnRisk(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/history/summary")
    public ResponseEntity<?> summary(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(clientHistoryService.generateMeetingSummary(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
