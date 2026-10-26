{
  /* Rejilla de Tarjetas de Participantes en flujo normal */
}
<div className="cards-grid">
  {participants.map((p) => {
    const rankBadge = getBadgeRank(p.id);
    return (
      <div
        key={p.id}
        className={`voting-card ${rankBadge ? "selected" : ""}`}
        onClick={() => handleCardClick(p.id)}
      >
        <div className="card-photo-wrapper">
          <img src={p.photoURL} alt={p.name} className="card-photo" />
          {rankBadge && <div className="rank-badge">{rankBadge}</div>}
        </div>
        <span className="card-name">{p.name}</span>
      </div>
    );
  })}
</div>;
