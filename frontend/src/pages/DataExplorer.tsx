// frontend/src/pages/DataExplorer.tsx
import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Header } from '../components/Header';
import { ScientificNotice } from '../components/ScientificNotice';
import { api } from '../services/api';

export const DataExplorer: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [plantCSample, setPlantCSample] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, plantCRes] = await Promise.all([
        api.getDatasetSummary(),
        api.getPlantCSample(20),
      ]);
      setSummary(sumRes);
      setPlantCSample(plantCRes.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3] text-[#202C25]">
      <Header
        title="Public Datasets & Provenance Explorer"
        subtitle="Transparent audit records, source boundaries, and operational arrival datasets."
      />

      <div className="max-w-[1440px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        <ScientificNotice title="Source Boundaries & Data Integrity">
          <p>
            <strong>Plant C Scrap Dataset (Zenodo 17633305):</strong> Records operational logistics (weight, transport mode, tare, soil/water contamination amounts). It does NOT contain chemical composition or lab recovery yields.
          </p>
          <p className="mt-1">
            <strong>CAESAR Project Dataset (Zenodo 15737122):</strong> Contains sample-specific optical emission spectroscopy chemistry of experimental melt taps and recovered non-ferrous fractions. It does NOT describe general scrap or registered company streams.
          </p>
        </ScientificNotice>

        {/* Provenance Register Cards */}
        {summary && summary.provenance_records && (
          <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#DCE5DA] shadow-xs space-y-4">
            <h2 className="font-semibold text-[#202C25] text-[17px]">
              Data Provenance Register ({summary.provenance_records.length} Tracked Datasets)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F0F5EC] text-[#56645A] border-b border-[#DCE5DA] text-[13px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Dataset / File</th>
                    <th className="py-3.5 px-4">Evidence Type</th>
                    <th className="py-3.5 px-4">Origin</th>
                    <th className="py-3.5 px-4">Intended System Use</th>
                    <th className="py-3.5 px-4">Mandatory Limitations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5DA]">
                  {summary.provenance_records.map((rec: any, idx: number) => {
                    const fileName = rec.File_or_file_group || rec.Dataset_or_File || rec.File_Name || `Dataset ${idx+1}`;
                    const dataType = rec.Data_type || rec.Evidence_Type || 'Structured Data';
                    const originStatus = rec.Real_or_synthetic_status || rec.Origin || rec.Data_Origin || 'PUBLIC';
                    const whatContains = rec.What_it_contains || rec.Intended_Use || rec.Purpose || 'Reference Data';
                    const limitations = rec.Limitations || rec.Scientific_Boundary || 'Scientific constraints apply.';
                    const sourceUrl = rec.Source_URL;

                    return (
                      <tr key={idx} className="hover:bg-[#F0F5EC]/60 transition">
                        <td className="py-4 px-4">
                          <p className="font-semibold text-[#202C25] font-mono text-[13px]">{fileName}</p>
                          {sourceUrl && (
                            <a 
                              href={sourceUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[13px] text-[#26734D] hover:underline inline-flex items-center gap-1.5 mt-1 transition"
                            >
                              <span>Zenodo / Ref</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </td>
                        <td className="py-4 px-4 text-[#56645A] text-[13px]">
                          {dataType}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded text-[13px] font-medium border ${
                            String(originStatus).toLowerCase().includes('real') || String(originStatus).toLowerCase().includes('public')
                              ? 'bg-[#EAF3FF] text-[#245D9C] border-[#BFD9F8]'
                              : 'bg-[#F0F5EC] text-[#56645A] border-[#DCE5DA]'
                          }`}>
                            {originStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[#56645A] max-w-sm text-[13px] leading-relaxed">
                          {whatContains}
                        </td>
                        <td className="py-4 px-4 text-[#8A5A00] max-w-sm text-[13px] leading-relaxed">
                          {limitations}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Plant C Raw Operational Sample Table */}
        <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#DCE5DA] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#DCE5DA] gap-2">
            <div>
              <span className="text-[12px] font-semibold text-[#26734D] uppercase tracking-wider">
                Logistics & Arrival Dataset Sample
              </span>
              <h3 className="font-bold text-[#202C25] text-[17px] mt-1">
                Plant C Industrial Scrap Arrivals (Zenodo 17633305)
              </h3>
            </div>
            <span className="text-[13px] text-[#778279] font-mono">
              Total Recorded Lines: {summary?.plant_c_total_records?.toLocaleString() || '60,000+'}
            </span>
          </div>

          <p className="text-[14px] text-[#778279]">
            Previewing top 20 operational arrival records. Note: Coded scrap types and supplier identities are preserved faithfully as per dataset codebook guidelines.
          </p>

          <div className="overflow-x-auto">
            {plantCSample.length > 0 ? (
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#F0F5EC] text-[#56645A] border-b border-[#DCE5DA] font-semibold uppercase tracking-wider">
                  <tr>
                    {Object.keys(plantCSample[0]).slice(0, 7).map((col) => (
                      <th key={col} className="py-3 px-4 font-semibold text-[#202C25]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5DA] font-mono text-[13px]">
                  {plantCSample.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F0F5EC]/60 transition">
                      {Object.values(row).slice(0, 7).map((val: any, j) => (
                        <td key={j} className="py-3.5 px-4 text-[#56645A]">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-[14px] text-[#778279] py-8 text-center">Loading Plant C arrival dataset...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
