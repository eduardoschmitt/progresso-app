import { useCallback, useState } from 'react';

import { ApiError } from '@/api/httpClient';
import type {
  TreinoCluster,
  TreinoConclusaoPayload,
  TreinoQuestaoPayload,
  TreinoRespostaPayload,
  TreinoSessaoPayload,
  TreinoSessaoProgresso,
  TreinoSessaoStatus,
  TreinoSessaoTipo,
} from '@/model/treino';
import {
  buscarProximaQuestaoTreino,
  concluirSessaoTreino,
  criarSessaoTreino,
  enviarRespostaTreino,
} from '@/service/treinoService';

export type CriarSessaoParams = {
  tipo: TreinoSessaoTipo;
  cluster: TreinoCluster;
  totalQuestoes: number;
};

export type AdaptiveTreinoState = {
  sessao: TreinoSessaoPayload | null;
  status: TreinoSessaoStatus | null;
  progresso: TreinoSessaoProgresso | null;
  reforcoEspacado: boolean;
  questaoAtual: TreinoQuestaoPayload | null;
  respostaAtual: TreinoRespostaPayload | null;
  conclusao: TreinoConclusaoPayload | null;
  isInicializando: boolean;
  isCarregandoQuestao: boolean;
  isEnviandoResposta: boolean;
  isConcluindo: boolean;
  erroInicializacao: string | null;
  erroQuestao: string | null;
  erroConclusao: string | null;
  opcaoSelecionadaId: string | null;
};

export type AdaptiveTreinoActions = {
  inicializarSessao: (params: CriarSessaoParams) => Promise<void>;
  enviarResposta: (opcaoId: string) => Promise<void>;
  avancarOuConcluir: () => Promise<void>;
  resetar: () => void;
};

