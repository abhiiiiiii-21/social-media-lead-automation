export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

export const getHealthColor = (health: string): string => {
  switch (health) {
    case "Excellent": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "Good": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case "Average": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "Poor": return "text-destructive bg-destructive/10 border-destructive/20";
    default: return "text-muted-foreground bg-muted border-border";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Qualified": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "Rejected": return "text-destructive bg-destructive/10 border-destructive/20";
    case "Needs Review": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "Contacted": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case "Saved": return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
    case "In CRM": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    case "Meeting Booked": return "text-teal-500 bg-teal-500/10 border-teal-500/20";
    case "Closed": return "text-green-500 bg-green-500/10 border-green-500/20";
    default: return "text-muted-foreground bg-muted border-border";
  }
};

export const getScoreColor = (score: number): string => {
  if (score >= 98) return "text-emerald-500";
  if (score >= 90) return "text-green-500";
  if (score >= 80) return "text-amber-500";
  return "text-destructive";
};
