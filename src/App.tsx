import { useState, useEffect } from 'react';
import { Clock, UserPlus2 } from 'lucide-react';
import useSound from 'use-sound';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import clsx from 'clsx';
import { Slider } from '@/components/ui/slider';
import { SpinningWheel } from '@/components/SpinningWheel';

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [activeList, setActiveList] = useState<'home' | 'work' | '15' | 'custom'>('home');
  const [justSelected, setJustSelected] = useState<string | null>(null);
  const [spinDuration, setSpinDuration] = useState(7);
  const [showSpinDuration, setShowSpinDuration] = useState(false);
  const [showCustomButton, setShowCustomButton] = useState(false);

  // Show slider only if ?time=true is in the query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowSpinDuration(params.get('time') === 'true');
  }, []);

  // Toggle time query param and slider
  const handleTitleDoubleClick = () => {
    const params = new URLSearchParams(window.location.search);
    const hasTime = params.get('time') === 'true';
    if (hasTime) {
      params.delete('time');
    } else {
      params.set('time', 'true');
    }
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
    setShowSpinDuration(!hasTime);
  };
  
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
    const unselectedNames = names.filter((n) => !selectedHistory.includes(n));
    if (unselectedNames.length === 0) return;

    setIsSpinning(true);
    setTimeRemaining(spinDuration);

    const tickInterval = setInterval(() => {
      playTick();
    }, 100);

    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    setTimeout(() => {
      clearInterval(tickInterval);
      clearInterval(timerInterval);
      const finalIndex = Math.floor(Math.random() * unselectedNames.length);
      const finalName = unselectedNames[finalIndex];
      setJustSelected(finalName); // highlight
      setTimeout(() => setJustSelected(null), 1200); // remove highlight after 1.2s
      setSelectedHistory((prev) => [...prev, finalName]); // Add to history
      setIsSpinning(false);
      setTimeRemaining(0);
      playWin();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, spinDuration * 1000);
  };

  const resetNames = async () => {
    try {
      const response = await fetch('/initial-names.txt');
      const text = await response.text();
      const loadedNames = text.split('\n').filter(name => name.trim() !== '');
      setNames(loadedNames);
      setSelectedHistory([]); // Clear history when resetting
      setActiveList('work');
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
      setActiveList('home');
    } catch (error) {
      console.error('Error loading home names:', error);
    }
  };

  const load15Names = async () => {
    try {
      const response = await fetch('/list15.txt');
      const text = await response.text();
      const loadedNames = text.split('\n').filter(name => name.trim() !== '');
      setNames(loadedNames);
      setSelectedHistory([]); // Clear history when loading 15 names
      setActiveList('15');
    } catch (error) {
      console.error('Error loading 15 names:', error);
    }
  };

  const activateCustom = () => {
    setNames([]);
    setSelectedHistory([]);
    setActiveList('custom');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-50 to-blue-100">
      <SpinningWheel
        isSpinning={isSpinning}
        timeRemaining={timeRemaining}
        spinDuration={spinDuration}
      />
      <div className="min-h-screen w-screen flex items-center justify-center p-0">
        <div className="max-w-4xl w-full flex flex-col justify-center space-y-6 px-1 sm:px-5">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold text-blue-700 drop-shadow-lg select-none">
              <span
                className="cursor-pointer hover:underline"
                onDoubleClick={() => setShowCustomButton((prev) => !prev)}
                title="Double-click to toggle Custom button"
              >
                Randomly
              </span>{' '}
              select who is{' '}
              <span
                className="cursor-pointer hover:underline"
                onDoubleClick={handleTitleDoubleClick}
                title="Double-click to toggle spin duration slider"
              >
                next?
              </span>
            </h1>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['home', 'work', '15'].map((key) => (
                <Button
                  key={key}
                  variant={activeList === key ? 'default' : 'outline'}
                  aria-pressed={activeList === key}
                  onClick={
                    key === 'home' ? loadHomeNames :
                    key === 'work' ? resetNames :
                    load15Names
                  }
                  className={clsx(
                    'min-w-[80px] font-semibold',
                    activeList === key ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600',
                    'transition-colors duration-200'
                  )}
                >
                  {key === '15' ? '15' : key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
              {showCustomButton && (
                <Button
                  key="custom"
                  variant={activeList === 'custom' ? 'default' : 'outline'}
                  aria-pressed={activeList === 'custom'}
                  onClick={activateCustom}
                  className={clsx(
                    'min-w-[80px] font-semibold',
                    activeList === 'custom' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600',
                    'transition-colors duration-200'
                  )}
                >
                  Custom
                </Button>
              )}
            </div>
          </div>

          <Card className="p-4 sm:p-6 bg-blue-50 min-h-[70vh] flex flex-col border-none shadow-none">
            {activeList === 'custom' && (
              <div className="flex gap-4 mb-6">
                <label className="sr-only" htmlFor="custom-name-input">Add names to this list...</label>
                <Input
                  id="custom-name-input"
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
            )}

            {names.length >= 1000 && (
              <p className="text-red-500 mb-4">Maximum limit of 1000 names reached!</p>
            )}

            <ScrollArea className="max-h-[60vh] border rounded-md p-1 sm:p-4 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                {names.map((name, index) => (
                  <div 
                    key={index}
                    className={clsx(
                      'flex justify-between items-center py-1 px-1 sm:py-2 sm:px-2 rounded-md transition-colors',
                      selectedHistory.includes(name)
                        ? 'bg-indigo-100'
                        : 'bg-indigo-50 hover:bg-indigo-100',
                      justSelected === name && 'animate-pulse bg-yellow-100'
                    )}
                  >
                    <span
                      className={clsx(
                        'text-base sm:text-lg break-words transition-all duration-500',
                        selectedHistory.includes(name) && 'line-through text-gray-400',
                        justSelected === name && 'font-bold text-yellow-700'
                      )}
                      aria-label={selectedHistory.includes(name) ? 'Previously selected' : undefined}
                    >
                      {name}
                      {selectedHistory.includes(name) && (
                        <span className="ml-2 text-xs text-gray-400">
                          ({(() => {
                            const idx = selectedHistory.indexOf(name);
                            if (idx === 0) return '1st';
                            if (idx === 1) return '2nd';
                            if (idx === 2) return '3rd';
                            return `${idx + 1}th`;
                          })()})
                        </span>
                      )}
                    </span>
                    {!selectedHistory.includes(name) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeName(name)}
                        className="text-2xl text-indigo-500 hover:text-indigo-700 font-bold ml-2"
                        aria-label="Remove name"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-auto pt-4 flex flex-col items-center">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={pickRandomName}
                  disabled={isSpinning || names.filter((n) => !selectedHistory.includes(n)).length === 0}
                  className="w-full max-w-md bg-blue-600 hover:bg-blue-700"
                >
                  {isSpinning ? (
                    <Clock className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Pick Random Name
                </Button>
                {showSpinDuration && (
                  <div className="flex flex-col items-center w-full max-w-xs mt-4 md:mt-0">
                    <div className="relative w-full flex items-center justify-center mb-2">
                      {/* Floating label above thumb */}
                      <span
                        className="absolute left-1/2 -translate-x-1/2 -top-7 text-blue-700 text-base font-bold bg-white px-2 py-0.5 rounded shadow"
                        style={{ minWidth: 40 }}
                      >
                        {spinDuration}s
                      </span>
                    </div>
                    <Slider
                      min={3}
                      max={7}
                      step={1}
                      value={[spinDuration]}
                      onValueChange={([v]) => setSpinDuration(v)}
                      className="w-full h-2 bg-blue-200 rounded-full relative"
                      aria-label="Spin duration in seconds"
                      style={{ accentColor: '#2563eb' }}
                    />
                    <div className="flex justify-between w-full mt-1 text-xs text-blue-700 font-medium">
                      {[3, 4, 5, 6, 7].map((sec) => (
                        <span key={sec}>{sec}s</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;