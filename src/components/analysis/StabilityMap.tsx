import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnalysisResult } from '../../types';

interface StabilityMapProps {
  data: AnalysisResult | null;
  width?: number;
  height?: number;
}

export const StabilityMap: React.FC<StabilityMapProps> = ({ data, width = 800, height = 500 }) => {
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

    // Y Scale (Log Dec)
    const allDampings = data.points.flatMap(p => p.modes.map(m => m.damping));
    const yMin = Math.min(0, d3.min(allDampings) || 0) - 0.1;
    const yMax = (d3.max(allDampings) || 1) + 0.1;

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0]);

    // Unstable Zone (Y < 0)
    if (yMin < 0) {
        g.append('rect')
         .attr('x', 0)
         .attr('y', yScale(0))
         .attr('width', innerWidth)
         .attr('height', innerHeight - yScale(0))
         .attr('fill', '#ef4444')
         .attr('opacity', 0.1);
    }

    // Gridlines
    const makeXGrid = () => d3.axisBottom(xScale).ticks(10);
    const makeYGrid = () => d3.axisLeft(yScale).ticks(10);

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(makeXGrid().tickSize(-innerHeight).tickFormat(() => ''))
      .attr('stroke-opacity', 0.1)
      .attr('color', '#52525b');

    g.append('g')
      .attr('class', 'grid')
      .call(makeYGrid().tickSize(-innerWidth).tickFormat(() => ''))
      .attr('stroke-opacity', 0.1)
      .attr('color', '#52525b');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#a1a1aa')
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
      .text('Log Decrement');

    // Zero Line
    g.append('line')
     .attr('x1', 0)
     .attr('y1', yScale(0))
     .attr('x2', innerWidth)
     .attr('y2', yScale(0))
     .attr('stroke', '#ef4444')
     .attr('stroke-width', 1)
     .attr('stroke-dasharray', '4,4');

    // Plot Lines
    const numModes = data.points[0]?.modes.length || 0;
    const lineGenerator = d3.line<any>()
      .x(d => xScale(d.rpm))
      .y(d => yScale(d.damping))
      .curve(d3.curveMonotoneX);

    for (let i = 0; i < numModes; i++) {
        const modeData = data.points.map(p => ({
            rpm: p.rpm,
            damping: p.modes[i].damping
        }));

        g.append('path')
         .datum(modeData)
         .attr('fill', 'none')
         .attr('stroke', i % 2 === 0 ? '#06b6d4' : '#f472b6')
         .attr('stroke-width', 2)
         .attr('d', lineGenerator);
    }

  }, [data, width, height]);

  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 shadow-xl">
      <h3 className="text-zinc-100 font-medium mb-4">Stability Map</h3>
      <div className="flex justify-center">
        <svg ref={svgRef} width={width} height={height} className="text-zinc-400 bg-zinc-900/50 rounded" />
      </div>
    </div>
  );
};
