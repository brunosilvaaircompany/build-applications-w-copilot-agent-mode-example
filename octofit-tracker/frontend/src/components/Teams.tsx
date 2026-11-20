import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useCapabilityData } from '../api/useCapabilityData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name?: string; mascot?: string; members?: unknown[] };

export default function Teams() {
  const load = useCallback(async () => {
    const response = await getJson<{ teams: Team[] }>('/api/teams');
    return response.teams;
  }, []);
  const { items, loading, hasError } = useCapabilityData(load);

  return <CapabilityCard<Team>
    title="Equipes"
    description="Gerencie equipes e integrantes."
    items={items}
    loading={loading}
    hasError={hasError}
    emptyMessage="Sem equipes cadastradas."
    renderItem={(team) => <><h3 className="h5">{team.name ?? 'Equipe'}</h3><p>Mascote: {team.mascot ?? 'Não informada'} · {team.members?.length ?? 0} integrantes</p></>}
  />;
}
