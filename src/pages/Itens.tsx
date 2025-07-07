import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusItem } from "@/types";

const statusOptions: { value: StatusItem; label: string }[] = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em-uso', label: 'Em Uso' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'indisponivel', label: 'Indisponível' },
];

export default function Itens() {
  const { localidades, unidades, itens, addItem, deleteItem, updateItemStatus } = useInventory();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    status: "disponivel" as StatusItem,
    localidadeId: "",
    unidadeId: "",
    observacoes: "",
    imagem: "",
    icone: "",
  });

  const filteredUnidades = unidades.filter(u => u.localidadeId === formData.localidadeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.localidadeId || !formData.unidadeId) {
      toast({
        title: "Erro",
        description: "Selecione localidade e unidade",
        variant: "destructive",
      });
      return;
    }

    addItem(formData);
    setFormData({
      nome: "",
      descricao: "",
      status: "disponivel",
      localidadeId: "",
      unidadeId: "",
      observacoes: "",
      imagem: "",
      icone: "",
    });
    setIsOpen(false);
    toast({
      title: "Sucesso",
      description: "Item cadastrado com sucesso!",
    });
  };

  const handleDelete = (id: string, nome: string) => {
    deleteItem(id);
    toast({
      title: "Sucesso",
      description: `Item "${nome}" excluído com sucesso!`,
    });
  };

  const handleStatusChange = (itemId: string, newStatus: StatusItem) => {
    updateItemStatus(itemId, newStatus);
    toast({
      title: "Sucesso",
      description: "Status atualizado com sucesso!",
    });
  };

  if (localidades.length === 0 || unidades.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Itens</h1>
          <p className="text-muted-foreground">
            Gerencie os itens do seu inventário
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">
            Você precisa ter pelo menos uma localidade e uma unidade antes de cadastrar itens.
          </p>
          <div className="space-x-2">
            {localidades.length === 0 && (
              <Button asChild>
                <a href="/localidades">Cadastrar Localidade</a>
              </Button>
            )}
            {unidades.length === 0 && (
              <Button asChild>
                <a href="/unidades">Cadastrar Unidade</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Itens</h1>
          <p className="text-muted-foreground">
            Gerencie os itens do seu inventário
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome do item"
                />
              </div>
              
              <div>
                <Label htmlFor="localidade">Localidade *</Label>
                <Select
                  value={formData.localidadeId}
                  onValueChange={(value) => setFormData({ ...formData, localidadeId: value, unidadeId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma localidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {localidades.map((localidade) => (
                      <SelectItem key={localidade.id} value={localidade.id}>
                        {localidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unidade">Unidade *</Label>
                <Select
                  value={formData.unidadeId}
                  onValueChange={(value) => setFormData({ ...formData, unidadeId: value })}
                  disabled={!formData.localidadeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUnidades.map((unidade) => (
                      <SelectItem key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as StatusItem })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição opcional"
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itens.map((item) => {
          const localidade = localidades.find(l => l.id === item.localidadeId);
          const unidade = unidades.find(u => u.id === item.unidadeId);
          
          return (
            <Card key={item.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.nome}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.nome)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <Select
                    value={item.status}
                    onValueChange={(value) => handleStatusChange(item.id, value as StatusItem)}
                  >
                    <SelectTrigger className="w-auto h-auto p-1 border-0 bg-transparent">
                      <span className="text-xs text-muted-foreground">Alterar</span>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Localidade:</span> {localidade?.nome}</p>
                  <p><span className="font-medium">Unidade:</span> {unidade?.nome}</p>
                </div>

                {item.descricao && (
                  <p className="text-sm text-muted-foreground">
                    {item.descricao}
                  </p>
                )}

                {item.observacoes && (
                  <p className="text-xs text-muted-foreground border-t pt-2">
                    <span className="font-medium">Obs:</span> {item.observacoes}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Criado em {item.createdAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {itens.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum item cadastrado ainda.
          </p>
          <p className="text-sm text-muted-foreground">
            Clique em "Novo Item" para começar.
          </p>
        </div>
      )}
    </div>
  );
}