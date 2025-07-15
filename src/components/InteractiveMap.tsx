import React, { useEffect, useRef, useState } from 'react';
import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Scan, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'localidade' | 'unidade' | 'item';
  data: any;
  connections: string[];
}

export function InteractiveMap() {
  const { localidades, unidades, itens } = useInventory();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Gerar nodes do mapa
  useEffect(() => {
    const newNodes: Node[] = [];
    const centerX = 400;
    const centerY = 300;

    // Criar nodes das localidades (círculo central)
    localidades.forEach((localidade, index) => {
      const angle = (index * (2 * Math.PI)) / localidades.length;
      const radius = 120;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      newNodes.push({
        id: localidade.id,
        x,
        y,
        radius: 40,
        type: 'localidade',
        data: localidade,
        connections: []
      });

      // Criar nodes das unidades para esta localidade
      const localidadeUnidades = unidades.filter(u => u.localidadeId === localidade.id);
      localidadeUnidades.forEach((unidade, unidadeIndex) => {
        const unidadeAngle = angle + (unidadeIndex - localidadeUnidades.length / 2) * 0.3;
        const unidadeRadius = 200;
        const unidadeX = centerX + Math.cos(unidadeAngle) * unidadeRadius;
        const unidadeY = centerY + Math.sin(unidadeAngle) * unidadeRadius;

        newNodes.push({
          id: unidade.id,
          x: unidadeX,
          y: unidadeY,
          radius: 25,
          type: 'unidade',
          data: unidade,
          connections: [localidade.id]
        });

        // Criar nodes dos itens para esta unidade (apenas alguns para não poluir)
        const unidadeItens = itens.filter(i => i.unidadeId === unidade.id).slice(0, 3);
        unidadeItens.forEach((item, itemIndex) => {
          const itemAngle = unidadeAngle + (itemIndex - 1) * 0.2;
          const itemRadius = 280;
          const itemX = centerX + Math.cos(itemAngle) * itemRadius;
          const itemY = centerY + Math.sin(itemAngle) * itemRadius;

          newNodes.push({
            id: item.id,
            x: itemX,
            y: itemY,
            radius: 15,
            type: 'item',
            data: item,
            connections: [unidade.id]
          });
        });
      });
    });

    setNodes(newNodes);
  }, [localidades, unidades, itens]);

  // Função para desenhar o mapa
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplicar transformações
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Desenhar conexões
    nodes.forEach(node => {
      node.connections.forEach(connId => {
        const connectedNode = nodes.find(n => n.id === connId);
        if (connectedNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connectedNode.x, connectedNode.y);
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    });

    // Desenhar nodes
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

      // Cores baseadas no tipo
      if (node.type === 'localidade') {
        ctx.fillStyle = '#10b981';
      } else if (node.type === 'unidade') {
        ctx.fillStyle = '#f59e0b';
      } else {
        // Cor baseada no status do item
        const status = node.data.status;
        switch (status) {
          case 'disponivel':
            ctx.fillStyle = '#10b981';
            break;
          case 'em-uso':
            ctx.fillStyle = '#f59e0b';
            break;
          case 'manutencao':
            ctx.fillStyle = '#ef4444';
            break;
          default:
            ctx.fillStyle = '#6b7280';
        }
      }

      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Desenhar texto
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(10, node.radius / 3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = node.data.nome.substring(0, node.type === 'item' ? 5 : 8);
      ctx.fillText(text, node.x, node.y);
    });

    ctx.restore();
  };

  // Event handlers para interação
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - offset.x) / zoom;
    const clickY = (e.clientY - rect.top - offset.y) / zoom;

    // Verificar se clicou em algum node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((clickX - node.x) ** 2 + (clickY - node.y) ** 2);
      return distance <= node.radius;
    });

    setSelectedNode(clickedNode || null);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Desenhar sempre que houver mudanças
  useEffect(() => {
    drawMap();
  }, [nodes, zoom, offset]);

  if (localidades.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Cadastre algumas localidades, unidades e itens para visualizar o mapa interativo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles do mapa */}
      <div className="flex gap-2">
        <Button onClick={zoomIn} size="sm" variant="outline">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button onClick={zoomOut} size="sm" variant="outline">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button onClick={resetView} size="sm" variant="outline">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Canvas do mapa */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full border rounded cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Painel de informações */}
        <div className="space-y-4">
          {selectedNode ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedNode.type === 'localidade' && <MapPin className="w-5 h-5" />}
                  {selectedNode.type === 'unidade' && <Scan className="w-5 h-5" />}
                  {selectedNode.type === 'item' && <Scan className="w-5 h-5" />}
                  {selectedNode.data.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Tipo:</strong> {selectedNode.type}</p>
                  {selectedNode.data.descricao && (
                    <p><strong>Descrição:</strong> {selectedNode.data.descricao}</p>
                  )}
                  {selectedNode.type === 'item' && (
                    <div>
                      <strong>Status:</strong>
                      <StatusBadge status={selectedNode.data.status} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Clique em um elemento do mapa para ver detalhes
                </p>
              </CardContent>
            </Card>
          )}

          {/* Legenda */}
          <Card>
            <CardHeader>
              <CardTitle>Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Localidades / Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Unidades / Em Uso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm">Manutenção</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span className="text-sm">Indisponível</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-sm">Localidades: {localidades.length}</p>
                <p className="text-sm">Unidades: {unidades.length}</p>
                <p className="text-sm">Itens: {itens.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}