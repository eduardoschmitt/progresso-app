import { request, withAuthorization } from '@/api/httpClient';
import type { Insignia } from '@/model/insignias/Insignia';
import { getSession, getToken } from '@/service/storage/authStorage';

export const getInsignias = async (opts?: { sincronizar?: boolean }) => {
  const sincronizar = opts?.sincronizar ?? true;

  const session = await getSession();
  const token = session?.token ?? (await getToken());
  const usuarioId = session?.user?.id;

  if (!token || !usuarioId) {
    throw new Error('Sessão não encontrada. Faça login novamente.');
  }

  const sp = new URLSearchParams();
  sp.set('sincronizar', String(sincronizar));
  sp.set('usuarioId', usuarioId);

  return request<Insignia[]>({
    url: `/api/insignias?${sp.toString()}`,
    method: 'GET',
    ...withAuthorization(token),
  });
};

export const isConquistada = (i: Insignia) => !!i.desbloqueada && !!i.conquistadaEm;

export const sortInsignias = (a: Insignia, b: Insignia) => {
  const ac = isConquistada(a);
  const bc = isConquistada(b);
  if (ac !== bc) return ac ? -1 : 1;

  if ((a.desbloqueada ?? false) !== (b.desbloqueada ?? false)) {
    return (a.desbloqueada ?? false) ? -1 : 1;
  }

  if (a.conquistadaEm && b.conquistadaEm) {
    return new Date(b.conquistadaEm).getTime() - new Date(a.conquistadaEm).getTime();
  }

  return a.nome.localeCompare(b.nome);
};
