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
import br.com.fiap.nous_sight.dto.AlertRequest;
import br.com.fiap.nous_sight.entity.DictionaryTerm;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.TranscriptLine;
import br.com.fiap.nous_sight.exception.BusinessException;
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private GeneratedAlertRepository repository;

    @Mock
    private TranscriptLineService transcriptLineService;

    @Mock
    private DictionaryTermService dictionaryTermService;

    @Mock
    private MeetingService meetingService;

    private AlertService service;

    @BeforeEach
    void setUp() {
        service = new AlertService(repository, transcriptLineService, dictionaryTermService, meetingService);
    }

    private void mockLineAndTerm() {
        when(transcriptLineService.findById(1L)).thenReturn(TranscriptLine.builder().id(1L).build());
        when(dictionaryTermService.findById(2L)).thenReturn(DictionaryTerm.builder().id(2L).build());
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

        GeneratedAlert result = service.registerHumanValidation(1L, false, "Term misinterpreted");

        assertEquals(ValidationStatus.CORRECTED, result.getValidationStatus());
        assertEquals("Term misinterpreted", result.getNote());
    }

    @Test
    void registerHumanValidation_requiresCorrectedNoteWhenNotConfirmed() {
        GeneratedAlert alert = GeneratedAlert.builder().id(1L).validationStatus(ValidationStatus.PENDING).build();
        when(repository.findById(1L)).thenReturn(Optional.of(alert));

        assertThrows(BusinessException.class, () -> service.registerHumanValidation(1L, false, " "));
        verify(repository, never()).save(any());
    }

    @Test
    void registerHumanValidation_rejectsAlreadyValidatedAlert() {
        GeneratedAlert alert = GeneratedAlert.builder().id(1L).validationStatus(ValidationStatus.VALIDATED).build();
        when(repository.findById(1L)).thenReturn(Optional.of(alert));

        assertThrows(BusinessException.class, () -> service.registerHumanValidation(1L, true, null));
        verify(repository, never()).save(any());
    }

    @Test
    void registerHumanValidation_rejectsAlreadyCorrectedAlert() {
        GeneratedAlert alert = GeneratedAlert.builder().id(1L).validationStatus(ValidationStatus.CORRECTED).build();
        when(repository.findById(1L)).thenReturn(Optional.of(alert));

        assertThrows(BusinessException.class, () -> service.registerHumanValidation(1L, false, "New note"));
        verify(repository, never()).save(any());
    }

    @Test
    void registerHumanValidation_throwsWhenAlertNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.registerHumanValidation(1L, true, null));
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

    @Test
    void create_setsPendingWhenScoreBelow80() {
        mockLineAndTerm();
        when(repository.save(any(GeneratedAlert.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GeneratedAlert result = service.create(new AlertRequest(1L, 2L, "note", 79));

        assertEquals(ValidationStatus.PENDING, result.getValidationStatus());
    }

    @Test
    void create_setsValidatedWhenScore80OrAbove() {
        mockLineAndTerm();
        when(repository.save(any(GeneratedAlert.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GeneratedAlert result = service.create(new AlertRequest(1L, 2L, "note", 80));

        assertEquals(ValidationStatus.VALIDATED, result.getValidationStatus());
    }

    @Test
    void create_rejectsDuplicateLineAndTerm() {
        when(repository.existsByTranscriptLine_IdAndTerm_Id(1L, 2L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> service.create(new AlertRequest(1L, 2L, "note", 90)));
        verify(repository, never()).save(any());
    }

    @Test
    void update_keepsValidationStatus() {
        GeneratedAlert alert = GeneratedAlert.builder().id(5L).confidenceScore(65)
                .validationStatus(ValidationStatus.PENDING).build();
        when(repository.findById(5L)).thenReturn(Optional.of(alert));
        mockLineAndTerm();
        when(repository.save(any(GeneratedAlert.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GeneratedAlert result = service.update(5L, new AlertRequest(1L, 2L, "new note", 99));

        assertEquals(99, result.getConfidenceScore());
        assertEquals(ValidationStatus.PENDING, result.getValidationStatus());
    }

    @Test
    void findPending_returnsOnlyPendingAlerts() {
        List<GeneratedAlert> pending = List.of(GeneratedAlert.builder().id(5L).build());
        when(repository.findByValidationStatus(ValidationStatus.PENDING)).thenReturn(pending);

        assertEquals(pending, service.findPending());
    }
}
