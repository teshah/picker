import { useState, useEffect } from 'react';
import { Clock, UserPlus2, Users } from 'lucide-react';
import useSound from 'use-sound';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  
  const [playTick] = useSound('./tick.mp3', { 
    volume: 0.5
  });
  
  const [playWin] = useSound('./win.mp3', { 
    volume: 0.5
  });

  useEffect(() => {
    // Load initial names from file
    fetch('/initial-names.txt')
      .then(response => response.text())
      .then(text => {
        const loadedNames = text.split('\n').filter(name => name.trim() !== '');
        setNames(loadedNames);
      })
      .catch(error => {
        console.error('Error loading names:', error);
        // Fallback to empty array if file cannot be loaded
        setNames([]);
      });
  }, []);

  const addName = () => {
    if (newName.trim() && names.length < 1000) {
      setNames([...names, newName.trim()]);
      setNewName('');
    }
  };

  const removeName = (nameToRemove: string) => {
    setNames(names.filter(name => name !== nameToRemove));
  };

  const pickRandomName = () => {
    if (names.length === 0) return;

    setIsSpinning(true);
    setTimeRemaining(7);

    const tickInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * names.length);
      setSelectedName(names[randomIndex]);
      playTick();
    }, 100);

    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    setTimeout(() => {
      clearInterval(tickInterval);
      clearInterval(timerInterval);
      const finalIndex = Math.floor(Math.random() * names.length);
      const finalName = names[finalIndex];
      setSelectedName(finalName);
      setNames((prevNames) => prevNames.filter((name) => name !== finalName));
      setSelectedHistory((prev) => [...prev, finalName]); // Add to history
      setIsSpinning(false);
      setTimeRemaining(0);
      playWin();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 7000);
  };

  const resetNames = async () => {
    try {
      const response = await fetch('/initial-names.txt');
      const text = await response.text();
      const loadedNames = text.split('\n').filter(name => name.trim() !== '');
      setNames(loadedNames);
      setSelectedHistory([]); // Clear history when resetting
    } catch (error) {
      console.error('Error loading names:', error);
    }
  };

  const loadHomeNames = async () => {
    try {
      const response = await fetch('/list2.txt');
      const text = await response.text();
      const loadedNames = text.split('\n').filter(name => name.trim() !== '');
      setNames(loadedNames);
      setSelectedHistory([]); // Clear history when loading home names
      setSelectedName(null); // Clear selected name as well
    } catch (error) {
      console.error('Error loading home names:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8 px-5">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-blue-900">Who is Next?</h1>
          <p className="text-blue-600">Add names to the list and randomly select who goes next!</p>
        </div>

        <Card className="p-6 bg-white shadow-xl">
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Enter a name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addName()}
              disabled={names.length >= 1000}
            />
            <Button
              onClick={addName}
              disabled={names.length >= 1000}
              className="flex gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus2 className="w-4 h-4" />
              Add Name
            </Button>
          </div>

          {names.length >= 1000 && (
            <p className="text-red-500 mb-4">Maximum limit of 1000 names reached!</p>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Participants ({names.length})</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="link" size="sm" onClick={loadHomeNames} className="text-blue-600 hover:text-blue-800">
                  Home
                </Button>
                <Button variant="link" size="sm" onClick={resetNames} className="text-blue-600 hover:text-blue-800">
                  Work
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="grid grid-cols-2 gap-4">
                {names.map((name, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center py-2 px-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg break-words">{name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeName(name)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 ml-2"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="text-center space-y-6">
            <Button
              size="lg"
              onClick={pickRandomName}
              disabled={isSpinning || names.length === 0}
              className="w-full max-w-md bg-blue-600 hover:bg-blue-700"
            >
              {isSpinning ? (
                <Clock className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Pick Random Name
            </Button>

            {selectedName && (
              <div className={`text-2xl font-bold text-blue-900 transition-all duration-300 ${isSpinning ? 'animate-pulse' : ''}`}>
                {isSpinning ? (
                  <>
                    Selecting... ({timeRemaining}s remaining)
                  </>
                ) : (
                  <>
                    And the person selected to be next is:
                    <div className="text-3xl text-blue-600 mt-2">
                      {selectedName}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        {selectedHistory.length > 0 && (
          <Card className="mt-8 p-6 bg-white shadow-xl">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Previously Selected Names:</h2>
            <div className="text-gray-600">
              {selectedHistory.map((name, index) => (
                <div key={index} className="py-1">
                  {index + 1}. {name}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;