import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnalysisResult } from '../../types';

interface CampbellDiagramProps {
  data: AnalysisResult | null;
  width?: number;
  height?: number;
}

export const CampbellDiagram: React.FC<CampbellDiagramProps> = ({ data, width = 800, height = 500 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (RPM)
    const xMax = d3.max(data.points, d => d.rpm) || 10000;
    const xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);

    // Y Scale (Frequency Hz)
    const yMax = d3.max(data.points, d => d3.max(d.modes, m => m.frequency)) || 1000;
    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([innerHeight, 0]);

    // Gridlines
    const makeXGrid = () => d3.axisBottom(xScale).ticks(10);
    const makeYGrid = () => d3.axisLeft(yScale).ticks(10);

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(makeXGrid()
        .tickSize(-innerHeight)
        .tickFormat(() => '')
      )
      .attr('stroke-opacity', 0.1)
      .attr('color', '#52525b'); // zinc-600

    g.append('g')
      .attr('class', 'grid')
      .call(makeYGrid()
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )
      .attr('stroke-opacity', 0.1)
      .attr('color', '#52525b');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .attr('color', '#a1a1aa') // zinc-400
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', 'currentColor')
      .text('Rotor Speed (RPM)');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#a1a1aa')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'currentColor')
      .text('Frequency (Hz)');

    // Modes
    const numModes = data.points[0]?.modes.length || 0;
    const lineGenerator = d3.line<any>()
      .x(d => xScale(d.rpm))
      .y(d => yScale(d.freq))
      .curve(d3.curveMonotoneX);

    for (let i = 0; i < numModes; i++) {
        const modeData = data.points.map(p => ({
            rpm: p.rpm,
            freq: p.modes[i].frequency,
            whirl: p.modes[i].whirl
        }));

        g.append('path')
         .datum(modeData)
         .attr('fill', 'none')
         .attr('stroke', i % 2 === 0 ? '#06b6d4' : '#f472b6') // Cyan / Pink
         .attr('stroke-width', 2)
         .attr('d', lineGenerator);
    }

    // Excitation Lines
    [1, 2].forEach(order => {
        const maxRpmForYMax = (yMax * 60) / order;
        const xEnd = Math.min(xMax, maxRpmForYMax);
        const yEnd = (xEnd / 60) * order;

        g.append('line')
         .attr('x1', xScale(0))
         .attr('y1', yScale(0))
         .attr('x2', xScale(xEnd))
         .attr('y2', yScale(yEnd))
         .attr('stroke', '#fbbf24') // Amber
         .attr('stroke-dasharray', '5,5')
         .attr('stroke-width', 1.5);
         
        g.append('text')
         .attr('x', xScale(xEnd) + 5)
         .attr('y', yScale(yEnd))
         .attr('fill', '#fbbf24')
         .attr('font-size', '10px')
         .text(`${order}X`);
    });

    // Critical Speeds
    data.criticalSpeeds.forEach(rpm => {
       const freq = rpm / 60;
       g.append('circle')
        .attr('cx', xScale(rpm))
        .attr('cy', yScale(freq))
        .attr('r', 4)
        .attr('fill', '#ef4444') // Red
        .attr('stroke', '#18181b')
        .attr('stroke-width', 2);
    });

  }, [data, width, height]);

  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 shadow-xl">
      <h3 className="text-zinc-100 font-medium mb-4">Campbell Diagram</h3>
      <div className="flex justify-center">
        <svg ref={svgRef} width={width} height={height} className="text-zinc-400 bg-zinc-900/50 rounded" />
      </div>
    </div>
  );
};
