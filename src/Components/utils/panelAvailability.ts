export type PanelAvailabilityContext = Record<string, string | undefined>;

type AvailabilityPanel = {
  id: string;
  availableWhen?: Record<string, string[]>;
};

type AvailabilitySchema = {
  panels?: AvailabilityPanel[];
  statePanels?: string[] | null;
};

export function isPanelAvailable(
  panel: AvailabilityPanel | undefined,
  context: PanelAvailabilityContext
): boolean {
  const rules = panel?.availableWhen;
  if (!rules) return true;
  return Object.entries(rules).every(([key, allowed]) => {
    if (!allowed?.length) return true;
    const current = context[key];
    if (current === undefined) return true;
    return allowed.includes(current);
  });
}

export function getAvailableStatePanels(
  schema: AvailabilitySchema | undefined,
  context: PanelAvailabilityContext
): string[] | null {
  const statePanels = schema?.statePanels;
  if (!statePanels?.length) return null;
  return statePanels.filter((id) => {
    const panel = schema?.panels?.find(item => item.id === id);
    return isPanelAvailable(panel, context);
  });
}

export function getUnavailableStates(
  schema: AvailabilitySchema | undefined,
  context: PanelAvailabilityContext
): string[] {
  const statePanels = schema?.statePanels;
  if (!statePanels?.length) return [];
  const available = new Set(getAvailableStatePanels(schema, context) ?? []);
  return statePanels.filter(id => !available.has(id));
}
