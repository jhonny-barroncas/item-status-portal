import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { File, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export default function Relatorios() {
  const { localidades, unidades, itens } = useInventory();
  const { toast } = useToast();

  const statusCount = itens.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const localidadeStats = localidades.map(localidade => ({
    ...localidade,
    unidadesCount: unidades.filter(u => u.localidadeId === localidade.id).length,
    itensCount: itens.filter(i => i.localidadeId === localidade.id).length,
  }));

  const unidadeStats = unidades.map(unidade => ({
    ...unidade,
    localidadeNome: localidades.find(l => l.id === unidade.localidadeId)?.nome || 'N/A',
    itensCount: itens.filter(i => i.unidadeId === unidade.id).length,
  }));

  const generateReport = () => {
    const reportData = {
      resumo: {
        totalLocalidades: localidades.length,
        totalUnidades: unidades.length,
        totalItens: itens.length,
        dataGeracao: new Date().toLocaleString('pt-BR'),
      },
      statusItens: statusCount,
      localidades: localidadeStats,
      unidades: unidadeStats,
      itens: itens.map(item => ({
        ...item,
        localidadeNome: localidades.find(l => l.id === item.localidadeId)?.nome || 'N/A',
        unidadeNome: unidades.find(u => u.id === item.unidadeId)?.nome || 'N/A',
        criadoEm: item.createdAt.toLocaleDateString('pt-BR'),
        atualizadoEm: item.updatedAt.toLocaleDateString('pt-BR'),
      })),
    };

    const jsonStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-inventario-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Relatório baixado com sucesso!",
    });
  };

  const generateExcel = () => {
    if (itens.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há itens para exportar",
        variant: "destructive",
      });
      return;
    }

    // Preparar dados para o Excel
    const excelData = itens.map(item => ({
      'Nome': item.nome,
      'Descrição': item.descricao || '',
      'Status': item.status,
      'Localidade': localidades.find(l => l.id === item.localidadeId)?.nome || 'N/A',
      'Unidade': unidades.find(u => u.id === item.unidadeId)?.nome || 'N/A',
      'Observações': item.observacoes || '',
      'Data Criação': item.createdAt.toLocaleDateString('pt-BR'),
      'Última Atualização': item.updatedAt.toLocaleDateString('pt-BR')
    }));

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    
    // Criar planilha principal com dados dos itens
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Definir largura das colunas
    const colWidths = [
      { wch: 25 }, // Nome
      { wch: 40 }, // Descrição
      { wch: 15 }, // Status
      { wch: 20 }, // Localidade
      { wch: 20 }, // Unidade
      { wch: 30 }, // Observações
      { wch: 15 }, // Data Criação
      { wch: 18 }  // Última Atualização
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventário');

    // Criar planilha de resumo
    const summaryData = [
      { Métrica: 'Total de Localidades', Valor: localidades.length },
      { Métrica: 'Total de Unidades', Valor: unidades.length },
      { Métrica: 'Total de Itens', Valor: itens.length },
      { Métrica: 'Itens Disponíveis', Valor: statusCount.disponivel || 0 },
      { Métrica: 'Itens em Uso', Valor: statusCount['em-uso'] || 0 },
      { Métrica: 'Itens em Manutenção', Valor: statusCount.manutencao || 0 },
      { Métrica: 'Itens Indisponíveis', Valor: statusCount.indisponivel || 0 }
    ];
    
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo');

    // Salvar arquivo
    const fileName = `inventario-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Sucesso",
      description: "Relatório Excel baixado com sucesso!",
    });
  };

  const generateCSV = () => {
    if (itens.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há itens para exportar",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'Nome',
      'Descrição',
      'Status',
      'Localidade',
      'Unidade',
      'Observações',
      'Data Criação',
      'Última Atualização'
    ];

    const csvData = itens.map(item => [
      item.nome,
      item.descricao || '',
      item.status,
      localidades.find(l => l.id === item.localidadeId)?.nome || 'N/A',
      unidades.find(u => u.id === item.unidadeId)?.nome || 'N/A',
      item.observacoes || '',
      item.createdAt.toLocaleDateString('pt-BR'),
      item.updatedAt.toLocaleDateString('pt-BR'),
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Relatório CSV baixado com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize e exporte dados do seu inventário
          </p>
        </div>
        
        <div className="space-x-2">
          <Button onClick={generateExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button onClick={generateCSV} variant="outline">
            <File className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={generateReport} variant="outline">
            <File className="mr-2 h-4 w-4" />
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Localidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localidades.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Unidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unidades.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itens.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Itens Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCount.disponivel || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status dos Itens */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCount).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status as any} />
                  <span className="font-medium">{count} itens</span>
                </div>
              ))}
              {Object.keys(statusCount).length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum item cadastrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Localidades */}
        <Card>
          <CardHeader>
            <CardTitle>Itens por Localidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {localidadeStats.map((localidade) => (
                <div key={localidade.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{localidade.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {localidade.unidadesCount} unidades
                    </p>
                  </div>
                  <span className="font-medium">{localidade.itensCount} itens</span>
                </div>
              ))}
              {localidades.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhuma localidade cadastrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Unidades */}
      {unidades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unidades e Quantidade de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unidadeStats.map((unidade) => (
                <div key={unidade.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{unidade.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      📍 {unidade.localidadeNome}
                    </p>
                  </div>
                  <span className="font-medium">{unidade.itensCount} itens</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há dados */}
      {localidades.length === 0 && unidades.length === 0 && itens.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Não há dados suficientes para gerar relatórios.
          </p>
          <p className="text-sm text-muted-foreground">
            Comece cadastrando localidades, unidades e itens.
          </p>
        </div>
      )}
    </div>
  );
}