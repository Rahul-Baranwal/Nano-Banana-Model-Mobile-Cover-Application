
export interface PhoneModel {
  name: string;
  image: string;
}

export enum Angle {
  Flat = 'Flat',
  Tilted = 'Tilted',
  Perspective3D = '3D Perspective',
}

export type MockupResult = {
  [key in Angle]: string;
};
