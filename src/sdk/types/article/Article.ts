import { Section } from './Section';
import { Interaction } from './Interaction';

export interface Article {
  id: string;
  sections: Section[];
  interactions: Record<string, Interaction[]>;
}
