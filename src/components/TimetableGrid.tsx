import { Timetable } from '../types';
import { Download, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

interface TimetableGridProps {
  timetable: Timetable;
}

export default function TimetableGrid({ timetable }: TimetableGridProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const { config, grid } = timetable;

  const downloadPDF = async () => {
    if (!tableRef.current) return;
    
    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${timetable.name}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => window.print()}
          className="flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
        >
          <Printer className="mr-2 h-4 w-4" /> Print
        </button>
        <button 
          onClick={downloadPDF}
          className="flex items-center rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
        >
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </button>
      </div>

      <div ref={tableRef} className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-zinc-900">{timetable.name}</h2>
          <p className="text-zinc-500 text-sm">Generated on {new Date(timetable.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="min-w-[800px]">
          <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(120px,1fr))] border-b border-zinc-200">
            <div className="bg-zinc-50 p-4 font-semibold text-zinc-600 text-sm">Time / Day</div>
            {config.days.map(day => (
              <div key={day} className="bg-zinc-50 p-4 font-semibold text-zinc-900 text-center text-sm border-l border-zinc-200">
                {day}
              </div>
            ))}
          </div>

          {config.timeSlots.map(slot => (
            <div key={slot.id} className="grid grid-cols-[120px_repeat(auto-fit,minmax(120px,1fr))] border-b border-zinc-100 last:border-0">
              <div className="bg-zinc-50/50 p-4 flex flex-col justify-center border-r border-zinc-200">
                <span className="text-xs font-bold text-zinc-900">{slot.startTime} - {slot.endTime}</span>
                {slot.isBreak && <span className="text-[10px] text-indigo-600 font-medium uppercase tracking-wider mt-1">{slot.label || 'Break'}</span>}
              </div>

              {config.days.map(day => {
                const cell = grid[day][slot.id];
                
                if (slot.isBreak) {
                  return (
                    <div key={day} className="bg-zinc-50/30 p-2 border-l border-zinc-100 flex items-center justify-center">
                      <div className="h-1 w-full bg-zinc-200/50 rounded-full" />
                    </div>
                  );
                }

                return (
                  <div key={day} className="p-2 border-l border-zinc-100 min-h-[80px]">
                    {cell ? (
                      <div 
                        className="h-full w-full rounded-lg p-3 text-white shadow-sm flex flex-col justify-between"
                        style={{ backgroundColor: cell.color }}
                      >
                        <div>
                          <p className="text-xs font-bold leading-tight">{cell.subjectName}</p>
                        </div>
                        <p className="text-[10px] opacity-90 font-medium truncate mt-2">{cell.teacher}</p>
                      </div>
                    ) : (
                      <div className="h-full w-full rounded-lg border-2 border-dashed border-zinc-100" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
