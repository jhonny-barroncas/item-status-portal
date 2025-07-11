import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Scan } from "lucide-react";

export function Visualizacao() {
  const { localidades, unidades, itens } = useInventory();

  // Encontrar a localidade principal (primeira cadastrada ou a que tem mais itens)
  const localidadePrincipal = localidades.length > 0 
    ? localidades.reduce((prev, current) => {
        const prevItens = itens.filter(item => item.localidadeId === prev.id).length;
        const currentItens = itens.filter(item => item.localidadeId === current.id).length;
        return currentItens > prevItens ? current : prev;
      })
    : null;

  const outrasLocalidades = localidades.filter(loc => loc.id !== localidadePrincipal?.id);

  const getLocalidadeStatus = (localidadeId: string) => {
    const itensLocalidade = itens.filter(item => item.localidadeId === localidadeId);
    if (itensLocalidade.length === 0) return 'disponivel';
    
    const temManutencao = itensLocalidade.some(item => item.status === 'manutencao');
    const temIndisponivel = itensLocalidade.some(item => item.status === 'indisponivel');
    
    if (temManutencao) return 'manutencao';
    if (temIndisponivel) return 'indisponivel';
    return 'disponivel';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'border-green-500 bg-green-50';
      case 'manutencao': return 'border-red-500 bg-red-50';
      case 'indisponivel': return 'border-gray-500 bg-gray-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  if (localidades.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Visualização da Rede</h1>
          <p className="text-muted-foreground">
            Visualize suas localidades e itens em formato de rede
          </p>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Cadastre algumas localidades e itens para visualizar a rede
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Visualização da Rede</h1>
        <p className="text-muted-foreground">
          Visualize suas localidades e itens em formato de rede
        </p>
      </div>

      <div className="relative min-h-[600px] bg-background border rounded-lg p-8">
        {/* Localidade Principal (Centro) */}
        {localidadePrincipal && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`relative w-32 h-32 rounded-full border-4 ${getStatusColor(getLocalidadeStatus(localidadePrincipal.id))} flex flex-col items-center justify-center bg-white shadow-lg`}>
              <Scan className="w-8 h-8 mb-2 text-primary" />
              <span className="text-sm font-bold text-center px-2">{localidadePrincipal.nome}</span>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <StatusBadge status={getLocalidadeStatus(localidadePrincipal.id) as any} />
              </div>
            </div>
          </div>
        )}

        {/* Outras Localidades (Conectadas ao Centro) */}
        {outrasLocalidades.map((localidade, index) => {
          const angle = (index * (360 / outrasLocalidades.length)) * (Math.PI / 180);
          const radius = 200;
          const x = 50 + (radius * Math.cos(angle)) / 8; // Convertendo para porcentagem
          const y = 50 + (radius * Math.sin(angle)) / 8;
          
          return (
            <div key={localidade.id}>
              {/* Linha conectando ao centro */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1="50%"
                  y1="50%"
                  x2={`${x}%`}
                  y2={`${y}%`}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  opacity="0.6"
                />
              </svg>

              {/* Nó da localidade */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`relative w-24 h-24 rounded-full border-4 ${getStatusColor(getLocalidadeStatus(localidade.id))} flex flex-col items-center justify-center bg-white shadow-lg`}>
                  <Scan className="w-6 h-6 mb-1 text-primary" />
                  <span className="text-xs font-bold text-center px-1">{localidade.nome}</span>
                  
                  {/* Status da localidade */}
                  {getLocalidadeStatus(localidade.id) === 'manutencao' && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <span className="text-xs font-bold text-red-600 bg-white px-2 py-1 rounded shadow">
                        MANUTENÇÃO
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <StatusBadge status={getLocalidadeStatus(localidade.id) as any} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-green-500 bg-green-50"></div>
              <span className="text-sm">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-red-50"></div>
              <span className="text-sm">Manutenção</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-gray-500 bg-gray-50"></div>
              <span className="text-sm">Indisponível</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            A localidade central representa o hub principal da rede. As linhas conectam todas as localidades ao centro, 
            e as cores indicam o status geral dos itens em cada localidade.
          </p>
        </CardContent>
      </Card>

      {/* Estatísticas da Rede */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Localidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localidades.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Localidades em Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {localidades.filter(loc => getLocalidadeStatus(loc.id) === 'manutencao').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Itens na Rede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itens.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}