import { Component } from '../types/Component';
import { ControlSliderComponent } from './ControlSlider/ControlSliderComponent';
import { ControlImageRevealSliderComponent } from './ImageRevealSlider/ControlImageRevealSliderComponent';
import { LightboxComponent } from './Lightbox/LightboxComponent';
import { FormComponent } from './Form/FormComponent';
import { OnelinerFormComponent } from './OnelinerForm/OnelinerFormComponent';
import { TestimonialGridComponent } from './TestimonialGrid/TestimonialGridComponent';
import { TestimonialSingleComponent } from './TestimonialSingle/TestimonialSingleComponent';
import { InlineImageFlowComponent } from './InlineImageFlow/InlineImageFlowComponent';
import { ScreenImageSliderComponent } from './ScreenImageSlider/ScreenImageSliderComponent';

export const components: Component[] = [
  ControlSliderComponent,
  ControlImageRevealSliderComponent,
  ScreenImageSliderComponent,
  LightboxComponent,
  FormComponent,
  OnelinerFormComponent,
  TestimonialGridComponent,
  TestimonialSingleComponent,
  InlineImageFlowComponent
];
