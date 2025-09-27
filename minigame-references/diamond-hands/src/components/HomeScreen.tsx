import { Button } from './ui/button';
import diamondHeroImg from 'figma:asset/f41d04888440c11eaedeb6c79983fbe69edd0abb.png';

interface HomeScreenProps {
  onStartDeposit: () => void;
  onShowTutorial: () => void;
}

export function HomeScreen({ onStartDeposit, onShowTutorial }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-6 text-gray-800">Diamond Hands</h1>
        <div className="mb-8">
          <img 
            src={diamondHeroImg} 
            alt="Diamond" 
            className="w-32 h-32 mx-auto object-contain"
          />
        </div>
        <p className="text-gray-600 text-lg mb-8 max-w-md">
          How long can you hold on to your diamond??
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button 
          onClick={onStartDeposit}
          className="w-full py-4 text-lg"
          size="lg"
        >
          Deposit to Start
        </Button>
        
        <Button 
          onClick={onShowTutorial}
          variant="secondary"
          className="w-full py-4 text-lg"
          size="lg"
        >
          How to Play
        </Button>
      </div>
    </div>
  );
}