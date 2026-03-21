import datacenters from './data/datacenters.json';
import companies from './data/companies.json';
import waterBaselines from './data/water-baselines.json';
import electricityBaselines from './data/electricity-baselines.json';

export interface DataCenter {
  id: string;
  company_id: string;
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
  country: string;
  region: string;
  water_stress_score: number;
  daily_water_gallons: number;
  annual_mwh: number;
  pue: number;
  servers_estimated: number;
  cooling_type: string;
  renewable_pct: number;
  operational_since: number;
  disclosed: boolean;
  disclosure_note?: string;
  sq_ft: number;
  water_source?: string;
  grid_name?: string;
  carbon_intensity_local?: number;
  certifications?: string[];
}

export interface Company {
  id: string;
  name: string;
  parent: string;
  transparency: string;
  hydroscore: number;
  disclosed_annual_gallons: number;
  annual_mwh: number;
  water_stress_avg: number;
  grid_efficiency: number;
  pue_avg: number;
  renewable_claimed_pct: number;
  renewable_actual_pct: number;
  ewaste_tons_annual: number;
  hardware_refresh_years: number;
  pledge: string;
  pledge_verified: boolean;
  disclosure_rating: string;
  color: string;
  facilities_count: number;
}

export const Store = {
  datacenters: datacenters as DataCenter[],
  companies: companies as Company[],
  waterBaselines,
  electricityBaselines,

  getCompany(id: string) {
    return this.companies.find(c => c.id === id);
  },

  getFacilitiesByCompany(companyId: string) {
    return this.datacenters.filter(d => d.company_id === companyId);
  },

  getFacilitiesInStressZone(minScore: number) {
    return this.datacenters.filter(d => d.water_stress_score >= minScore);
  }
};
