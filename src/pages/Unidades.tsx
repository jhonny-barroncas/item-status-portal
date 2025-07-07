import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Unidades() {
  const { localidades, unidades, itens, addUnidade, deleteUnidade } = useInventory();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    localidadeId: "",
  });

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

    if (!formData.localidadeId) {
      toast({
        title: "Erro",
        description: "Selecione uma localidade",
        variant: "destructive",
      });
      return;
    }

    addUnidade(formData);
    setFormData({ nome: "", descricao: "", localidadeId: "" });
    setIsOpen(false);
    toast({
      title: "Sucesso",
      description: "Unidade cadastrada com sucesso!",
    });
  };

  const handleDelete = (id: string, nome: string) => {
    const itensAssociados = itens.filter(i => i.unidadeId === id).length;
    
    if (itensAssociados > 0) {
      toast({
        title: "Erro",
        description: `Não é possível excluir a unidade "${nome}" pois possui ${itensAssociados} itens associados.`,
        variant: "destructive",
      });
      return;
    }

    deleteUnidade(id);
    toast({
      title: "Sucesso",
      description: "Unidade excluída com sucesso!",
    });
  };

  if (localidades.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Unidades</h1>
          <p className="text-muted-foreground">
            Gerencie as unidades do seu inventário
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">
            Você precisa cadastrar pelo menos uma localidade antes de criar unidades.
          </p>
          <Button asChild>
            <a href="/localidades">Cadastrar Localidade</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Unidades</h1>
          <p className="text-muted-foreground">
            Gerencie as unidades do seu inventário
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Unidade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome da unidade"
                />
              </div>
              <div>
                <Label htmlFor="localidade">Localidade *</Label>
                <Select
                  value={formData.localidadeId}
                  onValueChange={(value) => setFormData({ ...formData, localidadeId: value })}
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
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição opcional"
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
        {unidades.map((unidade) => {
          const localidade = localidades.find(l => l.id === unidade.localidadeId);
          const itensCount = itens.filter(i => i.unidadeId === unidade.id).length;
          
          return (
            <Card key={unidade.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{unidade.nome}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(unidade.id, unidade.nome)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  📍 {localidade?.nome}
                </p>
                {unidade.descricao && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {unidade.descricao}
                  </p>
                )}
                <div className="flex justify-between text-sm">
                  <span>{itensCount} itens</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Criada em {unidade.createdAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {unidades.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma unidade cadastrada ainda.
          </p>
          <p className="text-sm text-muted-foreground">
            Clique em "Nova Unidade" para começar.
          </p>
        </div>
      )}
    </div>
  );
}