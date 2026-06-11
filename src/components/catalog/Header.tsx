import { Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  currentView: 'catalog' | 'admin';
  setCurrentView: (view: 'catalog' | 'admin') => void;
  setIsAuthModalOpen: (open: boolean) => void;
}

export function Header({ currentView, setCurrentView, setIsAuthModalOpen }: HeaderProps) {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <header className="border-b border-[#ECE7DC] bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-30 transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-6xl">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <Scissors className="h-5 w-5 text-[#C4B297] transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7A6241] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7A6241]"></span>
            </span>
          </div>
          <span className="text-xl font-bold tracking-widest uppercase text-foreground font-serif">
            KAREN MENDEZ <span className="text-[#7A6241] font-light font-sans font-normal">HAIR DESIGNER</span>
          </span>
        </div>
        <nav className="flex items-center gap-4">
          {isAdmin && (
            <Button 
              variant="outline" 
              className="border-[#7A6241] text-[#7A6241] hover:bg-[#7A6241] hover:text-white font-light rounded-none tracking-widest text-xs px-4"
              onClick={() => setCurrentView(currentView === 'catalog' ? 'admin' : 'catalog')}
            >
              {currentView === 'catalog' ? 'PANEL ADMIN' : 'CATÁLOGO'}
            </Button>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#534C43] tracking-wider uppercase font-light hidden md:inline">
                {user?.name}
              </span>
              <Button 
                variant="ghost" 
                className="text-[#534C43] hover:text-[#1E1D1A] font-light text-xs tracking-wider"
                onClick={logout}
              >
                SALIR
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              className="text-[#5C574F] hover:text-[#1E1D1A] font-light text-sm tracking-wider"
              onClick={() => setIsAuthModalOpen(true)}
            >
              ENTRAR
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
