import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title, description, icon }) {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            {icon || <Construction className="w-8 h-8 text-muted-foreground" />}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This page is currently under development.
          </p>
          <Button variant="outline" className="w-full">
            Request Implementation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
