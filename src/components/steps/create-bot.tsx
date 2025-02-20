'use client';

import { CreateBotFlow } from '@/components/flows/create-bot-flow';

interface CreateBotStepProps {
  phoneNumber: string;
  countryCode: string;
  userEmail: string;
  companyName: string;
  existingInstance?: {
    exists: boolean;
    ip: string | null;
    isActive: boolean;
    hasQr: boolean;
  } | null;
}

export function CreateBotStep({
  phoneNumber,
  countryCode,
  userEmail,
  companyName,
  existingInstance,
}: CreateBotStepProps) {
  return (
    <CreateBotFlow
      phoneNumber={phoneNumber}
      countryCode={countryCode}
      userEmail={userEmail}
      companyName={companyName}
      existingInstance={existingInstance}
    />
  );
}
