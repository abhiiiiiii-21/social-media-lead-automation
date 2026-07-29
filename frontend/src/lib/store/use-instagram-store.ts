import { create } from 'zustand';
import { InstagramProfile } from '../types/instagram';

interface InstagramStore {
  selectedLeads: InstagramProfile[];
  toggleLead: (lead: InstagramProfile) => void;
  selectAll: (leads: InstagramProfile[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

export const useInstagramStore = create<InstagramStore>((set, get) => ({
  selectedLeads: [],
  
  toggleLead: (lead) => {
    const current = get().selectedLeads;
    const exists = current.find(l => l.id === lead.id);
    
    if (exists) {
      set({ selectedLeads: current.filter(l => l.id !== lead.id) });
    } else {
      set({ selectedLeads: [...current, lead] });
    }
  },
  
  selectAll: (leads) => {
    set({ selectedLeads: leads });
  },
  
  clearSelection: () => {
    set({ selectedLeads: [] });
  },
  
  isSelected: (id) => {
    return get().selectedLeads.some(l => l.id === id);
  }
}));
