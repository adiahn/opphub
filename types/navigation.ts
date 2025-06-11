export type RootStackParamList = {
  '(tabs)': undefined;
  'post/[id]': { id: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 