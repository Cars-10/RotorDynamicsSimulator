import React, { useEffect, useState } from 'react';

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'gallery' | 'basics' | 'analogy' | 'shaft' | 'internals' | 'cooling' | 'types'>('guide');
  const [simTime, setSimTime] = useState(0);

  // User Physics Controls
  const [stiffness, setStiffness] = useState(1.0);
  const [mass, setMass] = useState(1.0);
  
  // Analogy Controls (Tire)
  const [speed, setSpeed] = useState(1.0);
  const [offset, setOffset] = useState(20); // Unbalance radius
  const [tireDamping, setTireDamping] = useState(0.1);
  
  // Damping Controls (Shaft)
  const [dampingVal, setDampingVal] = useState(0.1);

  // Rotor Internal Controls
  const [copperWidth, setCopperWidth] = useState(0.5); // 0-1
  const [copperDepth, setCopperDepth] = useState(0.5); // 0-1
  const [isFourPole, setIsFourPole] = useState(false);

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      // omega = sqrt(k/m) * speed_multiplier
      const baseOmega = Math.sqrt(stiffness / mass);
      setSimTime(t => t + 0.05 * baseOmega * speed);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [stiffness, mass, speed]);

  // --- Analogy Visuals ---
  const renderSpringMass = () => {
    // A simple bouncing mass
    const y = 100 + Math.sin(simTime * 2) * 40;
    
    // Visualize Spring Thickness based on Stiffness
    const springStroke = 2 + stiffness * 2;
    // Visualize Mass Size based on Mass
    const massSize = 40 + mass * 20;

    return (
      <svg width="200" height="250" className="mx-auto bg-slate-800/50 rounded border border-slate-700">
        {/* Support */}
        <rect x="50" y="0" width="100" height="10" fill="#94a3b8" />
        {/* Spring */}
        <path d={`M 100 10 Q 120 ${(10 + y)/2} 100 ${y}`} fill="none" stroke="#fbbf24" strokeWidth={springStroke} />
        {/* Mass */}
        <rect x={100 - massSize/2} y={y} width={massSize} height={massSize} fill="#3b82f6" rx="4" />
      </svg>
    );
  };

  const renderTireAnalogy = () => {
    // Physics simulation visual
    const bounceAmp = (offset / 50) * 30 * (1 - tireDamping); 
    const bounceFreq = speed * 0.5;
    
    const dy = Math.sin(simTime * bounceFreq) * bounceAmp;
    const yCenter = 180 + dy;
    
    const angle = simTime * bounceFreq * 5; 
    const unbalanceR = 60;

    // Spring Generation (Zig Zag)
    const generateSpringPath = (x: number, y1: number, y2: number) => {
        const height = y2 - y1;
        const segs = 10;
        let d = `M ${x} ${y1}`;
        for(let i=1; i<=segs; i++) {
             const lx = x - 12;
             const rx = x + 12;
             const cy = y1 + (height * i) / segs;
             const tx = i === segs ? x : (i%2===0 ? lx : rx);
             d += ` L ${tx} ${cy}`;
        }
        return d;
    };

    const springPath = generateSpringPath(130, 40, yCenter - 70);

    return (
        <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center">
             <div className="grid grid-cols-3 gap-4 w-full mb-4 text-[10px] font-mono">
                <div className="bg-slate-800 p-2 rounded border border-slate-700">
                    <div className="flex justify-between mb-1 text-slate-400">SPEED (RPM) <span className="text-cyan-400">{speed.toFixed(1)}x</span></div>
                    <input type="range" min="0.1" max="3" step="0.1" value={speed} onChange={e=>setSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
                </div>
                <div className="bg-slate-800 p-2 rounded border border-slate-700">
                    <div className="flex justify-between mb-1 text-slate-400">OFFSET (Radius) <span className="text-red-400">{offset} mm</span></div>
                    <input type="range" min="0" max="50" value={offset} onChange={e=>setOffset(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-400" />
                </div>
                <div className="bg-slate-800 p-2 rounded border border-slate-700">
                    <div className="flex justify-between mb-1 text-slate-400">SHOCK ABSORBER (Damping) <span className="text-amber-400">{(tireDamping*100).toFixed(0)}%</span></div>
                    <input type="range" min="0" max="0.5" step="0.05" value={tireDamping} onChange={e=>setTireDamping(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400" />
                </div>
            </div>

            <svg width="400" height="350" viewBox="0 0 400 350" className="overflow-visible select-none">
                {/* Frame */}
                <rect x="50" y="20" width="300" height="20" fill="#cbd5e1" rx="2" />
                <text x="200" y="15" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">VEHICLE FRAME (FIXED)</text>

                {/* Spring Visual (Coil) */}
                <path d={springPath} fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <text x="90" y="100" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="end">Spring (K)</text>

                {/* Dashpot Visual */}
                <g transform="translate(270, 0)">
                    {/* Cylinder Housing (Fixed) */}
                    <path d="M -15 40 L -15 110 Q 0 120 15 110 L 15 40" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
                    <line x1="-15" y1="40" x2="15" y2="40" stroke="#60a5fa" strokeWidth="2" />
                    
                    {/* Piston Rod (Moving) */}
                    <line x1="0" y1={yCenter - 70} x2="0" y2="90" stroke="#93c5fd" strokeWidth="5" />
                    {/* Piston Head */}
                    <rect x="-12" y={80} width="24" height="6" fill="#93c5fd" rx="2" opacity="0.8" />
                    
                    <text x="25" y="80" fill="#60a5fa" fontSize="11" fontWeight="bold" textAnchor="start">Dashpot (C)</text>
                </g>

                {/* Tire Assembly */}
                <g transform={`translate(200, ${yCenter})`}>
                    {/* Connection Bar */}
                    <path d="M -70 -70 L 70 -70 L 0 0 Z" fill="#475569" />
                    
                    {/* Tire */}
                    <circle cx="0" cy="0" r="70" fill="#1e293b" stroke="#334155" strokeWidth="8" strokeDasharray="12 12" />
                    <circle cx="0" cy="0" r="40" fill="#94a3b8" />
                    
                    {/* Unbalance Weight */}
                    <g transform={`rotate(${(angle * 180)/Math.PI})`}>
                         <line x1="0" y1="0" x2="60" y2="0" stroke="#ef4444" strokeWidth="2" />
                         <circle cx="60" cy="0" r="12" fill="#ef4444" stroke="white" strokeWidth="2" className="drop-shadow-lg" />
                    </g>
                </g>
            </svg>
            <div className="text-center text-xs text-slate-400 mt-2 max-w-md">
                The <strong className="text-fbbf24 text-yellow-400">Spring</strong> allows the tire to bounce, while the <strong className="text-blue-400">Dashpot</strong> dissipates the energy to stop it from bouncing forever.
            </div>
        </div>
    );
  };

  // --- Shaft Analogy Visuals ---
  const renderShaftAnalogy = () => {
      const yDisp = Math.sin(simTime * 3) * 30 * (1-dampingVal);
      
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col items-center">
             <div className="w-full max-w-xs mb-6">
                <div className="flex justify-between mb-2 text-xs text-slate-400">
                    <span>System Damping (ζ)</span>
                    <span className="text-amber-400">{(dampingVal * 100).toFixed(0)}%</span>
                </div>
                <input 
                    type="range" min="0" max="0.5" step="0.01" 
                    value={dampingVal} onChange={e => setDampingVal(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
             </div>

             <svg width="300" height="200" viewBox="0 0 300 200">
                 {/* Bearings */}
                 <rect x="20" y="80" width="20" height="40" fill="#f59e0b" />
                 <rect x="260" y="80" width="20" height="40" fill="#f59e0b" />
                 
                 {/* Shaft Centerline */}
                 <path d={`M 30 100 Q 150 ${100 + yDisp} 270 100`} fill="none" stroke="#cbd5e1" strokeWidth="4" />
                 
                 {/* Heavy Disc */}
                 <rect x="140" y={90 + yDisp} width="20" height="60" fill="#3b82f6" rx="2" transform={`rotate(${simTime*100}, 150, ${100+yDisp})`} />
                 
                 {/* Dashpot (Damping) Visual */}
                 <g transform={`translate(150, ${100+yDisp + 30})`}>
                     {/* Piston connected to mass */}
                     <line x1="0" y1="0" x2="0" y2="30" stroke="#93c5fd" strokeWidth="2" />
                     <rect x="-10" y="30" width="20" height="4" fill="#93c5fd" />
                     
                     {/* Cylinder (Fixed to ground effectively) - simplified logic */}
                     <path d="M -12 25 L -12 50 L 12 50 L 12 25" fill="none" stroke="#60a5fa" strokeWidth="2" />
                     <line x1="0" y1="50" x2="0" y2="70" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 2" />
                     <line x1="-10" y1="70" x2="10" y2="70" stroke="#60a5fa" strokeWidth="2" /> {/* Ground */}
                 </g>
             </svg>
             <p className="mt-4 text-xs text-slate-400 text-center">
                 Just like the tire's dashpot, rotor damping (oil film bearings, windage, material hysteresis) absorbs vibration energy.
             </p>
        </div>
      )
  };

  const renderSlotDetail = () => {
    // 3D Isometric Projection Params
    const isoX = (x: number, z: number) => (x - z) * Math.cos(Math.PI / 6);
    const isoY = (x: number, y: number, z: number) => y + (x + z) * Math.sin(Math.PI / 6);
    const cx = 200;
    const cy = 100;
    const scale = 3;

    // Slot Dimensions
    const wTop = 30;
    const wBot = 20;
    const h = 100;
    const length = 100; // Z-depth

    // Helper to generate a 3D prism face
    const prism = (x: number, y: number, w: number, hVal: number, color: string, zStart: number = 0, zEnd: number = length) => {
        const xL = x - w/2;
        const xR = x + w/2;
        const yT = y;
        const yB = y + hVal;
        
        const p1 = {x: cx + isoX(xL, zStart) * scale, y: cy + isoY(xL, yT, zStart) * scale};
        const p2 = {x: cx + isoX(xR, zStart) * scale, y: cy + isoY(xR, yT, zStart) * scale};
        const p3 = {x: cx + isoX(xR, zEnd) * scale, y: cy + isoY(xR, yT, zEnd) * scale};
        const p4 = {x: cx + isoX(xL, zEnd) * scale, y: cy + isoY(xL, yT, zEnd) * scale};
        
        const p1b = {x: cx + isoX(xL, zStart) * scale, y: cy + isoY(xL, yB, zStart) * scale};
        const p2b = {x: cx + isoX(xR, zStart) * scale, y: cy + isoY(xR, yB, zStart) * scale};
        const p3b = {x: cx + isoX(xR, zEnd) * scale, y: cy + isoY(xR, yB, zEnd) * scale};
        const p4b = {x: cx + isoX(xL, zEnd) * scale, y: cy + isoY(xL, yB, zEnd) * scale};

        const topFace = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
        const rightFace = `M ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p3b.x} ${p3b.y} L ${p2b.x} ${p2b.y} Z`;
        const frontFace = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p2b.x} ${p2b.y} L ${p1b.x} ${p1b.y} Z`;
        
        return (
            <g>
                <path d={topFace} fill={color} filter="brightness(1.2)" stroke="none" />
                <path d={rightFace} fill={color} filter="brightness(0.8)" stroke="none" />
                <path d={frontFace} fill={color} stroke="none" />
            </g>
        )
    };
    
    // Trapezoidal bar generator
    const renderTrapezoidBar = (yPos: number, barH: number, color: string) => {
        // Interpolate width based on Y (Tapered slot)
        // y=0 -> wTop, y=h -> wBot
        const wAtTop = wTop - (yPos / h) * (wTop - wBot);
        const wAtBot = wTop - ((yPos + barH) / h) * (wTop - wBot);
        
        // Front face points
        const zStart = 0;
        const zEnd = length;
        const pts = [
            {x: -wAtTop/2, y: yPos}, {x: wAtTop/2, y: yPos},
            {x: wAtBot/2, y: yPos + barH}, {x: -wAtBot/2, y: yPos + barH}
        ];

        // Project
        const proj = (pt: {x:number, y:number}, z:number) => ({
             x: cx + isoX(pt.x, z) * scale,
             y: cy + isoY(pt.x, pt.y, z) * scale
        });

        const f1 = proj(pts[0], zStart); const f2 = proj(pts[1], zStart);
        const f3 = proj(pts[2], zStart); const f4 = proj(pts[3], zStart);
        
        const b1 = proj(pts[0], zEnd); const b2 = proj(pts[1], zEnd);
        const b3 = proj(pts[2], zEnd); // const b4 = proj(pts[3], zEnd);

        const frontFace = `M ${f1.x} ${f1.y} L ${f2.x} ${f2.y} L ${f3.x} ${f3.y} L ${f4.x} ${f4.y} Z`;
        const topFace = `M ${f1.x} ${f1.y} L ${f2.x} ${f2.y} L ${b2.x} ${b2.y} L ${b1.x} ${b1.y} Z`;
        const rightFace = `M ${f2.x} ${f2.y} L ${b2.x} ${b2.y} L ${b3.x} ${b3.y} L ${f3.x} ${f3.y} Z`;

        return (
            <g>
                 <path d={topFace} fill={color} filter="brightness(1.1)" />
                 <path d={rightFace} fill={color} filter="brightness(0.7)" />
                 <path d={frontFace} fill={color} />
                 
                 {/* Hollow Channel */}
                 <rect x={f1.x + 15} y={f1.y + 5} width={10} height={5} fill="#1e293b" rx="1" />
            </g>
        )
    }

    const bars = 8;
    const barH = (h - 10) / bars;
    const barGap = 1;

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden h-[400px] flex flex-col items-center">
            <svg width="400" height="350" viewBox="0 0 400 350">
                 {/* Steel Body (Groove) */}
                 {/* Simplified visual block with cutout */}
                 <path d={`M ${cx + isoX(-50, 0)*scale} ${cy + isoY(-50, 0, 0)*scale} 
                           L ${cx + isoX(50, 0)*scale} ${cy + isoY(50, 0, 0)*scale}
                           L ${cx + isoX(50, 0)*scale} ${cy + isoY(50, 120, 0)*scale}
                           L ${cx + isoX(-50, 0)*scale} ${cy + isoY(-50, 120, 0)*scale} Z`} fill="#334155" />
                 
                 {/* Insulation Liner (Green Tree) */}
                 {renderTrapezoidBar(0, h, "#15803d")}

                 {/* Copper Bars */}
                 {Array.from({length: bars}).map((_, i) => {
                     const y = i * barH + i * barGap;
                     return (
                         <g key={i}>
                            {renderTrapezoidBar(y, barH - barGap, "#d97706")}
                            {/* Hydrogen Particles */}
                            <circle r="2" fill="white" opacity="0.8">
                                <animateMotion dur={`${1 + i*0.2}s`} repeatCount="indefinite"
                                    path={`M ${cx + isoX(0, -20)*scale} ${cy + isoY(0, y+5, -20)*scale} L ${cx + isoX(0, 100)*scale} ${cy + isoY(0, y+5, 100)*scale}`} />
                            </circle>
                         </g>
                     )
                 })}
                 
                 <text x="50" y="300" className="text-xs fill-slate-400">ISO View: Direct Cooled Slot</text>
            </svg>
            
            <div className="absolute bottom-4 left-4 right-4 bg-slate-800/80 p-3 rounded backdrop-blur border border-slate-600">
                <h4 className="text-cyan-400 font-bold text-sm mb-1">Why Hydrogen?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                    Hydrogen has <strong className="text-white">7x the thermal conductivity</strong> and <strong className="text-white">1/10th the density</strong> of air. 
                    This reduces windage friction losses significantly and removes heat from the copper windings much faster, allowing generators to be smaller and more efficient.
                </p>
            </div>
        </div>
    )
  }

  const renderCrossSection = () => {
      // Show difference between 2 pole and 4 pole flux paths
      // 2 Pole = North South (180 deg apart)
      // 4 Pole = N S N S (90 deg apart)
      
      const poles = isFourPole ? 4 : 2;
      const rOuter = 120;
      const rInner = 40;
      const slotDepth = 30;
      
      // Generate slots
      const copperPaths = [];
      const slotPaths = [];
      const poleArc = 360 / poles;
      const slotsPerPole = isFourPole ? 6 : 10;
      
      for(let q=0; q<poles; q++) {
          const startAng = q * poleArc + (poleArc - (slotsPerPole*10))/2;
          for(let i=0; i<slotsPerPole; i++) {
              const ang = startAng + i * 10;
              const rad = (ang * Math.PI) / 180;
              const x1 = 150 + (rOuter) * Math.cos(rad);
              const y1 = 150 + (rOuter) * Math.sin(rad);
              const x2 = 150 + (rOuter - slotDepth) * Math.cos(rad);
              const y2 = 150 + (rOuter - slotDepth) * Math.sin(rad);
              
              // Slot rect roughly
              slotPaths.push(
                  <line key={`s-${q}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0f172a" strokeWidth="6" />
              );
              copperPaths.push(
                  <line key={`c-${q}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b45309" strokeWidth="4" />
              )
          }
      }

      return (
          <div className="flex flex-col items-center">
              <div className="mb-4 flex gap-4 bg-slate-800 p-1 rounded-lg">
                  <button onClick={() => setIsFourPole(false)} className={`px-3 py-1 text-xs rounded ${!isFourPole ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'}`}>2-POLE (3600 RPM)</button>
                  <button onClick={() => setIsFourPole(true)} className={`px-3 py-1 text-xs rounded ${isFourPole ? 'bg-purple-500 text-white font-bold' : 'text-slate-400'}`}>4-POLE (1800 RPM)</button>
              </div>

              <svg width="300" height="300" viewBox="0 0 300 300" className="animate-in fade-in">
                  <circle cx="150" cy="150" r={rOuter} fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
                  <circle cx="150" cy="150" r={rInner} fill="#0f172a" />
                  
                  {slotPaths}
                  {copperPaths}
                  
                  {/* Flux Lines Overlay */}
                  {Array.from({length: poles}).map((_, i) => {
                      const ang = (i * poleArc + poleArc/2) * Math.PI / 180;
                      return (
                          <g key={i}>
                              <path d={`M 150 150 L ${150 + 140*Math.cos(ang)} ${150 + 140*Math.sin(ang)}`} stroke={i%2===0 ? "#ef4444" : "#3b82f6"} strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow)" />
                              <text x={150 + 100*Math.cos(ang)} y={150 + 100*Math.sin(ang)} fill="white" fontWeight="bold" fontSize="16">{i%2===0 ? "N" : "S"}</text>
                          </g>
                      )
                  })}
              </svg>
              
              <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                  <div className="bg-slate-800 p-3 rounded border border-slate-700">
                      <h4 className="text-xs font-bold text-slate-300">Stiffness Asymmetry</h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                          The rotor is stiffer along the pole axis (solid steel) than the slot axis (copper filled). This causes a gravity sag twice per revolution.
                      </p>
                      <div className="mt-2 text-center text-xs font-mono text-cyan-400 font-bold animate-pulse">
                          2X VIBRATION SOURCE
                      </div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded border border-slate-700">
                      <h4 className="text-xs font-bold text-slate-300">Legend</h4>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <div className="w-3 h-3 bg-slate-300"></div> <span>Steel</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <div className="w-3 h-3 bg-amber-700"></div> <span>Copper</span>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // Content Mapping
  const renderContent = () => {
    switch (activeTab) {
        case 'guide': return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Simulation Guide</h2>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-cyan-400 font-bold mb-2">How to Play</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                        <li><strong>Generate Rotor:</strong> Click "Run" to create a unique rotor profile using AI.</li>
                        <li><strong>Analyze:</strong> Use the "Report" button to see critical speeds. Look for speeds near 3600 RPM (or 1800 RPM).</li>
                        <li><strong>Visualize:</strong> Use "Composite" view. Click "Trace" to see orbit shapes.</li>
                        <li><strong>Tune:</strong> Click "Edit" and change shaft diameters. Stiffening (thicker) raises frequency. Adding mass (thicker discs) lowers frequency.</li>
                        <li><strong>Win:</strong> Enter "Game Mode". You have 5 tries to tune the rotor so no critical speeds are within 10% of operating speed and vibration is &lt; 5 mils.</li>
                    </ol>
                </div>
            </div>
        );
        case 'basics': return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">The Golden Equation</h2>
                <div className="p-6 bg-slate-800 rounded-lg text-center border border-slate-700 shadow-inner">
                    <div className="text-4xl font-serif text-cyan-400 mb-2 italic">
                        ω<sub className="text-lg">n</sub> = √<span className="overline decoration-1">K / M</span>
                    </div>
                    <p className="text-sm text-slate-400">Natural Frequency = Square Root of (Stiffness / Mass)</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <label className="text-xs text-slate-500 font-bold block mb-2">STIFFNESS (K)</label>
                        <input type="range" min="0.5" max="5" step="0.1" value={stiffness} onChange={e=>setStiffness(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        <div className="text-right text-xs text-cyan-400 font-mono mt-1">{stiffness.toFixed(1)}</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <label className="text-xs text-slate-500 font-bold block mb-2">MASS (M)</label>
                        <input type="range" min="0.5" max="5" step="0.1" value={mass} onChange={e=>setMass(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                        <div className="text-right text-xs text-purple-400 font-mono mt-1">{mass.toFixed(1)}</div>
                    </div>
                </div>

                {renderSpringMass()}
            </div>
        );
        case 'analogy': return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">The "Unbalanced Tire" Analogy</h2>
                <p className="text-sm text-slate-400">
                    Imagine a car tire with a heavy weight attached to one side. As you drive faster, centrifugal force pulls that weight outward. The <strong>Dashpot</strong> absorbs energy, keeping the tire from bouncing uncontrollably.
                </p>
                {renderTireAnalogy()}
            </div>
        );
        case 'shaft': return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Shaft & Damping</h2>
                <p className="text-sm text-slate-400">
                    A generator rotor behaves like a continuous spring-mass system. Oil film bearings act as the dashpots (dampers).
                </p>
                {renderShaftAnalogy()}
            </div>
        );
        case 'internals': return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Rotor Internals</h2>
                <p className="text-sm text-slate-400">
                    Cross-section of the main body showing slots for copper windings. 
                </p>
                {renderCrossSection()}
            </div>
        );
        case 'cooling': return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Direct Hydrogen Cooling</h2>
                <p className="text-sm text-slate-400">
                    High-performance generators use hollow copper conductors. Hydrogen gas is pumped directly through these channels to remove heat efficiently.
                </p>
                {renderSlotDetail()}
            </div>
        );
        case 'types': return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Generator Types</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-cyan-400 font-bold mb-1">2-Pole (Hydrogen Cooled)</h3>
                        <div className="text-xs text-slate-300 space-y-2">
                            <p><strong>Speed:</strong> 3600 RPM (60Hz) / 3000 RPM (50Hz)</p>
                            <p><strong>Application:</strong> Gas Turbines, Steam Turbines (Fossil)</p>
                            <p><strong>Geometry:</strong> Long and thin. High centrifugal forces require high strength steel.</p>
                        </div>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-purple-400 font-bold mb-1">4-Pole (Nuclear)</h3>
                        <div className="text-xs text-slate-300 space-y-2">
                            <p><strong>Speed:</strong> 1800 RPM (60Hz) / 1500 RPM (50Hz)</p>
                            <p><strong>Application:</strong> Nuclear Power Plants</p>
                            <p><strong>Geometry:</strong> Massive diameter, heavy weight. Slower speed allows for larger size.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
        case 'gallery': return (
            <div className="space-y-4 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-white">Photo Gallery</h2>
                <a href="https://en.wikipedia.org/wiki/Hydrogen-cooled_turbo_generator" target="_blank" rel="noreferrer" className="text-xs text-cyan-400 underline hover:text-cyan-300">
                    Wikipedia: Hydrogen-cooled turbo generator
                </a>
                <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar flex-1">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Steam_turbine_rotor_01.jpg/640px-Steam_turbine_rotor_01.jpg" className="w-full h-32 object-cover rounded border border-slate-700 hover:scale-105 transition-transform" alt="Rotor" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Turbogenerator01.jpg/640px-Turbogenerator01.jpg" className="w-full h-32 object-cover rounded border border-slate-700 hover:scale-105 transition-transform" alt="Generator" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Stator_winding_of_a_turbogenerator.jpg/640px-Stator_winding_of_a_turbogenerator.jpg" className="w-full h-32 object-cover rounded border border-slate-700 hover:scale-105 transition-transform" alt="Stator Winding" />
                     <div className="w-full h-32 bg-slate-800 flex items-center justify-center text-xs text-slate-500 rounded border border-slate-700">More coming soon...</div>
                </div>
            </div>
        );
    }
  }

  const tabs = [
      {id: 'guide', label: '0. Simulation Guide'},
      {id: 'basics', label: '1. The Golden Equation'},
      {id: 'analogy', label: '2. The Unbalanced Tire'},
      {id: 'shaft', label: '3. Shafts & Damping'},
      {id: 'internals', label: '4. Rotor Internals'},
      {id: 'cooling', label: '5. Direct Cooling'},
      {id: 'types', label: '6. Generator Types'},
      {id: 'gallery', label: '7. Photo Gallery'},
  ];

  return (
    <div className="absolute top-16 left-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md border-r border-slate-800 w-[700px] max-w-full shadow-2xl flex animate-in slide-in-from-left duration-300">
      {/* Sidebar Nav */}
      <div className="w-48 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200">Tutorial</h3>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
              {tabs.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setActiveTab(t.id as any)}
                    className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider border-l-2 transition-colors ${activeTab === t.id ? 'bg-slate-800 border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                  >
                      {t.label}
                  </button>
              ))}
          </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {renderContent()}
          </div>
      </div>
    </div>
  );
};

export default Tutorial;