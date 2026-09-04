import { create } from 'zustand';

import { defaultProfile, type Gender, type Profile } from '../../domain/profile';

interface ProfileState extends Profile {
  setAge: (age: number) => void;
  setGender: (gender: Gender) => void;
  setHeightCm: (heightCm: number) => void;
  setWeightKg: (weightKg: number) => void;
  setActivityLevel: (activityLevel: number) => void;
  addSport: (sport: string) => void;
  removeSport: (sport: string) => void;
  setCountry: (country: string) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  ...defaultProfile,
  setAge: (age) => set({ age }),
  setGender: (gender) => set({ gender }),
  setHeightCm: (heightCm) => set({ heightCm }),
  setWeightKg: (weightKg) => set({ weightKg }),
  setActivityLevel: (activityLevel) => set({ activityLevel }),
  addSport: (sport) =>
    set((state) => (state.sports.includes(sport) ? state : { sports: [...state.sports, sport] })),
  removeSport: (sport) => set((state) => ({ sports: state.sports.filter((s) => s !== sport) })),
  setCountry: (country) => set({ country }),
}));

export function selectProfile(state: ProfileState): Profile {
  const { age, gender, heightCm, weightKg, activityLevel, sports, country } = state;
  return { age, gender, heightCm, weightKg, activityLevel, sports, country };
}
