package edu.projecte.jaquemate.api_rest_jaquemate.model.db;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "jugadas")
public class Jugadas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "move_san", columnDefinition = "TEXT")
    private String moveSan;

    @Column(name = "move_uci_from", columnDefinition = "TEXT")
    private String moveUciFrom;

    @Column(name = "move_uci_to", columnDefinition = "TEXT")
    private String moveUciTo;

    @Column(columnDefinition = "TEXT")
    private String fen;

    @Column(columnDefinition = "TEXT")
    private String pgn;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
