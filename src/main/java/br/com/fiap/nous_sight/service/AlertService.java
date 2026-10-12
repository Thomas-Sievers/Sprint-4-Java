package br.com.fiap.nous_sight.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.nous_sight.domain.ValidationStatus;
import br.com.fiap.nous_sight.dto.AlertRequest;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.exception.BusinessException;
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;

@Service
public class AlertService {

    private static final int CONFIDENCE_THRESHOLD = 80;

    private final GeneratedAlertRepository repository;
    private final TranscriptLineService transcriptLineService;
    private final DictionaryTermService dictionaryTermService;
    private final MeetingService meetingService;

    public AlertService(GeneratedAlertRepository repository,
                        TranscriptLineService transcriptLineService,
                        DictionaryTermService dictionaryTermService,
                        MeetingService meetingService) {
        this.repository = repository;
        this.transcriptLineService = transcriptLineService;
        this.dictionaryTermService = dictionaryTermService;
        this.meetingService = meetingService;
    }

    // 4.1 - insights below 80% confidence go to human validation
    public boolean needsHumanValidation(GeneratedAlert alert) {
        return alert.getConfidenceScore() < CONFIDENCE_THRESHOLD;
    }

    // 4.2 - only PENDING alerts can be reviewed
    @Transactional
    public GeneratedAlert registerHumanValidation(Long alertId, boolean confirmed, String correctedNote) {
        GeneratedAlert alert = findById(alertId);
        validateIsPending(alert);

        if (confirmed) {
            alert.setValidationStatus(ValidationStatus.VALIDATED);
        } else {
            validateCorrectedNote(correctedNote);
            alert.setValidationStatus(ValidationStatus.CORRECTED);
            alert.setNote(correctedNote);
        }
        return repository.save(alert);
    }

    // 4.3 - average confidence of the alerts of a meeting (0 when there are none)
    @Transactional(readOnly = true)
    public double calculateAverageConfidenceScore(Long meetingId) {
        return repository.findByTranscriptLine_Meeting_Id(meetingId).stream()
                .mapToInt(GeneratedAlert::getConfidenceScore)
                .average()
                .orElse(0);
    }

    @Transactional(readOnly = true)
    public List<GeneratedAlert> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public GeneratedAlert findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<GeneratedAlert> findPending() {
        return repository.findByValidationStatus(ValidationStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<GeneratedAlert> findByMeeting(Long meetingId) {
        meetingService.findById(meetingId);
        return repository.findByTranscriptLine_Meeting_Id(meetingId);
    }

    @Transactional
    public GeneratedAlert create(AlertRequest request) {
        if (repository.existsByTranscriptLine_IdAndTerm_Id(request.transcriptLineId(), request.termId())) {
            throw duplicateAlert(request);
        }
        GeneratedAlert alert = new GeneratedAlert();
        fill(alert, request);
        alert.setValidationStatus(needsHumanValidation(alert) ? ValidationStatus.PENDING : ValidationStatus.VALIDATED);
        return repository.save(alert);
    }

    // The status is never changed here: it only moves through registerHumanValidation
    @Transactional
    public GeneratedAlert update(Long id, AlertRequest request) {
        GeneratedAlert alert = findById(id);
        if (repository.existsByTranscriptLine_IdAndTerm_IdAndIdNot(request.transcriptLineId(), request.termId(), id)) {
            throw duplicateAlert(request);
        }
        fill(alert, request);
        return repository.save(alert);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(findById(id));
    }

    private void validateIsPending(GeneratedAlert alert) {
        if (alert.getValidationStatus() != ValidationStatus.PENDING) {
            throw new BusinessException("Only PENDING alerts can be reviewed; alert " + alert.getId()
                    + " is " + alert.getValidationStatus());
        }
    }

    private void validateCorrectedNote(String correctedNote) {
        if (correctedNote == null || correctedNote.isBlank()) {
            throw new BusinessException("correctedNote is required when the alert is not confirmed");
        }
    }

    private BusinessException duplicateAlert(AlertRequest request) {
        return new BusinessException("Transcript line " + request.transcriptLineId()
                + " already has an alert for term " + request.termId());
    }

    private void fill(GeneratedAlert alert, AlertRequest request) {
        alert.setTranscriptLine(transcriptLineService.findById(request.transcriptLineId()));
        alert.setTerm(dictionaryTermService.findById(request.termId()));
        alert.setNote(request.note());
        alert.setConfidenceScore(request.confidenceScore());
    }
}
