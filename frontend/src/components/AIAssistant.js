import React, { useState, useEffect } from 'react';

const AIAssistant = ({ onTaskCreated, onEventCreated, onSettingsChanged }) => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [currentContext, setCurrentContext] = useState('tasks'); // tasks, calendar, settings

  useEffect(() => {
    // Determine current context based on URL or props
    const path = window.location.pathname;
    if (path.includes('/calendar')) {
      setCurrentContext('calendar');
    } else if (path.includes('/tasks')) {
      setCurrentContext('tasks');
    } else if (path.includes('/settings')) {
      setCurrentContext('settings');
    } else {
      // Default to tasks context for dashboard and other pages
      setCurrentContext('tasks');
    }
  }, []);

  const createTaskDirectly = async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          date: taskData.date,
          status: taskData.status || 'Pending',
          observation: taskData.observation || '',
          startTime: taskData.startTime,
          endTime: taskData.endTime
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const createdTask = await response.json();
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const processAIMessage = async (message) => {
    setIsProcessingAI(true);
    
    // Add user message to chat
    const userMessage = { type: 'user', content: message, timestamp: new Date() };
    setAiMessages(prev => [...prev, userMessage]);
    
    try {
      let extractedData = null;
      let aiResponse = {};

      // --- New: Check for report request in English ---
      if (currentContext === 'tasks' && /report|summary|list/i.test(message)) {
        const reportParams = extractReportParams(message);
        const format = extractReportFormat(message);
        if (reportParams) {
          try {
            const token = localStorage.getItem('token');
            let url = process.env.REACT_APP_BACKEND_URL + '/api/tasks/report?';
            if (reportParams.month && reportParams.year) {
              url += `month=${reportParams.month}&year=${reportParams.year}`;
            } else if (reportParams.startDate && reportParams.endDate) {
              url += `startDate=${reportParams.startDate}&endDate=${reportParams.endDate}`;
            }
            if (format) {
              url += `&format=${format}`;
            }
            const response = await fetch(url, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to fetch report');
            }
            // Download file automatically
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'report.' + (format === 'pdf' ? 'pdf' : 'xlsx');
            if (contentDisposition) {
              const match = contentDisposition.match(/filename="?([^";]+)"?/);
              if (match) filename = match[1];
            }
            const urlBlob = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              window.URL.revokeObjectURL(urlBlob);
              document.body.removeChild(a);
            }, 100);
            aiResponse = {
              type: 'assistant',
              content: `✅ Your ${format ? format.toUpperCase() : 'XLSX'} report is being downloaded and was also sent to your registered email.`,
              timestamp: new Date()
            };
          } catch (err) {
            aiResponse = {
              type: 'assistant',
              content: `❌ Error generating report. Please try again later.\n${err.message}`,
              timestamp: new Date()
            };
          }
          setAiMessages(prev => [...prev, aiResponse]);
          setIsProcessingAI(false);
          setAiMessage('');
          return;
        }
      }
      // --- End new report logic ---

      switch (currentContext) {
        case 'tasks':
          extractedData = extractTaskData(message);
          if (extractedData) {
            try {
              // Create task directly via API
              const createdTask = await createTaskDirectly(extractedData);
              let whatsappNotice = '';
              let calendarNotice = '';
              if (createdTask && createdTask.whatsappNotification === true) {
                whatsappNotice = '\n\n📲 A WhatsApp notification was sent to your registered number!';
              }
              if (createdTask && createdTask.calendarNotification === true) {
                calendarNotice = '\n\n📅 A calendar event was created in your configured calendar!';
              }
              aiResponse = {
                type: 'assistant',
                content: `✅ **Task created successfully!**\n\n📋 **Title**: ${createdTask.title}\n📅 **Date**: ${createdTask.date}\n⏰ **Time**: ${createdTask.startTime} - ${createdTask.endTime}\n📝 **Description**: ${createdTask.description || 'No description provided'}\n🔄 **Status**: ${createdTask.status}${whatsappNotice}${calendarNotice}\n\nYour task has been added to your list!`,
                timestamp: new Date()
              };
              
              // Call the callback to update the UI if needed
              if (onTaskCreated) {
                onTaskCreated(createdTask);
              }
            } catch (error) {
              aiResponse = {
                type: 'assistant',
                content: `❌ **Error creating task**

I understood your request but couldn't create the task. Please try again or create it manually in the tasks page.

**What I understood:**
📋 **Title**: ${extractedData.title}
📅 **Date**: ${extractedData.date}
⏰ **Time**: ${extractedData.startTime} - ${extractedData.endTime}`,
                timestamp: new Date()
              };
            }
          } else {
            aiResponse = {
              type: 'assistant',
              content: `I couldn't understand the task details clearly. Here are some examples:

**Task Examples:**
• "Meeting with client tomorrow at 2pm for 1 hour"
• "Review project documents on Friday from 9am to 11am"
• "Call supplier next Monday at 3pm"
• "Prepare presentation for Wednesday 10am-12pm"

Please try again with more specific details about date, time, and what you need to do.`,
              timestamp: new Date()
            };
          }
          break;

        case 'calendar':
          extractedData = extractEventData(message);
          if (extractedData) {
            aiResponse = {
              type: 'assistant',
              content: `I've prepared a calendar event for you! Here's what I understood:
              
📅 **Title**: ${extractedData.title}
📆 **Date**: ${extractedData.date}
⏰ **Time**: ${extractedData.startTime} - ${extractedData.endTime}
📝 **Description**: ${extractedData.description || 'No description provided'}

You can review and modify the details, then create the event.`,
              timestamp: new Date()
            };
            // Call the callback to fill the form
            if (onEventCreated) {
              onEventCreated(extractedData);
            }
            // Close AI assistant after successful event processing
            setTimeout(() => setShowAIAssistant(false), 3000);
          } else {
            aiResponse = {
              type: 'assistant',
              content: `I couldn't understand the event details clearly. Here are some examples:

**Event Examples:**
• "Team meeting tomorrow at 10am for 2 hours"
• "Client presentation on Friday from 2pm to 4pm"
• "Doctor appointment next Tuesday at 3pm"
• "Birthday party on Saturday 6pm-10pm"

Please try again with more specific details about date, time, and what the event is about.`,
              timestamp: new Date()
            };
          }
          break;

        case 'settings':
          const settingsData = extractSettingsData(message);
          if (settingsData) {
            aiResponse = {
              type: 'assistant',
              content: `I understand you want to change settings! Here's what I can help with:

${settingsData.suggestion}

You can navigate to the settings page to make these changes.`,
              timestamp: new Date()
            };
            if (onSettingsChanged) {
              onSettingsChanged(settingsData);
            }
            // Close AI assistant after successful settings processing
            setTimeout(() => setShowAIAssistant(false), 3000);
          } else {
            aiResponse = {
              type: 'assistant',
              content: `I can help you with settings! Here are some things you can ask about:

**Settings Examples:**
• "Change my password"
• "Update my email preferences"
• "Modify notification settings"
• "Change theme to dark mode"
• "Update profile information"

What would you like to change?`,
              timestamp: new Date()
            };
          }
          break;

        default:
          aiResponse = {
            type: 'assistant',
            content: 'I can help you with tasks, calendar events, and settings. What would you like to do?',
            timestamp: new Date()
          };
      }

      setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const aiResponse = {
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, aiResponse]);
    }
    
    setIsProcessingAI(false);
    setAiMessage('');
  };

  const extractTaskData = (message) => {
    const lowerMessage = message.toLowerCase();
    

    
    // Extract date patterns
    const datePatterns = [
      /(?:tomorrow|tmr|tmrw)/i,
      /(?:today)/i,
      /(?:next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
      /(?:this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
      /(?:on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
      /(?:for\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{4}-\d{2}-\d{2})/,
      /(\d{1,2}-\d{1,2}-\d{4})/
    ];
    

    
    let extractedDate = '';
    let extractedStartTime = '';
    let extractedEndTime = '';
    
    // Process date
    for (let pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {

        if (pattern.source.includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          extractedDate = tomorrow.toISOString().slice(0, 10);
        } else if (pattern.source.includes('today')) {
          extractedDate = new Date().toISOString().slice(0, 10);
        } else if (pattern.source.includes('next') || pattern.source.includes('this') || pattern.source.includes('on') || pattern.source.includes('for')) {
          const dayName = match[1].toLowerCase();
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const targetDay = days.indexOf(dayName);
          const today = new Date();
          const currentDay = today.getDay();
          let daysToAdd = targetDay - currentDay;
          if (daysToAdd <= 0) daysToAdd += 7;
          const targetDate = new Date();
          targetDate.setDate(today.getDate() + daysToAdd);
          extractedDate = targetDate.toISOString().slice(0, 10);
        } else {
          extractedDate = match[1];
        }

        break;
      }
    }
    
    // Process time
    const timeMatches = [...message.matchAll(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/gi)];
    if (timeMatches.length >= 2) {
      const time1 = timeMatches[0];
      const time2 = timeMatches[1];
      
      let hour1 = parseInt(time1[1]);
      let hour2 = parseInt(time2[1]);
      const minute1 = time1[2] ? parseInt(time1[2]) : 0;
      const minute2 = time2[2] ? parseInt(time2[2]) : 0;
      
      // Handle AM/PM
      if (time1[3] && time1[3].toLowerCase() === 'pm' && hour1 !== 12) hour1 += 12;
      if (time1[3] && time1[3].toLowerCase() === 'am' && hour1 === 12) hour1 = 0;
      if (time2[3] && time2[3].toLowerCase() === 'pm' && hour2 !== 12) hour2 += 12;
      if (time2[3] && time2[3].toLowerCase() === 'am' && hour2 === 12) hour2 = 0;
      
      extractedStartTime = `${hour1.toString().padStart(2, '0')}:${minute1.toString().padStart(2, '0')}`;
      extractedEndTime = `${hour2.toString().padStart(2, '0')}:${minute2.toString().padStart(2, '0')}`;
    } else if (timeMatches.length === 1) {
      const time = timeMatches[0];
      let hour = parseInt(time[1]);
      const minute = time[2] ? parseInt(time[2]) : 0;
      
      if (time[3] && time[3].toLowerCase() === 'pm' && hour !== 12) hour += 12;
      if (time[3] && time[3].toLowerCase() === 'am' && hour === 12) hour = 0;
      
      extractedStartTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      // Default end time to 1 hour later
      const endHour = (hour + 1) % 24;
      extractedEndTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // Extract title/description - create a cleaner title
    const words = message.split(' ');
    const titleWords = words.filter(word => {
      const lowerWord = word.toLowerCase();
      // Remove time-related words, dates, and common task words that don't add meaning
      return !word.match(/tomorrow|today|next|this|at|from|to|am|pm|for|hour|hours|minute|minutes/i) &&
             !word.match(/^\d/) &&
             !word.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)$/i) &&
             !word.match(/^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$/i) &&
             word.length > 2;
    });
    
    // Take first 3-4 meaningful words for a concise title
    const title = titleWords.slice(0, 4).join(' ').replace(/[^\w\s]/g, '').trim();
    
    if (extractedDate && extractedStartTime) {
      return {
        title: title || 'New Task',
        description: message,
        date: extractedDate,
        startTime: extractedStartTime,
        endTime: extractedEndTime,
        status: 'Pending',
        observation: ''
      };
    }
    
    return null;
  };

  const extractEventData = (message) => {
    // Similar to task data but for calendar events
    const taskData = extractTaskData(message);
    if (taskData) {
      return {
        ...taskData,
        type: 'event'
      };
    }
    return null;
  };

  const extractSettingsData = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('password') || lowerMessage.includes('senha')) {
      return {
        type: 'password',
        suggestion: 'To change your password, go to Settings > Security > Change Password'
      };
    } else if (lowerMessage.includes('email') || lowerMessage.includes('e-mail')) {
      return {
        type: 'email',
        suggestion: 'To update your email, go to Settings > Profile > Email Preferences'
      };
    } else if (lowerMessage.includes('notification') || lowerMessage.includes('notificação')) {
      return {
        type: 'notifications',
        suggestion: 'To modify notifications, go to Settings > Notifications'
      };
    } else if (lowerMessage.includes('theme') || lowerMessage.includes('tema') || lowerMessage.includes('dark')) {
      return {
        type: 'theme',
        suggestion: 'To change the theme, go to Settings > Appearance > Theme'
      };
    } else if (lowerMessage.includes('profile') || lowerMessage.includes('perfil')) {
      return {
        type: 'profile',
        suggestion: 'To update your profile, go to Settings > Profile'
      };
    }
    
    return null;
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (aiMessage.trim() && !isProcessingAI) {
      processAIMessage(aiMessage.trim());
    }
  };

  const openAIAssistant = () => {
    setShowAIAssistant(true);
    let welcomeMessage = '';
    
    switch (currentContext) {
      case 'tasks':
        welcomeMessage = `Hello! I'm your AI assistant for tasks. I can create tasks directly for you using natural language!

**Task Examples:**
• "Meeting with client tomorrow at 2pm for 1 hour"
• "Review project documents on Friday from 9am to 11am"
• "Call supplier next Monday at 3pm"
• "Prepare presentation for Wednesday 10am-12pm"

Just describe your task and I'll create it automatically!`;
        break;
      case 'calendar':
        welcomeMessage = `Hello! I'm your AI assistant for calendar events. I can help you create events using natural language.

**Event Examples:**
• "Team meeting tomorrow at 10am for 2 hours"
• "Client presentation on Friday from 2pm to 4pm"
• "Doctor appointment next Tuesday at 3pm"
• "Birthday party on Saturday 6pm-10pm"

Just describe your event and I'll help you create it!`;
        break;
      case 'settings':
        welcomeMessage = `Hello! I'm your AI assistant for settings. I can help you navigate and change settings.

**Settings Examples:**
• "Change my password"
• "Update my email preferences"
• "Modify notification settings"
• "Change theme to dark mode"
• "Update profile information"

What would you like to change?`;
        break;
              default:
          welcomeMessage = `Hello! I'm your AI assistant. I can create tasks directly for you using natural language!

**Task Examples:**
• "Meeting with client tomorrow at 2pm for 1 hour"
• "Review project documents on Friday from 9am to 11am"
• "Call supplier next Monday at 3pm"
• "Prepare presentation for Wednesday 10am-12pm"

Just describe your task and I'll create it automatically!`;
    }
    
    setAiMessages([{
      type: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
  };

  const closeAIAssistant = () => {
    setShowAIAssistant(false);
    setAiMessages([]);
    setAiMessage('');
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <button
        onClick={openAIAssistant}
        className="ai-assistant-fab"
        title="AI Assistant - Get help with natural language"
      >
        🤖
      </button>

      {/* AI Assistant Chat Modal */}
      {showAIAssistant && (
        <div className="ai-assistant-modal">
          <div className="ai-assistant-content">
            <div className="ai-assistant-header">
              <h3>🤖 AI Assistant</h3>
              <button onClick={closeAIAssistant} className="ai-close-btn">×</button>
            </div>
            
            <div className="ai-chat-messages">
              {aiMessages.map((msg, index) => (
                <div key={index} className={`ai-message ${msg.type}`}>
                  <div className="ai-message-content">
                    {msg.content}
                  </div>
                  <div className="ai-message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {isProcessingAI && (
                <div className="ai-message assistant">
                  <div className="ai-message-content">
                    <div className="ai-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleAISubmit} className="ai-chat-input">
              <input
                type="text"
                placeholder={`Describe what you need (e.g., ${currentContext === 'tasks' ? "'Meeting tomorrow at 2pm'" : currentContext === 'calendar' ? "'Team meeting Friday 10am'" : "'Change my password'"})`}
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                disabled={isProcessingAI}
                className="ai-input-field"
              />
              <button 
                type="submit" 
                disabled={!aiMessage.trim() || isProcessingAI}
                className="ai-send-btn"
              >
                {isProcessingAI ? '⏳' : '➤'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Helper to extract report parameters from English message
function extractReportParams(message) {
  // Month names in English
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const lower = message.toLowerCase();
  // Match month (e.g., 'report for july' or 'july report')
  const monthMatch = lower.match(/(?:for|of)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})?/);
  if (monthMatch) {
    const month = months.indexOf(monthMatch[1]) + 1;
    let year = new Date().getFullYear();
    if (monthMatch[2]) year = parseInt(monthMatch[2], 10);
    return { month, year };
  }
  // Match week (e.g., 'week of july 10', 'week of 2023-07-10')
  const weekMatch = lower.match(/week of (\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|[a-z]+ \d{1,2})/);
  if (weekMatch) {
    let baseDate = null;
    if (/\d{4}-\d{2}-\d{2}/.test(weekMatch[1])) {
      baseDate = new Date(weekMatch[1]);
    } else if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(weekMatch[1])) {
      const [m, d, y] = weekMatch[1].split('/').map(Number);
      baseDate = new Date(y, m - 1, d);
    } else {
      // e.g., 'july 10'
      const [monthName, day] = weekMatch[1].split(' ');
      const monthIdx = months.indexOf(monthName);
      if (monthIdx >= 0) {
        baseDate = new Date(new Date().getFullYear(), monthIdx, parseInt(day, 10));
      }
    }
    if (baseDate) {
      const start = new Date(baseDate);
      start.setDate(baseDate.getDate() - baseDate.getDay()); // Sunday
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Saturday
      return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
    }
  }
  // Match custom range (e.g., 'from 2023-07-01 to 2023-07-31')
  const rangeMatch = lower.match(/from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/);
  if (rangeMatch) {
    return { startDate: rangeMatch[1], endDate: rangeMatch[2] };
  }
  return null;
}

// Helper to extract report format from English message
function extractReportFormat(message) {
  const lower = message.toLowerCase();
  if (/(pdf)/.test(lower)) return 'pdf';
  if (/(xlsx|excel|spreadsheet)/.test(lower)) return 'xlsx';
  return null;
}

export default AIAssistant; 