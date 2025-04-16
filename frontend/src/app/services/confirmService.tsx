import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';
import { createRoot } from 'react-dom/client';
import ConfirmDialog from '../Components/Templates/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  content: string | React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'default' | 'danger' | 'primary' | 'secondary' | 'success' | 'warning';
  cancelButtonColor?: 'default' | 'danger' | 'primary' | 'secondary' | 'success' | 'warning';
  confirmationText?:string

}

export const confirm = (options: ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve,reject) => {
    const container = document.createElement('div');
    container.id = 'confirm-dialog-container';
    document.body.appendChild(container);
    
    try {
      const root = createRoot(container);

      const handleClose = (result: boolean) => {
        try {
          root.unmount();
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        if(result){
          resolve(true)
        }else{
          reject(false)
        }
        } catch (error) {
          console.error('Error al cerrar el diálogo:', error);
          reject(false);
        }
      };

      const element = (
          <HeroUIProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={true}
            >
              <div className='fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm transition-all duration-300'>

              <ConfirmDialog
                isOpen={true}
                title={options.title || 'Confirmar'}
                content={options.content}
                onConfirm={() => handleClose(true)}
                onCancel={() => handleClose(false)}
                confirmButtonText={options.confirmButtonText}
                cancelButtonText={options.cancelButtonText}
                confirmButtonColor={options.confirmButtonColor}
                cancelButtonColor={options.cancelButtonColor}
                confirmationText={options.confirmationText}
                />
                </div>
            </ThemeProvider>
          </HeroUIProvider>
      );
      
      root.render(element);
    } catch (error) {
      console.error('Error al renderizar el diálogo de confirmación:', error);
      document.body.removeChild(container);
      resolve(false);
    }
  });
}; 