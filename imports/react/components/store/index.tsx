export interface IProps {
  context?: any;
  children?: any;
  default?: any;

  [key: string]: any;
}

export interface IValue {
  value: any;
  set: (merge: any) => void;
}

// TODO add posibility to pass custom Context into Store