'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';

interface AppointmentData {
  url: string;
}

export default function AppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppointmentData | null>(null);
  const [userNumber, setUserNumber] = useState<string>('');
  const [botNumber, setBotNumber] = useState<string>('');
  const [calendarType, setCalendarType] = useState<
    'virtual' | 'in-person' | 'both' | null
  >(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [virtualUrl, setVirtualUrl] = useState<string>('');
  const [inPersonUrl, setInPersonUrl] = useState<string>('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentType, setCurrentType] = useState<'virtual' | 'in-person'>(
    'virtual',
  );
  const [name, setName] = useState<string>('');

  const handleTypeChange = (type: 'virtual' | 'in-person') => {
    setCurrentType(type);
  };

  useCalendlyEventListener({
    onEventScheduled: async () => {
      const typeOfEvent = currentType;
      await fetch('/api/appointment/notification', {
        method: 'POST',
        body: JSON.stringify({ botNumber, userNumber, typeOfEvent, name }),
      });
    },
  });

  const fetchType = useCallback(async (botNumber: string) => {
    const url = new URL(window.location.origin + '/api/appointment/type');
    url.searchParams.set('botNumber', botNumber);
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.type as 'virtual' | 'in-person' | 'both';
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const query = new URLSearchParams(window.location.search);
      const userNumber = query.get('userNumber') as string;
      const botNumber = query.get('botNumber') as string;
      const name = query.get('name') as string;

      if (!userNumber || !botNumber || !name) {
        router.push('/');
        return;
      }
      setName(name === 'unknown' ? '' : name);
      setUserNumber(userNumber);
      setBotNumber(botNumber);

      const calendarTypeValue = (await fetchType(botNumber)) as
        | 'virtual'
        | 'in-person'
        | 'both';

      setCalendarType(calendarTypeValue as 'virtual' | 'in-person' | 'both');
      if (calendarTypeValue === 'both') {
        setShowTypeSelector(true);
        setShowInfoModal(true);

        // Cargar ambas URLs por adelantado
        const fetchUrlForType = async (type: 'virtual' | 'in-person') => {
          const url = new URL(window.location.origin + '/api/appointment');
          url.searchParams.set('botNumber', botNumber);
          url.searchParams.set('type', type);
          try {
            const response = await fetch(url);
            const data = await response.json();
            return data.calendlyUrl;
          } catch (error) {
            console.error(`Error fetching ${type} URL:`, error);
            return '';
          }
        };

        const virtualUrlData = await fetchUrlForType('virtual');
        setVirtualUrl(virtualUrlData);

        const inPersonUrlData = await fetchUrlForType('in-person');
        setInPersonUrl(inPersonUrlData);

        setLoading(false);
        return;
      }
      const url = new URL(window.location.origin + '/api/appointment');
      url.searchParams.set('botNumber', botNumber);
      if (calendarTypeValue) url.searchParams.set('type', calendarTypeValue);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 1500);
      });
      try {
        const fetchPromise = fetch(url);
        const response = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as Response;
        const data = await response.json();
        setData({ url: data.calendlyUrl });
      } catch {
        router.push('/');
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [router, fetchType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="w-full max-w-md h-[400px] mx-auto mb-4">
      <motion.div
        className="bg-white rounded-3xl shadow-md overflow-hidden "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="animate-pulse text-[#37265a]">
              Cargando calendario...
            </div>
          </div>
        ) : showTypeSelector && calendarType === 'both' ? (
          <div className="flex flex-col items-center gap-4 py-4 w-full">
            <Tabs defaultValue="virtual" className="w-full">
              <TabsList className="mb-4 grid grid-cols-2 w-[300px] mx-auto">
                <TabsTrigger
                  value="virtual"
                  onClick={() => handleTypeChange('virtual')}
                >
                  Virtual
                </TabsTrigger>
                <TabsTrigger
                  value="in-person"
                  onClick={() => handleTypeChange('in-person')}
                >
                  Presencial
                </TabsTrigger>
              </TabsList>
              <TabsContent value="virtual" className="overflow-hidden">
                {virtualUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <InlineWidget
                      url={virtualUrl}
                      styles={{
                        width: '100%',
                        height: '400px',
                      }}
                      prefill={{
                        name,
                      }}
                      pageSettings={{
                        backgroundColor: 'ffffff',
                        hideEventTypeDetails: true,
                        hideLandingPageDetails: true,
                        primaryColor: '37265a',
                        textColor: '37265a',
                        hideGdprBanner: true,
                      }}
                    />
                  </motion.div>
                )}
              </TabsContent>
              <TabsContent value="in-person" className="overflow-hidden">
                {inPersonUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <InlineWidget
                      url={inPersonUrl}
                      styles={{
                        width: '100%',
                        height: '400px',
                      }}
                      prefill={{
                        name,
                      }}
                      pageSettings={{
                        backgroundColor: 'ffffff',
                        hideEventTypeDetails: true,
                        hideLandingPageDetails: true,
                        primaryColor: '37265a',
                        textColor: '37265a',
                        hideGdprBanner: true,
                      }}
                    />
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="overflow-hidden"
            >
              <InlineWidget
                url={data.url}
                styles={{
                  width: '100%',
                  height: '500px',
                }}
                prefill={{
                  name,
                }}
                pageSettings={{
                  backgroundColor: 'ffffff',
                  hideEventTypeDetails: true,
                  hideLandingPageDetails: true,
                  primaryColor: '37265a',
                  textColor: '37265a',
                  hideGdprBanner: true,
                }}
              />
            </motion.div>
          )
        )}
      </motion.div>

      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-md rounded-4xl">
          <DialogHeader>
            <DialogTitle className="text-center text-[#37265a] text-xl">
              Tipos de Agendamiento Disponibles
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Tienes disponible dos tipos de agendamiento para tu cita:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-col space-y-4">
              <div className="border rounded-lg p-3 bg-purple-50">
                <h3 className="font-medium text-[#37265a]">Virtual</h3>
                <p className="text-sm text-gray-600">
                  Cita por videollamada desde cualquier lugar
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-purple-50">
                <h3 className="font-medium text-[#37265a]">Presencial</h3>
                <p className="text-sm text-gray-600">
                  Cita en persona en la ubicación del negocio
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowInfoModal(false)}
              className="w-full bg-[#7500D1] hover:bg-[#5C00A3]"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
