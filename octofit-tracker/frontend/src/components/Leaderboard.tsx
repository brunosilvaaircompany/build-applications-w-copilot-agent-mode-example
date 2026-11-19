import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useCapabilityData } from '../api/useCapabilityData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName?: string; totalPoints?: number; rank?: number };

export default function Leaderboard() {
  const load = useCallback(async () => {
    const response = await getJson<{ leaderboard: Entry[] }>('/api/leaderboard');
    return response.leaderboard;
  }, []);
  const { items, loading, hasError } = useCapabilityData(load);

  return <CapabilityCard<Entry>
    title="Placar"
    description="Compare a pontuação total das equipes."
    items={items}
    loading={loading}
    hasError={hasError}
    emptyMessage="Sem classificação no placar."
    renderItem={(entry) => <><h3 className="h5">{entry.rank ?? '-'}º lugar: {entry.teamName ?? 'Equipe'}</h3><p>{entry.totalPoints ?? 0} pontos</p></>}
  />;
}
