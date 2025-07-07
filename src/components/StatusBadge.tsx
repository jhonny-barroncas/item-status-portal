import { StatusItem } from "@/types";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: StatusItem;
}

const statusConfig = {
  disponivel: {
    label: "Disponível",
    className: "bg-status-disponivel text-foreground",
  },
  "em-uso": {
    label: "Em Uso",
    className: "bg-status-em-uso text-foreground",
  },
  manutencao: {
    label: "Manutenção",
    className: "bg-status-manutencao text-foreground",
  },
  indisponivel: {
    label: "Indisponível",
    className: "bg-status-indisponivel text-foreground",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}