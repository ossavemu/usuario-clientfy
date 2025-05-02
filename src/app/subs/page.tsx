'use client';
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { Toaster, toast } from 'sonner';

type User = {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
};

const initialUsers: User[] = [
  /*   {
    number: '1111 2222 11111 2222',
    name: 'Pedro Césamo',
    expiry: '12/28',
    cvc: '478',
  }, */
  {
    number: '4901 4901 4901 4901',
    name: 'Mario Césamo',
    expiry: '10/28',
    cvc: '499',
  },
];

export default function SubsPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [lastDeleted, setLastDeleted] = useState<User | null>(null);

  const handleOpenModal = (user: User) => {
    setSelected(user);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (!selected) return;
    setUsers((prev) => prev.filter((u) => u.number !== selected.number));
    setLastDeleted(selected);
    setSelected(null);
    toast(
      <div className="flex items-center gap-4">
        <span>Tarjeta eliminada</span>
        <button
          className="ml-2 px-3 py-1 rounded-lg bg-purple-100 text-purple-700 font-medium hover:bg-purple-200 transition"
          onClick={() => {
            setUsers((prev) => [lastDeleted!, ...prev]);
            setLastDeleted(null);
            toast.dismiss();
          }}
        >
          Deshacer
        </button>
      </div>,
      { duration: 4000 },
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full">
      <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 space-y-10 border border-purple-100 mt-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-8 tracking-tight drop-shadow-sm">
          Gestionar Suscripción
        </h1>
        <AnimatePresence>
          {users.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="text-center text-xl text-gray-500 py-16"
            >
              No tienes tarjetas activas.
            </motion.div>
          ) : (
            users.map((user) => (
              <motion.div
                key={user.number}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ duration: 0.35, type: 'spring' }}
                className="flex flex-col items-center gap-4 group bg-gray-50/60 rounded-2xl p-6 shadow-md border border-gray-100"
              >
                <div className="rounded-2xl shadow-xl overflow-hidden">
                  <Cards
                    number={user.number}
                    name={user.name}
                    expiry={user.expiry}
                    cvc={user.cvc}
                    focused={''}
                  />
                </div>
                <div className="text-center w-full">
                  <div className="text-xl font-semibold text-purple-700 group-hover:text-purple-900 transition-colors duration-300">
                    {user.name}
                  </div>
                  <div className="text-base text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                    Expira: {user.expiry}
                  </div>
                </div>
                <div className="flex w-full justify-end">
                  <button
                    className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium shadow hover:from-red-500 hover:to-red-400 transition-all text-base focus:outline-none focus:ring-2 focus:ring-purple-300 flex items-center gap-2"
                    onClick={() => handleOpenModal(user)}
                  >
                    <LogOut className="w-5 h-5" />
                    Desuscribirse
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        title="¿Desuscribirse de la tarjeta?"
        message="Esta acción eliminará tu suscripción y no podrás revertirla."
        itemName={selected?.name || ''}
        confirmButtonText="Desuscribirse"
        customIcon={<LogOut className="w-6 h-6 text-purple-600" />}
        confirmVariant="destructive"
      />
      <Toaster richColors position="top-center" />
    </div>
  );
}
