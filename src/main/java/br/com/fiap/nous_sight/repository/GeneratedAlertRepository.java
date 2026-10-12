package br.com.fiap.nous_sight.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.fiap.nous_sight.domain.TermCategory;
import br.com.fiap.nous_sight.domain.ValidationStatus;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.Meeting;

public interface GeneratedAlertRepository extends JpaRepository<GeneratedAlert, Long> {

    List<GeneratedAlert> findByValidationStatus(ValidationStatus status);

    List<GeneratedAlert> findByTerm_CategoryAndTranscriptLine_Meeting(TermCategory category, Meeting meeting);

    List<GeneratedAlert> findByTranscriptLine_Meeting_Id(Long meetingId);
}
