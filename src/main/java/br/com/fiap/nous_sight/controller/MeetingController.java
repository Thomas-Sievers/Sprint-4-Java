package br.com.fiap.nous_sight.controller;

import java.util.List;
import java.util.Map;

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

import br.com.fiap.nous_sight.dto.MeetingParticipantRequest;
import br.com.fiap.nous_sight.dto.MeetingRequest;
import br.com.fiap.nous_sight.dto.MeetingSummaryDTO;
import br.com.fiap.nous_sight.dto.TranscriptAnalysisResult;
import br.com.fiap.nous_sight.dto.TranscriptRequest;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.Meeting;
import br.com.fiap.nous_sight.entity.MeetingParticipant;
import br.com.fiap.nous_sight.entity.TranscriptLine;
import br.com.fiap.nous_sight.service.AlertService;
import br.com.fiap.nous_sight.service.ClientHistoryService;
import br.com.fiap.nous_sight.service.MeetingParticipantService;
import br.com.fiap.nous_sight.service.MeetingService;
import br.com.fiap.nous_sight.service.TranscriptAnalysisService;
import br.com.fiap.nous_sight.service.TranscriptLineService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService service;
    private final MeetingParticipantService meetingParticipantService;
    private final TranscriptLineService transcriptLineService;
    private final TranscriptAnalysisService transcriptAnalysisService;
    private final AlertService alertService;
    private final ClientHistoryService clientHistoryService;

    public MeetingController(MeetingService service,
                             MeetingParticipantService meetingParticipantService,
                             TranscriptLineService transcriptLineService,
                             TranscriptAnalysisService transcriptAnalysisService,
                             AlertService alertService,
                             ClientHistoryService clientHistoryService) {
        this.service = service;
        this.meetingParticipantService = meetingParticipantService;
        this.transcriptLineService = transcriptLineService;
        this.transcriptAnalysisService = transcriptAnalysisService;
        this.alertService = alertService;
        this.clientHistoryService = clientHistoryService;
    }

    @GetMapping
    public List<Meeting> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Meeting findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Meeting create(@RequestBody @Valid MeetingRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public Meeting update(@PathVariable Long id, @RequestBody @Valid MeetingRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}/participants")
    public List<MeetingParticipant> findParticipants(@PathVariable Long id) {
        return meetingParticipantService.findByMeeting(id);
    }

    @PostMapping("/{id}/participants")
    @ResponseStatus(HttpStatus.CREATED)
    public MeetingParticipant addParticipant(@PathVariable Long id,
                                             @RequestBody @Valid MeetingParticipantRequest request) {
        return meetingParticipantService.add(id, request);
    }

    @DeleteMapping("/{id}/participants/{participantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeParticipant(@PathVariable Long id, @PathVariable Long participantId) {
        meetingParticipantService.remove(id, participantId);
    }

    @GetMapping("/{id}/transcript-lines")
    public List<TranscriptLine> findTranscriptLines(@PathVariable Long id) {
        return transcriptLineService.findByMeeting(id);
    }

    @PostMapping("/{id}/transcript")
    @ResponseStatus(HttpStatus.CREATED)
    public TranscriptAnalysisResult analyzeTranscript(@PathVariable Long id,
                                                      @RequestBody @Valid TranscriptRequest request) {
        return transcriptAnalysisService.analyze(id, request);
    }

    @GetMapping("/{id}/alerts")
    public List<GeneratedAlert> findAlerts(@PathVariable Long id) {
        return alertService.findByMeeting(id);
    }

    @GetMapping("/{id}/summary")
    public MeetingSummaryDTO summary(@PathVariable Long id) {
        return clientHistoryService.generateMeetingSummary(id);
    }

    @GetMapping("/{id}/churn-risk")
    public Map<String, Object> churnRisk(@PathVariable Long id) {
        return Map.of("meetingId", id, "churnRisk", clientHistoryService.calculateChurnRisk(id));
    }
}
