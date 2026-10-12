package br.com.fiap.nous_sight.service;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.fiap.nous_sight.domain.ValidationStatus;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;

@Service
public class AlertService {

    private static final int CONFIDENCE_THRESHOLD = 80;

    private final GeneratedAlertRepository repository;

    public AlertService(GeneratedAlertRepository repository) {
        this.repository = repository;
    }

    public boolean needsHumanValidation(GeneratedAlert alert) {
        return alert.getConfidenceScore() < CONFIDENCE_THRESHOLD;
    }

    public GeneratedAlert registerHumanValidation(Long alertId, boolean confirmed, String correctedNote) {
        GeneratedAlert alert = repository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));

        validate(alert);

        if (confirmed) {
            alert.setValidationStatus(ValidationStatus.VALIDATED);
        } else {
            alert.setValidationStatus(ValidationStatus.CORRECTED);
            alert.setNote(correctedNote);
        }

        return repository.save(alert);
    }

    public double calculateAverageConfidenceScore(Long meetingId) {
        List<GeneratedAlert> alerts = repository.findByTranscriptLine_Meeting_Id(meetingId);

        if (alerts.isEmpty()) {
            return 0;
        }

        return alerts.stream()
                .mapToInt(GeneratedAlert::getConfidenceScore)
                .average()
                .orElse(0);
    }

    public List<GeneratedAlert> list() {
        return repository.findAll();
    }

    public GeneratedAlert search(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + id));
    }

    public GeneratedAlert save(GeneratedAlert alert) {
        return repository.save(alert);
    }

    public GeneratedAlert update(Long id, GeneratedAlert alert) {
        GeneratedAlert existing = search(id);
        existing.setTranscriptLine(alert.getTranscriptLine());
        existing.setTerm(alert.getTerm());
        existing.setNote(alert.getNote());
        existing.setConfidenceScore(alert.getConfidenceScore());
        existing.setValidationStatus(alert.getValidationStatus());
        return repository.save(existing);
    }

    public void delete(Long id) {
        search(id);
        repository.deleteById(id);
    }

    private void validate(GeneratedAlert alert) {
        validateNotAlreadyValidated(alert);
    }

    private void validateNotAlreadyValidated(GeneratedAlert alert) {
        if (alert.getValidationStatus() != ValidationStatus.PENDING) {
            throw new RuntimeException("Alert has already been validated: " + alert.getId());
        }
    }
}
