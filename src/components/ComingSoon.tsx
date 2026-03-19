import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { dashboardCard, responsive } from "@/theme";

interface ComingSoonProps {
  feature: string;
  description: string;
}

export const ComingSoon = ({ feature, description }: ComingSoonProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className={`max-w-md w-full ${dashboardCard.base}`}>
        <CardHeader className="text-center p-4 sm:p-6">
          <div className={`mx-auto mb-3 ${dashboardCard.iconWell.primary} !h-12 !w-12 sm:!h-14 sm:!w-14`}>
            <Construction className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          </div>
          <CardTitle className={`font-display ${responsive.pageTitle}`}>Coming Soon</CardTitle>
          <CardDescription className={`${responsive.cardTitle} mt-1`}>
            {feature}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center p-4 sm:p-6 pt-0">
          <p className={responsive.body}>{description}</p>
          <p className={`mt-3 ${responsive.bodyMuted}`}>
            This feature is currently under development and will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
