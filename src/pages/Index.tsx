import { Header } from "@/components/Header";
import { Features } from "@/components/Features";
import { WizardForm } from "@/components/WizardForm";
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
      <div className="container mx-auto px-4 py-0">
        <Header />
        <Features />
        <WizardForm />
      </div>
    </div>;
};
export default Index;