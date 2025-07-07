import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Database, Archive, Box, Circle } from "lucide-react";

export function Dashboard() {
  const { localidades, unidades, itens } = useInventory();

  const statusCount = itens.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      title: "Total de Localidades",
      value: localidades.length,
      icon: Circle,
      color: "text-blue-500"
    },
    {
      title: "Total de Unidades", 
      value: unidades.length,
      icon: Archive,
      color: "text-green-500"
    },
    {
      title: "Total de Itens",
      value: itens.length,
      icon: Box,
      color: "text-purple-500"
    },
    {
      title: "Itens Disponíveis",
      value: statusCount.disponivel || 0,
      icon: Database,
      color: "text-emerald-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu inventário
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Itens</CardTitle>
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
                  Nenhum item cadastrado ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Itens Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itens.slice(-5).reverse().map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {localidades.find(l => l.id === item.localidadeId)?.nome}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
              {itens.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum item cadastrado ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}