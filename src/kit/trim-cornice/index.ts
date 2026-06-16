import type { KitModuleRuntime } from '../shared/module-api'
import { beltCornerJointModule, cornerCorniceModule, corniceCornerJointModule, largeCorniceModule, smallCorniceModule } from './cornices'
import {
  beltCourseLargeModule,
  beltCourseSmallModule,
  floorBandStripModule,
  dentilCorbelCourseModule,
  lintelStripModule,
  windowSillStripModule,
} from './strips'

export const trimCorniceRuntimes: KitModuleRuntime[] = [
  { id: 'belt-course-small', builder: beltCourseSmallModule, slots: ['limestone'] },
  { id: 'belt-course-large', builder: beltCourseLargeModule, slots: ['limestone', 'ornament'] },
  { id: 'window-sill-strip', builder: windowSillStripModule, slots: ['limestone'] },
  { id: 'lintel-strip', builder: lintelStripModule, slots: ['limestone'] },
  { id: 'floor-band-strip', builder: floorBandStripModule, slots: ['limestone', 'ornament'] },
  { id: 'small-cornice', builder: smallCorniceModule, slots: ['limestone', 'ornament'] },
  { id: 'large-cornice', builder: largeCorniceModule, slots: ['limestone', 'ornament'] },
  { id: 'corner-cornice', builder: cornerCorniceModule, slots: ['limestone', 'ornament'] },
  { id: 'belt-corner-joint', builder: beltCornerJointModule, slots: ['limestone'] },
  { id: 'cornice-corner-joint', builder: corniceCornerJointModule, slots: ['limestone'] },
  { id: 'dentil-corbel-course', builder: dentilCorbelCourseModule, slots: ['limestone', 'ornament'] },
]
