'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Trash2 } from 'lucide-react';
import {
  useEffect,
  useEffect as useEffectReact,
  useRef,
  useState,
} from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner';

type Franchise = {
  id: number;
  name: string;
  person_or_company_name: string;
  state_id: string;
  email: string;
  contracted_instances: number;
  created_at: string;
};

type SignatureType = 'font' | 'draw' | 'upload';

export default function FranchisesPage() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [contractLinks, setContractLinks] = useState<Record<number, string>>(
    {},
  );
  const [form, setForm] = useState({
    name: '',
    personOrCompanyName: '',
    stateId: '',
    email: '',
    contractedInstances: 1,
  });
  const [signatureType, setSignatureType] = useState<SignatureType>('font');
  const [signature, setSignature] = useState('');
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const franchisesAuth = localStorage.getItem('franchisesAuth');
    if (franchisesAuth === 'true') {
      setAuth(true);
      fetchFranchises();
    }
    setLoading(false);
  }, []);

  useEffectReact(() => {
    const fontName = 'Caligraphic';
    const fontUrl = '/caligraphic.woff2';
    const font = new FontFace(fontName, `url(${fontUrl})`);
    font.load().then((loaded) => {
      document.fonts.add(loaded);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      localStorage.setItem('franchisesAuth', 'true');
      setAuth(true);
      fetchFranchises();
    } else {
      toast.error('Wrong password');
    }
    setLoading(false);
  };

  const fetchFranchises = async () => {
    setLoading(true);
    const res = await fetch('/api/franchises');
    const data = await res.json();
    setFranchises(data.franquicias || []);
    // Buscar links de contrato en S3 para cada franquicia
    const links: Record<number, string> = {};
    for (const f of data.franquicias || []) {
      const key = `contract-${f.state_id}.pdf`;
      // Asumimos que el contrato está en S3 bajo el email y tipo 'training'
      const s3Res = await fetch(
        `/api/s3/franchise-contract?email=${encodeURIComponent(
          f.email,
        )}&key=${encodeURIComponent(key)}`,
      );
      const s3Data = await s3Res.json();
      if (s3Data.url) links[f.id] = s3Data.url;
    }
    setContractLinks(links);
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === 'number' ? Number(e.target.value) : e.target.value,
    });
  };

  const handleSignatureType = (type: SignatureType) => {
    setSignatureType(type);
    setSignature('');
    setSignatureFile(null);
    if (sigCanvas.current !== null) sigCanvas.current.clear();
  };

  const handleSignatureFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSignatureFile(e.target.files[0]);
      setSignature('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.personOrCompanyName ||
      !form.stateId ||
      !form.email
    ) {
      toast.error('Complete all fields');
      return;
    }
    let signatureData = '';
    if (signatureType === 'draw') {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        toast.error('Draw your signature');
        return;
      }
      signatureData = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL('image/png');
    } else if (signatureType === 'upload' && signatureFile) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        signatureData = ev.target?.result as string;
        await sendFranchise(signatureData);
      };
      reader.readAsDataURL(signatureFile);
      return;
    } else if (signatureType === 'font') {
      if (!signature) {
        toast.error('Type your signature');
        return;
      }
      signatureData = signature;
    }
    await sendFranchise(signatureData);
  };

  const sendFranchise = async (signatureData: string) => {
    setSubmitting(true);
    setPdfUrl(null);
    const res = await fetch('/api/franchises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, signatureType, signatureData }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Franchise created and contract sent');
      fetchFranchises();
      setPdfUrl(`data:application/pdf;base64,${data.pdfBase64}`);
      setForm({
        name: '',
        personOrCompanyName: '',
        stateId: '',
        email: '',
        contractedInstances: 1,
      });
      setSignature('');
      setSignatureFile(null);
      if (sigCanvas.current !== null) sigCanvas.current.clear();
    } else {
      toast.error(data.message || 'Error creating franchise');
    }
    setSubmitting(false);
  };

  const handleDeleteFranchise = async (email: string) => {
    if (
      !window.confirm(
        '¿Seguro que deseas eliminar la franquicia? Esta acción no se puede deshacer.',
      )
    )
      return;
    const res = await fetch(
      `/api/franchises?email=${encodeURIComponent(email)}`,
      { method: 'DELETE' },
    );
    const data = await res.json();
    if (data.success) {
      toast.success('Franquicia eliminada');
      fetchFranchises();
    } else {
      toast.error('No se pudo eliminar la franquicia');
    }
  };

  if (!auth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Acceso a Franquicias</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Label htmlFor="password">Contraseña de administrador</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={loading}>
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Registrar Nueva Franquicia</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <Label>Nombre de la franquicia</Label>
              <Input name="name" value={form.name} onChange={handleChange} />
              <Label>Nombre de la persona o empresa</Label>
              <Input
                name="personOrCompanyName"
                value={form.personOrCompanyName}
                onChange={handleChange}
              />
              <Label>ID</Label>
              <Input
                name="stateId"
                value={form.stateId}
                onChange={handleChange}
              />
              <Label>Email</Label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
              />
              <Label>Número de instancias contratadas</Label>
              <select
                name="contractedInstances"
                value={form.contractedInstances}
                onChange={handleChange}
                className="w-full border rounded px-2 py-2"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Firma digital</Label>
              <div className="flex space-x-2 mb-2">
                <Button
                  type="button"
                  variant={signatureType === 'font' ? 'default' : 'outline'}
                  onClick={() => handleSignatureType('font')}
                >
                  Fuente
                </Button>
                <Button
                  type="button"
                  variant={signatureType === 'draw' ? 'default' : 'outline'}
                  onClick={() => handleSignatureType('draw')}
                >
                  Dibujar
                </Button>
                <Button
                  type="button"
                  variant={signatureType === 'upload' ? 'default' : 'outline'}
                  onClick={() => handleSignatureType('upload')}
                >
                  Subir
                </Button>
              </div>
              {signatureType === 'font' && (
                <>
                  <Input
                    placeholder="Firma caligráfica"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                  <div className="mt-2 border rounded bg-white px-2 py-1">
                    <span style={{ fontFamily: 'Caligraphic', fontSize: 28 }}>
                      {signature || 'Previsualización'}
                    </span>
                  </div>
                </>
              )}
              {signatureType === 'draw' && (
                <div className="border rounded bg-white">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                      width: 300,
                      height: 100,
                      className: 'rounded',
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      if (sigCanvas.current) sigCanvas.current.clear();
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              )}
              {signatureType === 'upload' && (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureFile}
                />
              )}
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={submitting}
              >
                Registrar Franquicia
              </Button>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download="contrato.pdf"
                  className="block mt-2 text-blue-600 underline"
                >
                  Descargar contrato PDF
                </a>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Franquicias Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Persona/Empresa</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Instancias</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Contrato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchises.map((f: Franchise) => (
                <TableRow key={f.id}>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>{f.person_or_company_name}</TableCell>
                  <TableCell>{f.state_id}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell>{f.contracted_instances}</TableCell>
                  <TableCell>
                    {new Date(f.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {contractLinks[f.id] ? (
                        <a
                          href={contractLinks[f.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Descargar contrato"
                        >
                          <Button size="icon" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                      ) : (
                        <span className="text-gray-400">No disponible</span>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Eliminar franquicia"
                        onClick={() => handleDeleteFranchise(f.email)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
