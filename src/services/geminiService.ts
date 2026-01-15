import { GoogleGenAI, Type } from "@google/genai";
import { SimulationData } from "../types";

const SYSTEM_INSTRUCTION = `
You are a world-class Rotor Dynamics Engineer and Finite Element Analysis (FEA) expert.
Your task is to generate realistic simulation data for a large power generation train consisting of:
1. Exciter
2. Hydrogen-Cooled Generator
3. LP (Low Pressure) Turbine
4. HP (High Pressure) Turbine

You must generate:
1. A "shaftSegments" array of exactly 100 cylindrical elements representing the detailed geometry of the rotor.
   - Use diameter ~0.9-1.0 for Generator/LP blades.
   - Use diameter ~0.2-0.3 for bearings/couplings.
   - Use diameter ~0.4-0.5 for shafts.
   - Assign realistic materialIds (one of: 'steel', 'aluminum', 'titanium').
2. 5 distinct Natural Frequencies (Critical Speeds).
3. Mode shapes for each frequency. The mode shape is a vector of exactly 100 displacement points matching the segments.
4. Q Factors (Quality Factors) for each mode, typically ranging from 5 to 30 for these types of machines.
`;

export const generateRotorData = async (): Promise<SimulationData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Generate the rotor dynamics dataset for the requested generator train.",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rotors: {
             // We just keep this for labels, can be simple
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                position: { type: Type.NUMBER },
                color: { type: Type.STRING }
              },
              required: ['id', 'name', 'type', 'position']
            }
          },
          shaftSegments: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    index: { type: Type.INTEGER },
                    length: { type: Type.NUMBER },
                    outerDiameter: { type: Type.NUMBER },
                    materialId: { type: Type.STRING }
                },
                required: ['index', 'length', 'outerDiameter', 'materialId']
            }
          },
          modes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                order: { type: Type.INTEGER },
                frequencyHz: { type: Type.NUMBER },
                rpm: { type: Type.NUMBER },
                qFactor: { type: Type.NUMBER },
                description: { type: Type.STRING },
                displacements: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: "Exactly 100 points representing the mode shape curve"
                }
              },
              required: ['order', 'frequencyHz', 'rpm', 'qFactor', 'description', 'displacements']
            }
          }
        },
        required: ['rotors', 'shaftSegments', 'modes']
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No data returned from Gemini");
  }

  return JSON.parse(text) as SimulationData;
};