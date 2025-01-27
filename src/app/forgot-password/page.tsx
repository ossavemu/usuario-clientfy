import { ResetPasswordForm } from '@/components/ResetPasswordForm';
import { Card, CardContent } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-[500px]">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Recuperar Contraseña
          </h2>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
