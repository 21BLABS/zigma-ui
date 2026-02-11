import { Badge } from "@/components/ui/badge";
import { TokenTier } from "@/lib/api/strategies";

interface TokenTierBadgeProps {
  tier: TokenTier;
  small?: boolean;
}

export const TokenTierBadge = ({ tier, small = false }: TokenTierBadgeProps) => {
  // Define badge variants and colors based on tier
  const getBadgeVariant = () => {
    switch (tier) {
      case TokenTier.FREE:
        return "secondary";
      case TokenTier.BASIC:
        return "outline";
      case TokenTier.PRO:
        return "default";
      case TokenTier.ELITE:
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  // Get badge class based on size
  const badgeClass = small ? "text-xs py-0 h-5" : "";
  
  return (
    <Badge variant={getBadgeVariant() as any} className={badgeClass}>
      {tier}
    </Badge>
  );
};
