

import React from 'react';
import type { LabState } from '../types';

interface VirtualLabProps {
  state: LabState;
}

const VaporParticle: React.FC<{ index: number }> = ({ index }) => {
  const duration = 2 + Math.random() * 2; // 2s to 4s
  const delay = Math.random() * 2; // 0s to 2s
  const xStart = 45 + Math.random() * 10; // %
  const xEnd = 30 + Math.random() * 40; // %

  return (
    <div
      className="absolute bottom-[48%] rounded-full bg-blue-200/80 opacity-0"
      style={{
        width: `${5 + Math.random() * 5}px`,
        height: `${5 + Math.random() * 5}px`,
        left: `${xStart}%`,
        animation: `vapor-rise ${duration}s ease-in ${delay}s infinite`,
        animationName: `vapor-rise-${index}`,
      }}
    >
        <style>{`
          @keyframes vapor-rise-${index} {
            0% {
              transform: translateY(0) scale(0.5);
              opacity: 0;
              left: ${xStart}%;
            }
            20% {
              opacity: 0.7;
            }
            100% {
              transform: translateY(-120px) scale(1.5);
              opacity: 0;
              left: ${xEnd}%;
            }
          }
        `}</style>
    </div>
  );
};

const SmokeParticle: React.FC<{ index: number }> = ({ index }) => {
    const duration = 1.5 + Math.random() * 1; // 1.5s to 2.5s
    const delay = Math.random() * 1.5; // 0s to 1.5s
    const xStart = 40 + Math.random() * 20; // %
    const xEnd = 35 + Math.random() * 30; // %

    return (
        <div
        className="absolute bottom-[45%] rounded-full bg-gray-300/50 opacity-0"
        style={{
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
            left: `${xStart}%`,
            animation: `smoke-rise ${duration}s ease-out ${delay}s infinite`,
            animationName: `smoke-rise-${index}`,
        }}
        >
        <style>{`
            @keyframes smoke-rise-${index} {
            0% {
                transform: translateY(0) scale(0.6);
                opacity: 0;
                left: ${xStart}%;
            }
            30% {
                opacity: 0.5;
            }
            100% {
                transform: translateY(-30px) scale(1.2);
                opacity: 0;
                left: ${xEnd}%;
            }
            }
        `}</style>
        </div>
    );
};


const CondensationDroplet: React.FC<{ index: number }> = ({ index }) => {
  const duration = 4 + Math.random() * 5; // Randomize duration 4s to 9s
  const delay = Math.random() * 5; // 0s to 5s
  const xPos = 10 + Math.random() * 80; // %
  
  return (
    <div
      className="absolute top-0 rounded-full bg-blue-400/90 opacity-0"
      style={{
        width: `${2 + Math.random() * 2}px`,
        height: `${2 + Math.random() * 2}px`,
        left: `${xPos}%`,
        animation: `condense-drip ${duration}s ease-in-out ${delay}s infinite`
      }}
    />
  );
};

const IceCubeInWater: React.FC = () => {
    return (
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-8 h-8 bg-cyan-200/80 rounded-md border-2 border-cyan-300 animate-drop-and-melt">
            <style>{`
                @keyframes drop-and-melt {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    20% { transform: translateY(80px) rotate(45deg); opacity: 1; }
                    30% { transform: translateY(75px) rotate(45deg) scale(1); opacity: 1; }
                    100% { transform: translateY(85px) rotate(90deg) scale(0); opacity: 0; }
                }
                .animate-drop-and-melt {
                    animation: drop-and-melt 5s ease-in-out forwards;
                }
            `}</style>
        </div>
    )
}

const SaltParticleInWater: React.FC<{index: number}> = ({index}) => {
    const delay = index * 0.05;
    const duration = 1.5 + Math.random() * 0.5;
    const xStart = 45 + (Math.random() - 0.5) * 10;
    const xEnd = 50 + (Math.random() - 0.5) * 60;
    const yEnd = 60 + Math.random() * 20;

    return (
        <div className="absolute top-[-20px] w-1 h-1 bg-white rounded-full"
            style={{
                left: `${xStart}%`,
                animation: `pour-and-dissolve-${index} ${duration}s ease-in ${delay}s forwards`,
            }}
        >
             <style>{`
                @keyframes pour-and-dissolve-${index} {
                    0% { transform: translateY(0); opacity: 1; left: ${xStart}%; }
                    70% { transform: translateY(${yEnd}px); opacity: 1; left: ${xEnd}%; }
                    100% { transform: translateY(${yEnd + 10}px); opacity: 0; left: ${xEnd}%;}
                }
            `}</style>
        </div>
    )
}

