export interface DayEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  productiveActivities: string[];
  unproductiveActivities: string[];
  feelGoodAboutDay?: boolean;
  feelGoodReason?: string;
  isSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  parentId?: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export type RootStackParamList = {
  Main: undefined;
  Calendar: undefined;
};

export type TabParamList = {
  EN: undefined;
  WS: undefined;
};