export function useAdaptiveTreinoSession(token?: string, usuarioId?: string) {
  const [sessao, setSessao] = useState<TreinoSessaoPayload | null>(null);
  const [status, setStatus] = useState<TreinoSessaoStatus | null>(null);
  const [progresso, setProgresso] = useState<TreinoSessaoProgresso | null>(null);
  const [reforcoEspacado, setReforcoEspacado] = useState(false);
  const [questaoAtual, setQuestaoAtual] = useState<TreinoQuestaoPayload | null>(null);
  const [respostaAtual, setRespostaAtual] = useState<TreinoRespostaPayload | null>(null);
  const [conclusao, setConclusao] = useState<TreinoConclusaoPayload | null>(null);
  const [isInicializando, setIsInicializando] = useState(false);
  const [isCarregandoQuestao, setIsCarregandoQuestao] = useState(false);
  const [isEnviandoResposta, setIsEnviandoResposta] = useState(false);
  const [isConcluindo, setIsConcluindo] = useState(false);
  const [erroInicializacao, setErroInicializacao] = useState<string | null>(null);
  const [erroQuestao, setErroQuestao] = useState<string | null>(null);
  const [erroConclusao, setErroConclusao] = useState<string | null>(null);
  const [opcaoSelecionadaId, setOpcaoSelecionadaId] = useState<string | null>(null);

  const resetar = useCallback(() => {
    setSessao(null);
    setStatus(null);
    setProgresso(null);
    setReforcoEspacado(false);
    setQuestaoAtual(null);
    setRespostaAtual(null);
    setConclusao(null);
    setErroInicializacao(null);
    setErroQuestao(null);
    setErroConclusao(null);
    setOpcaoSelecionadaId(null);
  }, []);

  const carregarConclusao = useCallback(
    async (sessaoAlvo?: TreinoSessaoPayload | null) => {
      if (!token) {
        return;
      }

      const sessaoAtiva = sessaoAlvo ?? sessao;

      if (!sessaoAtiva || isConcluindo || conclusao) {
        return;
      }

      setIsConcluindo(true);
      setErroConclusao(null);

      try {
        const payload = await concluirSessaoTreino(token, sessaoAtiva.sessaoId);
        setConclusao(payload);
      } catch (error) {
        if (error instanceof ApiError) {
          setErroConclusao(error.message);
        } else {
          setErroConclusao('Não foi possível concluir a sessão. Tente novamente.');
        }
      } finally {
        setIsConcluindo(false);
      }
    },
    [token, sessao, isConcluindo, conclusao],
  );

  const carregarProximaQuestao = useCallback(
    async (sessaoAlvo?: TreinoSessaoPayload | null) => {
      if (!token) {
        return;
      }

      const sessaoAtiva = sessaoAlvo ?? sessao;

      if (!sessaoAtiva) {
        return;
      }

      setIsCarregandoQuestao(true);
      setErroQuestao(null);
      setRespostaAtual(null);
      setOpcaoSelecionadaId(null);

      try {
        const payload = await buscarProximaQuestaoTreino(token, sessaoAtiva.sessaoId);
        setStatus(payload.status);
        setProgresso(payload.progresso);
        setReforcoEspacado(payload.reforcoEspacado);
        setQuestaoAtual(payload.questao ?? null);

        if (payload.status === 'concluida' && !payload.questao) {
          await carregarConclusao(sessaoAtiva);
        }
      } catch (error) {
        if (error instanceof ApiError) {
          setErroQuestao(error.message);
        } else {
          setErroQuestao('Não foi possível carregar a próxima questão. Tente novamente.');
        }
      } finally {
        setIsCarregandoQuestao(false);
      }
    },
    [token, sessao, carregarConclusao],
  );

  const inicializarSessao = useCallback(
    async ({ tipo, cluster, totalQuestoes }: CriarSessaoParams) => {
      if (!token || !usuarioId) {
        setErroInicializacao('Você precisa estar autenticado para iniciar um treino.');
        return;
      }

      if (isInicializando) {
        return;
      }

      setIsInicializando(true);
      setErroInicializacao(null);
      resetar();

      try {
        const payload = await criarSessaoTreino(token, {
          usuarioId,
          tipo,
          cluster,
          totalQuestoes,
        });
        setSessao(payload);
        await carregarProximaQuestao(payload);
      } catch (error) {
        if (error instanceof ApiError) {
          setErroInicializacao(error.message);
        } else {
          setErroInicializacao('Não foi possível iniciar o treino. Tente novamente.');
        }
        setSessao(null);
      } finally {
        setIsInicializando(false);
      }
    },
    [token, usuarioId, isInicializando, carregarProximaQuestao, resetar],
  );

  const enviarResposta = useCallback(
    async (opcaoId: string) => {
      if (!token || !sessao || !questaoAtual) {
        return;
      }

      if (isEnviandoResposta || respostaAtual) {
        return;
      }

      setIsEnviandoResposta(true);
      setOpcaoSelecionadaId(opcaoId);
      setErroQuestao(null);

      try {
        const payload = await enviarRespostaTreino(token, sessao.sessaoId, {
          questaoId: questaoAtual.id,
          opcaoId,
        });
        setRespostaAtual(payload);
      } catch (error) {
        setOpcaoSelecionadaId(null);
        if (error instanceof ApiError) {
          setErroQuestao(error.message);
        } else {
          setErroQuestao('Não foi possível registrar sua resposta. Tente novamente.');
        }
      } finally {
        setIsEnviandoResposta(false);
      }
    },
    [token, sessao, questaoAtual, isEnviandoResposta, respostaAtual],
  );

  const avancarOuConcluir = useCallback(async () => {
    if (status === 'concluida') {
      await carregarConclusao();
      return;
    }

    await carregarProximaQuestao();
  }, [status, carregarProximaQuestao, carregarConclusao]);

  return {
    state: {
      sessao,
      status,
      progresso,
      reforcoEspacado,
      questaoAtual,
      respostaAtual,
      conclusao,
      isInicializando,
      isCarregandoQuestao,
      isEnviandoResposta,
      isConcluindo,
      erroInicializacao,
      erroQuestao,
      erroConclusao,
      opcaoSelecionadaId,
    },
    actions: {
      inicializarSessao,
      enviarResposta,
      avancarOuConcluir,
      resetar,
    },
  } as const;
}
