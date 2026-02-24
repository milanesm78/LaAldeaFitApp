import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">JavierFitness</CardTitle>
          <CardDescription>
            {t("auth.login")} / {t("auth.register")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t("common.loading")}
          </p>
          <Button variant="outline" size="sm" onClick={toggleLanguage}>
            {i18n.language === "es" ? "EN" : "ES"}
          </Button>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}

export default App;
