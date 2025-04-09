'use client';

import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button 
} from '@heroui/react';

export default function Dashboard() {
  const router = useRouter();
  
return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-2">Bienvenido a la plataforma de generación de leads</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button 
              variant="solid" 
              onPress={() => router.push('/campaigns')}
            >
              Gestionar Campañas
            </Button>
            
            <Button 
              variant="bordered" 
              onPress={() => router.push('/leads')}
            >
              Ver Leads
            </Button>
            
            <Button 
              variant="ghost" 
              onPress={() => router.push('/accounts')}
            >
              Cuentas de Redes Sociales
            </Button>
            
            <Button 
              variant="light" 
              onPress={() => router.push('/settings')}
            >
              Configuración
            </Button>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
