package br.com.fiap.nous_sight.entity;

import br.com.fiap.nous_sight.domain.TermCategory;
import br.com.fiap.nous_sight.domain.TermCategoryConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "DICIONARIO_TERMOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class DictionaryTerm {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seqDicionarioTermos")
    @SequenceGenerator(name = "seqDicionarioTermos", sequenceName = "SEQ_DICIONARIO_TERMOS", allocationSize = 1)
    @Column(name = "ID_TERMO")
    private Long id;

    @Column(name = "PALAVRA_CHAVE", nullable = false, unique = true, length = 50)
    private String keyword;

    @Convert(converter = TermCategoryConverter.class)
    @Column(name = "CATEGORIA", nullable = false, length = 30)
    private TermCategory category;
}
