package br.com.fiap.nous_sight.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.fiap.nous_sight.domain.ValidationStatus;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private GeneratedAlertRepository repository;

    private AlertService service;

    @BeforeEach
    void setUp() {
        service = new AlertService(repository);
    }

    @Test
    void needsHumanValidation_returnsTrueForScoreBelow80() {
        GeneratedAlert alert = GeneratedAlert.builder().confidenceScore(68).build();
        assertTrue(service.needsHumanValidation(alert));
    }

    @Test
    void needsHumanValidation_returnsFalseForScore80OrAbove() {
        GeneratedAlert alert = GeneratedAlert.builder().confidenceScore(80).build();
        assertFalse(service.needsHumanValidation(alert));
    }

    @Test
    void registerHumanValidation_setsValidatedWhenConfirmed() {
        GeneratedAlert alert = GeneratedAlert.builder().id(1L).validationStatus(ValidationStatus.PENDING).build();
        when(repository.findById(1L)).thenReturn(Optional.of(alert));
        when(repository.save(any(GeneratedAlert.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GeneratedAlert result = service.registerHumanValidation(1L, true, null);

        assertEquals(ValidationStatus.VALIDATED, result.getValidationStatus());
        verify(repository).save(alert);
    }

    @Test
    void registerHumanValidation_setsCorrectedWithNoteWhenNotConfirmed() {
        GeneratedAlert alert = GeneratedAlert.builder().id(1L).validationStatus(ValidationStatus.PENDING).build();
        when(repository.findById(1L)).thenReturn(Optional.of(alert));
        when(repository.save(any(GeneratedAlert.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GeneratedAlert result = service.registerHumanValidation(1L, false, "Termo mal interpretado");

        assertEquals(ValidationStatus.CORRECTED, result.getValidationStatus());
        assertEquals("Termo mal interpretado", result.getNote());
    }

    @Test
    void registerHumanValidation_rejectsAlreadyValidatedAlert() {
        GeneratedAlert alert = GeneratedAlert.builder().id(1L).validationStatus(ValidationStatus.VALIDATED).build();
        when(repository.findById(1L)).thenReturn(Optional.of(alert));

        assertThrows(RuntimeException.class, () -> service.registerHumanValidation(1L, true, null));
        verify(repository, never()).save(any());
    }

    @Test
    void registerHumanValidation_throwsWhenAlertNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.registerHumanValidation(1L, true, null));
    }

    @Test
    void calculateAverageConfidenceScore_returnsAverageForMeeting() {
        List<GeneratedAlert> alerts = List.of(
                GeneratedAlert.builder().confidenceScore(60).build(),
                GeneratedAlert.builder().confidenceScore(90).build());
        when(repository.findByTranscriptLine_Meeting_Id(1L)).thenReturn(alerts);

        assertEquals(75.0, service.calculateAverageConfidenceScore(1L));
    }

    @Test
    void calculateAverageConfidenceScore_returnsZeroWhenNoAlerts() {
        when(repository.findByTranscriptLine_Meeting_Id(1L)).thenReturn(List.of());

        assertEquals(0.0, service.calculateAverageConfidenceScore(1L));
    }
}
