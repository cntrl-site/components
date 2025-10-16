import { useCntrlContext } from "../provider/useCntrlContext";
import { useLayoutContext } from "../components/useLayoutContext";

export const useExemplary = () => {
  const { layouts } = useCntrlContext();
  const layout = useLayoutContext();
  const exemplary = layouts.find(l => l.id === layout)?.exemplary ?? 1;
  return exemplary;
};
