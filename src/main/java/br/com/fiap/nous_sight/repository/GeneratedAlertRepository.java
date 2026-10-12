package br.com.fiap.nous_sight.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.fiap.nous_sight.domain.TermCategory;
import br.com.fiap.nous_sight.domain.ValidationStatus;
import br.com.fiap.nous_sight.entity.GeneratedAlert;

public interface GeneratedAlertRepository extends JpaRepository<GeneratedAlert, Long> {

    List<GeneratedAlert> findByValidationStatus(ValidationStatus status);

    List<GeneratedAlert> findByTranscriptLine_Meeting_Id(Long meetingId);

    long countByTranscriptLine_Meeting_IdAndTerm_Category(Long meetingId, TermCategory category);

    boolean existsByTranscriptLine_IdAndTerm_Id(Long transcriptLineId, Long termId);

    boolean existsByTranscriptLine_IdAndTerm_IdAndIdNot(Long transcriptLineId, Long termId, Long id);

    boolean existsByTranscriptLine_Id(Long transcriptLineId);

    boolean existsByTerm_Id(Long termId);
}
