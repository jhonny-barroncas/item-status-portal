import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { InteractiveMap } from "@/components/InteractiveMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          Visualize suas localidades e itens em diferentes formatos
        </p>
      </div>

      <Tabs defaultValue="network" className="w-full">
        <TabsList>
          <TabsTrigger value="network">Rede Visual</TabsTrigger>
          <TabsTrigger value="interactive">Mapa Interativo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="network" className="space-y-6">
          <div className="relative min-h-[600px] bg-gradient-to-br from-background to-secondary/20 border rounded-xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
        
        {/* Localidade Principal (Centro) */}
        {localidadePrincipal && (
          <div className="relative z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`relative w-40 h-40 rounded-full border-4 ${getStatusColor(getLocalidadeStatus(localidadePrincipal.id))} flex flex-col items-center justify-center bg-white shadow-2xl hover:scale-105 transition-transform duration-300`}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Scan className="w-8 h-8 text-primary" />
              </div>
              <span className="text-sm font-bold text-center px-2 text-foreground">{localidadePrincipal.nome}</span>
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                <StatusBadge status={getLocalidadeStatus(localidadePrincipal.id) as any} />
              </div>
            </div>
          </div>
        )}

        {/* Outras Localidades (Conectadas ao Centro) */}
        {outrasLocalidades.map((localidade, index) => {
          const angle = (index * (360 / outrasLocalidades.length)) * (Math.PI / 180);
          const radius = 250;
          const x = 50 + (radius * Math.cos(angle)) / 10;
          const y = 50 + (radius * Math.sin(angle)) / 10;
          
          const itensLocalidade = itens.filter(item => item.localidadeId === localidade.id);
          const itemRepresentativo = itensLocalidade[0]; // Pega o primeiro item para mostrar a imagem
          
          return (
            <div key={localidade.id}>
              {/* Linha conectando ao centro */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <line
                  x1="50%"
                  y1="50%"
                  x2={`${x}%`}
                  y2={`${y}%`}
                  stroke={`url(#gradient-${index})`}
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              </svg>

              {/* Nó da localidade */}
              <div 
                className="relative z-10 absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`relative w-28 h-28 rounded-full border-4 ${getStatusColor(getLocalidadeStatus(localidade.id))} flex flex-col items-center justify-center bg-white shadow-xl hover:scale-110 transition-all duration-300 group-hover:shadow-2xl`}>
                  {itemRepresentativo?.imagem ? (
                    <img 
                      src={itemRepresentativo.imagem} 
                      alt={localidade.nome}
                      className="w-12 h-12 object-cover rounded-full mb-1"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                      <Scan className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-center px-1 text-foreground leading-tight">{localidade.nome}</span>
                  
                  {/* Status de manutenção */}
                  {getLocalidadeStatus(localidade.id) === 'manutencao' && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-20">
                      <span className="text-xs font-bold text-destructive bg-background px-2 py-1 rounded-md shadow-lg border border-destructive/20">
                        MANUTENÇÃO
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <StatusBadge status={getLocalidadeStatus(localidade.id) as any} />
                  </div>
                  
                  {/* Tooltip com informações */}
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                    <div className="bg-card border border-border/50 rounded-lg p-2 shadow-lg min-w-max">
                      <p className="text-xs text-muted-foreground">{itensLocalidade.length} itens</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
          </div>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-6">
          <InteractiveMap />
        </TabsContent>
      </Tabs>

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