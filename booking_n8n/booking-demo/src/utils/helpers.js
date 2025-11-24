export const getNextWeekday = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }

  return tomorrow.toISOString().split('T')[0];
};

export const getNextWeekend = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  while (tomorrow.getDay() !== 0 && tomorrow.getDay() !== 6) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }

  return tomorrow.toISOString().split('T')[0];
};

export const markdownToHtml = (markdown) => {
  return markdown
    // Headers
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraphs
    .replace(/^(.*)$/gm, '<p>$1</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    // Fix headers inside paragraphs
    .replace(/<p>(<h[1-3]>.*?<\/h[1-3]>)<\/p>/g, '$1')
    // Fix lists
    .replace(/- (.*?)(?=<br>|$)/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul><br><ul>/g, '');
};


