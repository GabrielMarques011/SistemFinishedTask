import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, Filter, Hash, ListChecks, Calendar, Stethoscope, 
  CheckSquare, Play, Trash2, BarChart3, Terminal, CheckCircle2,
  Percent, CreditCard, Info, AlertCircle, Loader2,
  ChartSpline,
  BookCheck
} from 'lucide-react';

const OSManager = () => {
  const STATUS_OPTIONS = ["A", "AN", "EN", "AS", "AG", "EX", "RAG"];
  const DEFAULT_STATUS = ["A", "AN", "EN", "AS", "AG", "EX", "RAG"];

  const [assuntoId, setAssuntoId] = useState('293');
  const [selectedStatuses, setSelectedStatuses] = useState(DEFAULT_STATUS);
  const [dataLimite, setDataLimite] = useState('');
  const [idDiagnostico, setIdDiagnostico] = useState('64');
  const [idTarefa, setIdTarefa] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    initializeDefaults();
    addLog('Sistema inicializado e pronto para uso.');
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const initializeDefaults = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59);
    setDataLimite(formatDateTimeForInput(lastDay));
  };

  const formatDateTimeForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const addLog = (mensagem, tipo = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { timestamp, mensagem, tipo }]);
  };

  const toggleStatus = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleExecutar = async () => {
    if (!assuntoId.trim()) {
      alert('Por favor, informe o ID do assunto.');
      return;
    }

    if (selectedStatuses.length === 0) {
      alert('Por favor, selecione pelo menos um status.');
      return;
    }

    if (!dataLimite) {
      alert('Por favor, informe a data limite.');
      return;
    }

    if (!idDiagnostico.trim()) {
      alert('Por favor, informe o ID do diagnóstico.');
      return;
    }

    const dados = {
      assunto_id: assuntoId,
      status_ok: selectedStatuses,
      data_limite: dataLimite + ':00',
      id_diagnostico: idDiagnostico,
      id_tarefa: idTarefa
    };

    setIsProcessing(true);
    addLog('Iniciando processamento...');
    addLog(`Parâmetros: Assunto ID = ${assuntoId}, Status = [${selectedStatuses.join(', ')}], Data Limite = ${dataLimite}`);
    addLog(`IDs: Diagnóstico = ${idDiagnostico}, Tarefa = ${idTarefa || 'Nenhum (opcional)'}`);

    try {
      const response = await fetch('http://10.0.30.251:3535/executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const resultado = await response.json();

      if (resultado.sucesso) {
        addLog('Processamento concluído com sucesso!', 'success');
        setResults(resultado);
        setShowResults(true);
      } else {
        addLog(`Erro: ${resultado.mensagem}`, 'error');
        alert(`Erro: ${resultado.mensagem}`);
      }
    } catch (error) {
      addLog(`Erro na requisição: ${error.message}`, 'error');
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLimpar = () => {
    setAssuntoId('293');
    setSelectedStatuses(DEFAULT_STATUS);
    initializeDefaults();
    setIdDiagnostico('64');
    setIdTarefa('');
    setShowResults(false);
    setResults(null);
    addLog('Campos resetados para valores padrão.');
  };

  const getLogIcon = (tipo) => {
    switch(tipo) {
      case 'error': return '❌';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const calculateEfficiency = () => {
    if (!results?.detalhes || results.detalhes.total === 0) return 0;
    return Math.round((results.detalhes.finalizados / results.detalhes.total) * 100);
  };

  return (
    <div className="mx-auto w-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-2">
            <BookCheck className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">Gerenciador de OS</h1>
          </div>
          <p className="text-slate-600 ml-11">Fechamento Automático em Massa</p>
        </header>

        {/* Filtros Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-800">Filtros de Busca</h2>
          </div>

          <div className="space-y-6">
            {/* Assunto ID */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Hash className="w-4 h-4" />
                ID do Assunto:
              </label>
              <input
                type="text"
                value={assuntoId}
                onChange={(e) => setAssuntoId(e.target.value)}
                placeholder="Ex: 293"
                className="bg-white text-gray-700 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <small className="text-slate-500 text-xs mt-1 block">Digite o ID do assunto para filtrar</small>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                <ListChecks className="w-4 h-4" />
                Status para Filtro:
              </label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                      selectedStatuses.includes(status)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <small className="text-slate-500 text-xs mt-2 block">Selecione os status que devem ser incluídos</small>
            </div>

            {/* Data Limite */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4" />
                Data Limite:
              </label>
              <input
                type="datetime-local"
                value={dataLimite}
                onChange={(e) => setDataLimite(e.target.value)}
                className="bg-white text-gray-700 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <small className="text-slate-500 text-xs mt-1 block">OS abertas até esta data serão consideradas</small>
            </div>

            {/* ID Diagnóstico */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <ChartSpline className="w-4 h-4" />
                ID do Diagnóstico:
              </label>
              <input
                type="text"
                value={idDiagnostico}
                onChange={(e) => setIdDiagnostico(e.target.value)}
                placeholder="Ex: 64"
                className="bg-white text-gray-700 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <small className="text-slate-500 text-xs mt-1 block">ID do diagnóstico para fechamento</small>
            </div>

            {/* ID Tarefa */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <CheckSquare className="w-4 h-4" />
                ID da Próxima Tarefa (opcional):
              </label>
              <input
                type="text"
                value={idTarefa}
                onChange={(e) => setIdTarefa(e.target.value)}
                placeholder="Ex: 116 (deixe vazio se não houver)"
                className="bg-white text-gray-700 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <small className="text-slate-500 text-xs mt-1 block">ID da próxima tarefa auxiliar. Deixe vazio se não for necessário.</small>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleExecutar}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Executar Processamento
                  </>
                )}
              </button>
              <button
                onClick={handleLimpar}
                className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Limpar Campos
              </button>
            </div>
          </div>
        </div>

        {/* Resultados Card */}
        {showResults && results && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-semibold text-slate-800">Resultados</h2>
            </div>

            <div className="space-y-6">
              {/* Mensagem */}
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800 font-medium">{results.mensagem}</span>
              </div>

              {/* Stats */}
              {results.detalhes && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <ListChecks className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-700">Total Encontrado</h3>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">{results.detalhes.total}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-600 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-700">Finalizados</h3>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">{results.detalhes.finalizados}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-600 rounded-lg">
                          <Percent className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-700">Eficiência</h3>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">{calculateEfficiency()}%</p>
                    </div>
                  </div>

                  {/* IDs Finalizados */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <h3 className="text-lg font-semibold text-slate-800">IDs Finalizados:</h3>
                    </div>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {results.detalhes.ids_finalizados && results.detalhes.ids_finalizados.length > 0 ? (
                        results.detalhes.ids_finalizados.map((id, index) => (
                          <div key={index} className="bg-slate-100 text-slate-700 font-mono text-sm px-3 py-2 rounded text-center">
                            {id}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-slate-500 py-4">
                          Nenhum ID finalizado
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Logs Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-800">Log de Execução</h2>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="text-slate-300 mb-1">
                <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                {getLogIcon(log.tipo)} {log.mensagem}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSManager;