import { SPECIES, type Mode } from '$lib/data/species';

export interface TreeSelection {
  sp: string;
  nc: string;
  ca: string;
  ba: string;
}

class AppState {
  month = $state<number>(new Date().getMonth()); // 0..11
  mode = $state<Mode>('allergy');
  selectedSpecies = $state<string[]>(SPECIES.map((s) => s.id));
  selectedBarri = $state<string>('all');
  barris = $state<string[]>([]);
  visibleCount = $state<number>(0);
  selectedTree = $state<TreeSelection | null>(null);
  selectedTreeCoordinates = $state<[number, number] | null>(null);
  mobilePanelOpen = $state<boolean>(true);

  toggleSpecies(id: string) {
    const exists = this.selectedSpecies.includes(id);
    if (exists) {
      if (this.selectedSpecies.length === 1) return;
      this.selectedSpecies = this.selectedSpecies.filter((s) => s !== id);
    } else {
      this.selectedSpecies = [...this.selectedSpecies, id];
    }
  }

  setAllSpecies() {
    this.selectedSpecies = SPECIES.map((s) => s.id);
  }

  clearSelection() {
    this.selectedTree = null;
    this.selectedTreeCoordinates = null;
  }
}

export const app = new AppState();
