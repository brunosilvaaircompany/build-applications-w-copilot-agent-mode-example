import type { ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  items: T[];
  loading: boolean;
  hasError: boolean;
  emptyMessage: string;
  renderItem: (item: T, index: number) => ReactNode;
};

export function CapabilityCard<T>({ title, description, items, loading, hasError, emptyMessage, renderItem }: Props<T>) {
  return <section className="card h-100">
    <div className="card-body">
      <h2 className="h4">{title}</h2>
      <p>{description}</p>
      {loading ? <p role="status">Carregando...</p>
        : hasError ? <p role="alert">Não foi possível carregar os dados. Tente novamente.</p>
          : items.length === 0 ? <p>{emptyMessage}</p>
            : <ul className="list-unstyled">{items.map((item, index) => <li className="mb-3" key={index}>{renderItem(item, index)}</li>)}</ul>}
    </div>
  </section>;
}
