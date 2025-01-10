"use client";

import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserInfoStep } from "@/components/AuthSlide";
import { type RegistrationData } from "@/types/registration";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = searchParams.get("mode") === "login";
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    countryCode: "",
    serviceType: "qr",
    images: [],
    trainingFiles: [],
    prompt: "",
    assistantName: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleUpdate = (data: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    router.push("/dashboard");
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <Card className="w-full max-w-[500px]">
          <CardContent className="p-6">
            <UserInfoStep
              data={formData}
              onUpdate={handleUpdate}
              onNext={handleNext}
              defaultMode={isLogin ? "login" : "register"}
            />
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}
