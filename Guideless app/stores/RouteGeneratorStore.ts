import { create } from 'zustand';

export type DestinationType = 'address' | 'anywhere' | 'return';

export interface RouteGeneratorFormData {
  destination: {
    type: DestinationType;
    address?: string;
  };
  durationMinutes: number;
  categories: string[];
}

interface RouteGeneratorActions {
  setDestination: (type: DestinationType, address?: string) => void;
  setDuration: (duration: number) => void;
  toggleCategory: (category: string) => void;
  resetForm: () => void;
  nextStep: () => void;
  previousStep: () => void; 
}

interface RouteGeneratorState {
  currentStep: number;
  formData: RouteGeneratorFormData;
  actions: RouteGeneratorActions;
}

const initialFormData: RouteGeneratorFormData = {
  destination: {
    type: 'address',
    address: '',
  },
  durationMinutes: 60,
  categories: [],
};

const useRouteGeneratorStore = create<RouteGeneratorState>((set, get) => ({
  currentStep: 1,
  formData: initialFormData,
  actions: {
    setDestination: (type: DestinationType, address?: string) =>
      set((state) => {
        console.log(type, address);
        return {
          formData: {
            ...state.formData,
            destination: { type, address },
          },
        };
      }),

    setDuration: (durationMinutes: number) =>
      set((state) => ({
        formData: {
          ...state.formData,
          durationMinutes,
        },
      })),

    toggleCategory: (category: string) =>
      set((state) => {
        const categories = state.formData.categories.includes(category)
          ? state.formData.categories.filter((c) => c !== category)
          : [...state.formData.categories, category];
        
        return {
          formData: {
            ...state.formData,
            categories,
          },
        };
      }),

    resetForm: () =>
      set({
        formData: initialFormData,
        currentStep: 1,
      }),

    nextStep: () =>
      set((state) => {
        if (state.currentStep < 3) {
          return {
            currentStep: state.currentStep + 1,
          };
        }
        return {};
      }),

    previousStep: () =>
      set((state) => {
        if (state.currentStep > 1) {
          return {
            currentStep: state.currentStep - 1,
          };
        }
        return {};
      }),
  },
}));

export const useCurrentStep = () => useRouteGeneratorStore((state) => state.currentStep);
export const useFormData = () => useRouteGeneratorStore((state) => state.formData);
export const useRouteGeneratorActions = () => useRouteGeneratorStore((state) => state.actions);

export const useCanProceedToNextStep = (): boolean => {
  const formData = useFormData();
  const currentStep = useCurrentStep();
  switch (currentStep) {
    case 1:
      if (formData.destination.type !== 'address') {
        return true;
      }
      if(formData.destination.address && formData.destination.address.trim().length > 0) {
        return true;
      }
      return false;
    
    case 2:
      return formData.durationMinutes >= 30;
    
    case 3:
      return formData.categories.length > 0;
    
    default:
      return false;
  }
}