import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Localidades() {
  const { localidades, unidades, itens, addLocalidade, deleteLocalidade } = useInventory();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
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

    addLocalidade(formData);
    setFormData({ nome: "", descricao: "" });
    setIsOpen(false);
    toast({
      title: "Sucesso",
      description: "Localidade cadastrada com sucesso!",
    });
  };

  const handleDelete = (id: string, nome: string) => {
    const unidadesAssociadas = unidades.filter(u => u.localidadeId === id).length;
    const itensAssociados = itens.filter(i => i.localidadeId === id).length;
    
    if (unidadesAssociadas > 0 || itensAssociados > 0) {
      toast({
        title: "Erro",
        description: `Não é possível excluir a localidade "${nome}" pois possui ${unidadesAssociadas} unidades e ${itensAssociados} itens associados.`,
        variant: "destructive",
      });
      return;
    }

    deleteLocalidade(id);
    toast({
      title: "Sucesso",
      description: "Localidade excluída com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Localidades</h1>
          <p className="text-muted-foreground">
            Gerencie as localidades do seu inventário
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Localidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Localidade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome da localidade"
                />
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
        {localidades.map((localidade) => {
          const unidadesCount = unidades.filter(u => u.localidadeId === localidade.id).length;
          const itensCount = itens.filter(i => i.localidadeId === localidade.id).length;
          
          return (
            <Card key={localidade.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{localidade.nome}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(localidade.id, localidade.nome)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {localidade.descricao && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {localidade.descricao}
                  </p>
                )}
                <div className="flex justify-between text-sm">
                  <span>{unidadesCount} unidades</span>
                  <span>{itensCount} itens</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Criada em {localidade.createdAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {localidades.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma localidade cadastrada ainda.
          </p>
          <p className="text-sm text-muted-foreground">
            Clique em "Nova Localidade" para começar.
          </p>
        </div>
      )}
    </div>
  );
}