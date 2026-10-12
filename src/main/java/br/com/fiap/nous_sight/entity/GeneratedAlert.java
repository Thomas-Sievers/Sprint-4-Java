package br.com.fiap.nous_sight.entity;

import br.com.fiap.nous_sight.domain.ValidationStatus;
import br.com.fiap.nous_sight.domain.ValidationStatusConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "ALERTA_GERADO",
        uniqueConstraints = @UniqueConstraint(name = "UK_ALERTA_TRANSCRICAO_TERMO",
                columnNames = {"ID_TRANSCRICAO", "ID_TERMO"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class GeneratedAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seqAlertaGerado")
    @SequenceGenerator(name = "seqAlertaGerado", sequenceName = "SEQ_ALERTA_GERADO", allocationSize = 1)
    @Column(name = "ID_ALERTA")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ID_TRANSCRICAO", nullable = false)
    private TranscriptLine transcriptLine;

    @ManyToOne
    @JoinColumn(name = "ID_TERMO", nullable = false)
    private DictionaryTerm term;

    @Column(name = "OBSERVACAO", length = 200)
    private String note;

    @Column(name = "SCORE_CONFIANCA", nullable = false)
    private Integer confidenceScore; // 0–100

    @Convert(converter = ValidationStatusConverter.class)
    @Column(name = "STATUS_VALIDACAO", nullable = false, length = 15)
    private ValidationStatus validationStatus;
}