export const VirtualLab: React.FC<VirtualLabProps> = ({ state }) => {
  const { isHeating, showVapor, isIceOnLid, showCondensation, isIceInWater, isSaltInWater } = state;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full max-w-[300px] sm:max-w-[400px] aspect-square">
        {/* Table */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-2 bg-yellow-700 rounded-md shadow-md"></div>

        {/* Beaker */}
        <div className="absolute bottom-[2%] w-full h-full flex justify-center items-end">
          <div className="relative w-40 h-40 sm:w-52 sm:h-52">
            {/* Beaker Glass */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-200/20 border-4 border-gray-400 rounded-t-xl rounded-b-lg border-b-8"></div>
            {/* Water */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-400 rounded-b-md transition-all duration-1000 ${isHeating ? 'animate-boil' : ''}`}>
              <div className="w-full h-full bg-blue-500/20 relative overflow-hidden">
                {isIceInWater && <IceCubeInWater />}
                {isSaltInWater && Array.from({ length: 30 }).map((_, i) => <SaltParticleInWater key={i} index={i} />)}
              </div>
            </div>
            
            {/* Smoke when heating starts */}
            {isHeating && !showVapor && Array.from({ length: 20 }).map((_, i) => <SmokeParticle key={i} index={i} />)}
            {/* Vapor */}
            {showVapor && Array.from({ length: 40 }).map((_, i) => <VaporParticle key={i} index={i} />)}
            
            {/* Lid */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-[105%] h-5 bg-gray-300 border-2 border-gray-400 rounded-md">
                 {/* Ice */}
                {isIceOnLid && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-6 flex justify-center items-center space-x-1">
                        <div className="w-5 h-5 bg-cyan-200 rounded-sm rotate-12 opacity-90 border border-cyan-300"></div>
                        <div className="w-6 h-6 bg-cyan-200 rounded-sm -rotate-6 opacity-90 border border-cyan-300"></div>
                        <div className="w-5 h-5 bg-cyan-200 rounded-sm rotate-6 opacity-90 border border-cyan-300"></div>
                    </div>
                )}
                {/* Condensation Container */}
                <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-full h-4">
                  {showCondensation && Array.from({ length: 20 }).map((_, i) => <CondensationDroplet key={i} index={i}/>)}
                </div>
            </div>
          </div>
        </div>

        {/* Heater */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-52 h-10 flex flex-col items-center">
            <div className="w-full h-2 bg-gray-600 rounded-full"></div>
            <div className="w-2 h-4 bg-gray-500"></div>
             {/* Flames */}
            {isHeating && (
                <div className="absolute -bottom-8 w-32 h-16 flex justify-around">
                    <div className="w-8 h-12 bg-orange-400 rounded-t-full animate-flame"></div>
                    <div className="w-8 h-16 bg-yellow-400 rounded-t-full animate-flame animation-delay-200"></div>
                    <div className="w-8 h-12 bg-orange-400 rounded-t-full animate-flame animation-delay-400"></div>
                </div>
            )}
        </div>
        
        <style>{`
            @keyframes boil {
                0% { transform: translateY(0) scale(1); border-radius: 0 0 6px 6px; }
                50% { transform: translateY(-2px) scale(1.01); border-radius: 0 0 10px 10px; }
                100% { transform: translateY(0) scale(1); border-radius: 0 0 6px 6px; }
            }
            .animate-boil { animation: boil 0.5s infinite ease-in-out; }

            @keyframes flame {
                0%, 100% { transform: scaleY(1) translateY(0); opacity: 1; }
                50% { transform: scaleY(1.2) translateY(-5px); opacity: 0.8; }
            }
            .animate-flame { animation: flame 0.3s infinite ease-in-out; }
            .animation-delay-200 { animation-delay: 0.2s; }
            .animation-delay-400 { animation-delay: 0.4s; }
            
            @keyframes condense-drip {
                0% { opacity: 0; transform: translateY(0) scale(0.5); }
                20% { opacity: 1; transform: translateY(0) scale(1); }
                60% { opacity: 1; transform: translateY(0) scale(1.8); }
                100% { opacity: 0; transform: translateY(25px) scale(1.2); }
            }
        `}</style>
      </div>
    </div>
  );
};