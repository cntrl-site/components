import { BurgerComponent } from './Components/Burger/BurgerComponent';
import { ClickGallerieComponent } from './Components/ClickGallerie/ClickGallerieComponent';
import { FAQComponent } from './Components/FAQ/FAQComponent';
import { FormComponent } from './Components/Form/FormComponent';
import { GridComponent } from './Components/Grid/GridComponent';
import { HelixComponent } from './Components/Helix/HelixComponent';
import { HiveComponent } from './Components/Hive/HiveComponent';
import { LightboxJournalComponent } from './Components/LightboxJournal/LightboxJournalComponent';
import { LightboxStripComponent } from './Components/LightboxStrip/LightboxStripComponent';
import { ListComponent } from './Components/List/ListComponent';
import { MarqueeComponent } from './Components/Marquee/MarqueeComponent';
import { MarqueeTextComponent } from './Components/MarqueeText/MarqueeTextComponent';
import { MercuryComponent } from './Components/Mercury/MercuryComponent';
import { OnelinerFormComponent } from './Components/OnelinerForm/OnelinerFormComponent';
import { PretextComponent } from './Components/Pretext/PretextComponent';
import { ScaleComponent } from './Components/Scale/ScaleComponent';
import { SimpleButtonComponent } from './Components/SimpleButton/SimpleButtonComponent';
import { Slider20Component } from './Components/Slider20/Slider20Component';
import { TestimonialGridComponent } from './Components/TestimonialGrid/TestimonialGridComponent';
import { TestimonialSingleComponent } from './Components/TestimonialSingle/TestimonialSingleComponent';
import { WaterfallComponent } from './Components/Waterfall/WaterfallComponent';
import burgerSource from './Components/Burger/Burger.tsx?raw';
import clickGallerieSource from './Components/ClickGallerie/ClickGallerie.tsx?raw';
import faqSource from './Components/FAQ/FAQ.tsx?raw';
import formSource from './Components/Form/Form.tsx?raw';
import gridSource from './Components/Grid/Grid.tsx?raw';
import helixSource from './Components/Helix/Helix.tsx?raw';
import hiveSource from './Components/Hive/Hive.tsx?raw';
import lightboxJournalSource from './Components/LightboxJournal/LightboxJournal.tsx?raw';
import lightboxStripSource from './Components/LightboxStrip/LightboxStrip.tsx?raw';
import listSource from './Components/List/List.tsx?raw';
import marqueeSource from './Components/Marquee/Marquee.tsx?raw';
import marqueeTextSource from './Components/MarqueeText/MarqueeText.tsx?raw';
import mercurySource from './Components/Mercury/Mercury.tsx?raw';
import onelinerFormSource from './Components/OnelinerForm/OnelinerForm.tsx?raw';
import pretextSource from './Components/Pretext/Pretext.tsx?raw';
import scaleSource from './Components/Scale/Scale.tsx?raw';
import simpleButtonSource from './Components/SimpleButton/SimpleButton.tsx?raw';
import slider20Source from './Components/Slider20/Slider20.tsx?raw';
import testimonialGridSource from './Components/TestimonialGrid/TestimonialGrid.tsx?raw';
import testimonialSingleSource from './Components/TestimonialSingle/TestimonialSingle.tsx?raw';
import waterfallSource from './Components/Waterfall/Waterfall.tsx?raw';

export const componentSources: Record<string, string> = {
  [BurgerComponent.id]: burgerSource,
  [ClickGallerieComponent.id]: clickGallerieSource,
  [FAQComponent.id]: faqSource,
  [FormComponent.id]: formSource,
  [GridComponent.id]: gridSource,
  [HelixComponent.id]: helixSource,
  [HiveComponent.id]: hiveSource,
  [LightboxJournalComponent.id]: lightboxJournalSource,
  [LightboxStripComponent.id]: lightboxStripSource,
  [ListComponent.id]: listSource,
  [MarqueeComponent.id]: marqueeSource,
  [MarqueeTextComponent.id]: marqueeTextSource,
  [MercuryComponent.id]: mercurySource,
  [OnelinerFormComponent.id]: onelinerFormSource,
  [PretextComponent.id]: pretextSource,
  [ScaleComponent.id]: scaleSource,
  [SimpleButtonComponent.id]: simpleButtonSource,
  [Slider20Component.id]: slider20Source,
  [TestimonialGridComponent.id]: testimonialGridSource,
  [TestimonialSingleComponent.id]: testimonialSingleSource,
  [WaterfallComponent.id]: waterfallSource,
};
