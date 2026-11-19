import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useCapabilityData } from '../api/useCapabilityData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title?: string; reason?: string; focus?: string };

export default function Workouts() {
  const load = useCallback(async () => {
    const response = await getJson<{ suggestions: Workout[] }>('/api/workouts/suggestions/mona%40example.com');
    return response.suggestions;
  }, []);
  const { items, loading, hasError } = useCapabilityData(load);

  return <CapabilityCard<Workout>
    title="Sugestões de treino"
    description="Receba recomendações de treino com base nos seus padrões de atividade."
    items={items}
    loading={loading}
    hasError={hasError}
    emptyMessage="Sem sugestões de treino."
    renderItem={(workout) => <><h3 className="h5">{workout.title ?? 'Treino'}</h3><p>{workout.reason ?? 'Sugestão baseada no seu perfil.'}</p>{workout.focus && <p>Foco: {workout.focus}</p>}</>}
  />;
}
