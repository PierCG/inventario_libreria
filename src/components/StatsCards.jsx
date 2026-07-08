import { useStatsCards } from "../hooks/useStatsCards";

export default function StatsCards({ productos }) {
  const cards = useStatsCards(productos);

  return (
    <section className="stats-grid" aria-label="Metricas del inventario">
      {cards.map((card) => (
        <article className={`stat-card ${card.tone}`} key={card.label}>
          <span className="stat-label">{card.label}</span>
          <strong className="stat-value">{card.value}</strong>
          <span className={`trend-badge ${card.tone}`}>{card.change}</span>
        </article>
      ))}
    </section>
  );
}
