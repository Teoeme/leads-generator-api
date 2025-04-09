'use client';

import { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Form,
  addToast,
} from '@heroui/react';
import useAuth from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
const router=useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
        const res=await login(email, password);
        if(res){
        router.push('/');
        }else{
          addToast({
            title:"Error al iniciar sesión",
            description:"Por favor, verifica tus credenciales y vuelve a intentarlo.",
            variant:"flat",
            color:'danger'
          })
          
        }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">
            Inicia sesión en tu cuenta
          </h2>
        </CardHeader>
        
        <CardBody>
          <Form onSubmit={handleSubmit} className="space-y-4 ">
              <Input
  label="Email"
id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Contraseña"
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

            <Button
              type="submit"
              variant="solid"
              className="w-full"
            >
              Iniciar sesión
            </Button>
          </Form>
        </CardBody>

      
      </Card>
    </div>
  );
} 