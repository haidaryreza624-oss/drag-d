import { create } from 'zustand';

const useUIStore = create((set) => ({
  // Modal state
  showAttributeModal: false,
  attributeTargetElementId: null, // element id or null for standalone

  openAttributeModal: (elementId = null) =>{
     
    set({ showAttributeModal: true, attributeTargetElementId: elementId });
  },

  closeAttributeModal: () =>
    set({ showAttributeModal: false, attributeTargetElementId: null }),
}));

export default useUIStore;