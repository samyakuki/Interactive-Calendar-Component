import { useState, useEffect } from 'react'
import './App.css'

function App() {

  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem('cal_startDate') || null;
  });
  const [endDate, setEndDate] = useState(() => {
    return localStorage.getItem('cal_endDate') || null;
  });
  const [hoverDate, setHoverDate] = useState(null);
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('cal_notes');
    return saved ? JSON.parse(saved) : { general: '' };
  });
  const [currentMonth, setCurrentMonth] = useState(new Date(2022, 0, 1));

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDeleteNote = (keyToDelete) => {
    setNotes(prev => {
      const next = { ...prev };
      delete next[keyToDelete];
      return next;
    });
  };

  // Sync state to Client-Side persistence
  useEffect(() => {
    if (startDate) localStorage.setItem('cal_startDate', startDate);
    else localStorage.removeItem('cal_startDate');
  }, [startDate]);

  useEffect(() => {
    if (endDate) localStorage.setItem('cal_endDate', endDate);
    else localStorage.removeItem('cal_endDate');
  }, [endDate]);

  useEffect(() => {
    localStorage.setItem('cal_notes', JSON.stringify(notes));
  }, [notes]);

  const formatFancyDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m) - 1]} ${parseInt(d)}`;
  };

  const handleDateClick = (dateStr) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (dateStr < startDate) {
        setEndDate(startDate);
        setStartDate(dateStr);
      } else {
        setEndDate(dateStr);
      }
    }
  };

  const isSelected = (dateStr) => dateStr === startDate || dateStr === endDate;
  const isInRange = (dateStr) => {
    if (startDate && endDate) {
      return dateStr > startDate && dateStr < endDate;
    }
    if (startDate && !endDate && hoverDate) {
      const min = startDate < hoverDate ? startDate : hoverDate;
      const max = startDate < hoverDate ? hoverDate : startDate;
      return dateStr > min && dateStr < max;
    }
    return false;
  };

  const currentSelectionKey = (startDate && endDate) ? `${startDate}_${endDate}`
    : (startDate ? startDate : 'general');
  const currentNote = notes[currentSelectionKey] || '';

  const handleNoteChange = (e) => {
    setNotes(prev => ({ ...prev, [currentSelectionKey]: e.target.value }));
  };

  const generateDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    let startDayOfWeek = new Date(year, month, 1).getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInLastMonth = new Date(year, month, 0).getDate();

    const daysArray = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInLastMonth - i;
      const dateStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysArray.push({ day: d, type: 'past', dateStr });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      daysArray.push({ day: i, type: 'current', dateStr });
    }

    const remaining = 42 - daysArray.length;
    for (let i = 1; i <= remaining; i++) {
      const dateStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      daysArray.push({ day: i, type: 'future', dateStr });
    }
    return daysArray;
  };

  const days = generateDays();
  const monthsList = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  return (
    <>
      <div
        className='flex justify-center items-start md:items-center w-full min-h-screen overflow-x-hidden overflow-y-auto py-10 md:py-0 relative'
        style={{ backgroundColor: '#f2f6fd' }}
      >
        {/* Fixed Background Corner Accents */}
        <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-[url('/curves.png')] bg-contain bg-top bg-no-repeat z-0 pointer-events-none -rotate-90" />
        <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[url('/curves.png')] bg-contain bg-top bg-no-repeat z-0 pointer-events-none rotate-90" />

        {/* Responsive Scaling Wrapper */}
        <div className='flex flex-col md:flex-row items-center justify-center gap-12 scale-[0.7] sm:scale-[0.8] md:scale-[0.85] lg:scale-[0.95] max-w-full origin-top md:origin-center relative z-10'>

          {/* Main Calendar Card */}
          <div className='flex flex-col shrink-0 w-[400px] h-[600px] bg-white shadow-[-30px_30px_50px_rgba(0,0,0,0.4)] relative'>

            <div className="absolute -top-35 left-1/2 -translate-x-1/2 w-[102%] z-50 pointer-events-none drop-shadow-md">
              <img src="/image.png" alt="Notebook binding rings" className="w-full h-auto object-contain" />
            </div>

            <div className='h-[55%] relative z-30 [clip-path:inset(0px_0px_-150px_0px)]'>
              <svg className='w-full h-full absolute z-10 transition-transform duration-500 ease-out hover:scale-[1.02] origin-top-right cursor-default pointer-events-none'>
                <path d="M 0,320 L 400,100 L 400,0 L 0,0 Z" fill="#1d93d0" className='pointer-events-auto' />
              </svg>
              <svg className='w-full h-full absolute z-10 transition-transform duration-500 ease-out hover:scale-[1.02] origin-top-left cursor-default pointer-events-none' viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <clipPath id="myClip">
                    <path d="M 0,220 L 100,270 C 120,280 140,280 160,270 L 400,150 L 400,0 L 0,0 Z" />
                  </clipPath>
                </defs>
                <g className='pointer-events-auto'>
                  <image
                    href="/mountain.png"
                    width="100%"
                    height="100%"
                    clipPath="url(#myClip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
              </svg>

              <svg className='w-full h-full absolute z-5 transition-transform duration-500 ease-out hover:scale-[1.02] origin-top cursor-default pointer-events-none'>
                <path d="M 0,0 L 0,150 L 280,320 C 300,330 320,330 340,320 L 400,290 L 400,0 Z" fill="#1d93d0" className='pointer-events-auto' />
              </svg>

              <div className='bottom-8 right-10 absolute z-20 pointer-events-auto'>
                <div className='flex flex-col justify-center h-full items-end text-white'>
                  <div className='montserrat-400 text-[20px] -mb-2'>{currentMonth.getFullYear()}</div>
                  <div className='montserrat-700 text-[18px] min-w-[100px] text-right tracking-wider'>{monthsList[currentMonth.getMonth()]}</div>
                </div>
              </div>
            </div>

            <div className='flex flex-row h-[35%]'>
              <div className='w-[40%] p-4 flex flex-col pt-6'>
                <div className="flex flex-row flex-wrap items-center gap-1 mb-2">
                  <div className="montserrat-700 text-[10px] text-gray-800 tracking-wider uppercase mr-1">
                    NOTES
                  </div>
                  {startDate && (
                    <div className="flex flex-row items-center space-x-1 text-[8px] font-bold">
                      <span className="bg-blue-100 text-[#1d93d0] px-1.5 py-0.5 rounded shadow-sm">
                        {formatFancyDate(startDate)}
                      </span>
                      {endDate && (
                        <>
                          <span className="text-gray-400">&rarr;</span>
                          <span className="bg-blue-100 text-[#1d93d0] px-1.5 py-0.5 rounded shadow-sm">
                            {formatFancyDate(endDate)}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <textarea
                  className="w-full h-full bg-transparent border-t border-gray-300 pt-2 text-[10px] outline-none resize-none placeholder-gray-400 font-medium"
                  placeholder="Jot down memos here..."
                  value={currentNote}
                  onChange={handleNoteChange}
                />
              </div>
              <div className='w-[60%] flex justify-center items-center'>
                <div className='grid grid-cols-7 grid-rows-7 montserrat-700 text-[9px] text-center items-center h-[80%] w-[90%] gap-y-1'>
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((header, index) => (
                    <div key={`header-${index}`} className={index >= 5 ? 'text-[#1d93d0]' : 'text-gray-700'}>
                      {header}
                    </div>
                  ))}
                  {days.map((item, index) => {
                    let isWeekend = (index % 7) >= 5;
                    let baseColor = item.type !== 'current' ? 'text-gray-300' : (isWeekend ? 'text-[#1d93d0]' : 'text-gray-700');

                    let activeOther = endDate || (startDate ? hoverDate : null);
                    let minD = startDate;
                    let maxD = startDate;
                    if (startDate && activeOther) {
                      minD = startDate < activeOther ? startDate : activeOther;
                      maxD = startDate > activeOther ? startDate : activeOther;
                    }

                    let isVisualSel = startDate && (item.dateStr === minD || item.dateStr === maxD);
                    let isVisualStart = startDate && item.dateStr === minD && minD !== maxD;
                    let isVisualEnd = startDate && item.dateStr === maxD && minD !== maxD;

                    let isRange = startDate && item.dateStr > minD && item.dateStr < maxD;

                    let textColor = baseColor;
                    if (isVisualSel) textColor = "text-white font-bold";
                    else if (isRange) textColor = "text-[#1d93d0] font-bold";

                    return (
                      <div
                        key={`day-${index}`}
                        className={`relative w-full h-full flex justify-center items-center group space-y-0 space-x-0 ${item.type === 'current' ? 'cursor-pointer' : 'cursor-default'}`}
                        onClick={() => {
                          if (item.type === 'current') handleDateClick(item.dateStr);
                        }}
                        onMouseEnter={() => {
                          if (item.type === 'current') setHoverDate(item.dateStr);
                        }}
                        onMouseLeave={() => {
                          if (item.type === 'current') setHoverDate(null);
                        }}
                      >
                        {/* Thinner background ribbons connecting the selected dates */}
                        {isRange && <div className="absolute top-[10%] bottom-[10%] left-0 right-0 bg-blue-100 z-0"></div>}
                        {isVisualStart && <div className="absolute top-[10%] bottom-[10%] left-1/2 right-0 bg-blue-100 z-0"></div>}
                        {isVisualEnd && <div className="absolute top-[10%] bottom-[10%] left-0 right-1/2 bg-blue-100 z-0"></div>}

                        {/* Explicitly sized foreground bubble to prevent flex grid stretching */}
                        <div className={`relative z-10 w-[20px] h-[20px] flex justify-center items-center rounded-full transition-all duration-200 ${isVisualSel ? 'bg-[#1d93d0] shadow-sm' : 'group-hover:bg-gray-200'} ${textColor}`}>
                          {item.day}
                        </div>
                      </div>
                    );
                  })}
                </div>


              </div>
            </div>
            <div className='h-[10%] bg-gray-100 flex flex-row items-center justify-end px-8 gap-4 relative z-20'>
              {/* Navigation Controls */}
              <button onClick={prevMonth} className="flex justify-center items-center w-8 h-8 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-[#1d93d0] hover:bg-[#1d93d0] hover:text-white group">
                <svg className="w-4 h-4 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={nextMonth} className="flex justify-center items-center w-8 h-8 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-[#1d93d0] hover:bg-[#1d93d0] hover:text-white group">
                <svg className="w-4 h-4 -mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Supplementary Desktop Panel */}
          <div className='flex flex-col shrink-0 w-[350px] h-[580px] bg-[#f9fafb] shadow-[10px_20px_40px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden border border-gray-200'>
            <div className='bg-[#1d93d0] text-white p-6 shadow-md z-10'>
              <h2 className='montserrat-700 text-xl tracking-wider'>MONTHLY PLANNER</h2>
              <p className='text-[10px] mt-1 text-blue-100 uppercase tracking-widest font-semibold'>Aggregated Collections & Memos</p>
            </div>
            <div className='flex-1 overflow-y-auto p-5 flex flex-col gap-4'>
              {Object.entries(notes).filter(([_, text]) => text.trim() !== '').length === 0 ? (
                <div className="text-gray-400 text-sm text-center mt-10 italic font-medium px-4">No notes created yet.<br /><br />Select dates on the calendar and jot down memos to see them collected here!</div>
              ) : (
                Object.entries(notes).filter(([_, text]) => text.trim() !== '').map(([key, text]) => {
                  let title = "General Memos";
                  if (key !== 'general') {
                    const parts = key.split('_');
                    if (parts.length === 2) {
                      title = `${formatFancyDate(parts[0])} - ${formatFancyDate(parts[1])}`;
                    } else {
                      title = formatFancyDate(parts[0]);
                    }
                  }

                  return (
                    <div key={key} className='group bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] relative'>
                      <div className='flex flex-row items-center justify-between mb-3 border-b border-gray-50 pb-2'>
                        <div className='flex items-center gap-2 text-[#1d93d0]'>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <span className='text-[10px] font-bold tracking-widest uppercase'>{title}</span>
                        </div>
                      </div>
                      <div className='text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-medium pl-1'>
                        {text}
                      </div>

                      <button
                        onClick={() => handleDeleteNote(key)}
                        className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-500'
                        title="Delete memo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default App
