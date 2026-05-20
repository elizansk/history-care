import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface BuildingsFiltersState {
  categoryId: string;
  cityId: string;
  from: string;
  to: string;
}

const initialState: BuildingsFiltersState = {
  categoryId: '',
  cityId: '',
  from: '',
  to: '',
};

const buildingsFilterSlice = createSlice({
  name: 'buildingsFilters',
  initialState,
  reducers: {
    setBuildingsFilter: (
      state,
      action: PayloadAction<{ name: keyof BuildingsFiltersState; value: string }>
    ) => {
      state[action.payload.name] = action.payload.value;
    },
    resetBuildingsFilters: () => initialState,
  },
});

export const { setBuildingsFilter, resetBuildingsFilters } = buildingsFilterSlice.actions;
export default buildingsFilterSlice.reducer;
