package br.com.fiap.nous_sight.entity;

import jakarta.persistence.Column;
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
@Table(name = "DEPARTAMENTO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seqDepartamento")
    @SequenceGenerator(name = "seqDepartamento", sequenceName = "SEQ_DEPARTAMENTO", allocationSize = 1)
    @Column(name = "ID_DEPARTAMENTO")
    private Long id;

    @Column(name = "NOME_DEPARTAMENTO", nullable = false, length = 50)
    private String departmentName;

    @Column(name = "SIGLA", unique = true, length = 10)
    private String acronym;
}
