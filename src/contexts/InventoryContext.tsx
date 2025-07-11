import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Localidade, Unidade, Item, StatusItem } from '@/types';

interface InventoryContextType {
  localidades: Localidade[];
  unidades: Unidade[];
  itens: Item[];
  addLocalidade: (localidade: Omit<Localidade, 'id' | 'createdAt'>) => void;
  addUnidade: (unidade: Omit<Unidade, 'id' | 'createdAt'>) => void;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItemStatus: (itemId: string, status: StatusItem) => void;
  deleteLocalidade: (id: string) => void;
  deleteUnidade: (id: string) => void;
  deleteItem: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [localidades, setLocalidades] = useState<Localidade[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [itens, setItens] = useState<Item[]>([]);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedLocalidades = localStorage.getItem('inventory-localidades');
    const savedUnidades = localStorage.getItem('inventory-unidades');
    const savedItens = localStorage.getItem('inventory-itens');

    if (savedLocalidades) {
      setLocalidades(JSON.parse(savedLocalidades).map((loc: any) => ({
        ...loc,
        createdAt: new Date(loc.createdAt)
      })));
    }
    if (savedUnidades) {
      setUnidades(JSON.parse(savedUnidades).map((uni: any) => ({
        ...uni,
        createdAt: new Date(uni.createdAt)
      })));
    }
    if (savedItens) {
      setItens(JSON.parse(savedItens).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      })));
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('inventory-localidades', JSON.stringify(localidades));
  }, [localidades]);

  useEffect(() => {
    localStorage.setItem('inventory-unidades', JSON.stringify(unidades));
  }, [unidades]);

  useEffect(() => {
    localStorage.setItem('inventory-itens', JSON.stringify(itens));
  }, [itens]);

  const addLocalidade = (localidade: Omit<Localidade, 'id' | 'createdAt'>) => {
    const novaLocalidade: Localidade = {
      ...localidade,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setLocalidades(prev => [...prev, novaLocalidade]);
  };

  const addUnidade = (unidade: Omit<Unidade, 'id' | 'createdAt'>) => {
    const novaUnidade: Unidade = {
      ...unidade,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setUnidades(prev => [...prev, novaUnidade]);
  };

  const addItem = (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novoItem: Item = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItens(prev => [...prev, novoItem]);
  };

  const updateItemStatus = (itemId: string, status: StatusItem) => {
    setItens(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status, updatedAt: new Date() }
        : item
    ));
  };

  const deleteLocalidade = (id: string) => {
    setLocalidades(prev => prev.filter(loc => loc.id !== id));
    // Remove unidades e itens associados
    setUnidades(prev => prev.filter(uni => uni.localidadeId !== id));
    setItens(prev => prev.filter(item => item.localidadeId !== id));
  };

  const deleteUnidade = (id: string) => {
    setUnidades(prev => prev.filter(uni => uni.id !== id));
    // Remove itens associados
    setItens(prev => prev.filter(item => item.unidadeId !== id));
  };

  const deleteItem = (id: string) => {
    setItens(prev => prev.filter(item => item.id !== id));
  };

  return (
    <InventoryContext.Provider value={{
      localidades,
      unidades,
      itens,
      addLocalidade,
      addUnidade,
      addItem,
      updateItemStatus,
      deleteLocalidade,
      deleteUnidade,
      deleteItem,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}