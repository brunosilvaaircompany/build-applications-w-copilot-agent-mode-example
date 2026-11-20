import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useCapabilityData } from '../api/useCapabilityData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type?: string; minutes?: number; points?: number };
const activityNames: Record<string, string> = { run: 'Corrida', walk: 'Caminhada', cycle: 'Ciclismo', strength: 'Força' };

export default function Activities() {
  const load = useCallback(async () => {
    const response = await getJson<{ activities: Activity[] }>('/api/activities');
    return response.activities;
  }, []);
  const { items, loading, hasError } = useCapabilityData(load);

  return <CapabilityCard<Activity>
    title="Atividades"
    description="Acompanhe os minutos de atividade e os pontos das pessoas participantes."
    items={items}
    loading={loading}
    hasError={hasError}
    emptyMessage="Sem atividades registradas."
    renderItem={(activity) => <><h3 className="h5">{activityNames[activity.type ?? ''] ?? activity.type ?? 'Atividade'}</h3><p>{activity.minutes ?? 0} minutos · {activity.points ?? 0} pontos</p></>}
  />;
}
