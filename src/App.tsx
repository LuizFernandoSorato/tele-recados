import { useEffect, useState } from 'react';
import { Criar } from './pages/Criar';
import { Landing } from './pages/Landing';
import { PaginaRecado } from './pages/Recado';

type Rota =
  | { nome: 'inicio' }
  | { nome: 'criar'; params: URLSearchParams }
  | { nome: 'recado'; codigo: string };

/** Roteamento por hash: o GitHub Pages não tem rewrites, e o recado vai no fragmento. */
function lerRota(): Rota {
  const h = location.hash.replace(/^#/, '');
  if (h.startsWith('/r/')) return { nome: 'recado', codigo: h.slice(3) };
  if (h.startsWith('/criar')) {
    const q = h.indexOf('?');
    return { nome: 'criar', params: new URLSearchParams(q >= 0 ? h.slice(q + 1) : '') };
  }
  return { nome: 'inicio' };
}

export function irPara(hash: string) {
  location.hash = hash;
  window.scrollTo(0, 0);
}

export function App() {
  const [rota, setRota] = useState(lerRota);
  useEffect(() => {
    const aoMudar = () => setRota(lerRota());
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, []);

  switch (rota.nome) {
    case 'recado':
      return <PaginaRecado codigo={rota.codigo} />;
    case 'criar':
      return <Criar key={rota.params.toString()} params={rota.params} />;
    default:
      return <Landing />;
  }
}
