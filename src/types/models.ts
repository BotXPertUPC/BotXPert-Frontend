export interface Botflow {
    id: number;
    name: string;
    description: string;
  }
  
  export interface Node {
    id: number;
    bot_flow: number;
    type: 'START' | 'TEXT' | 'LIST' | 'END';
    text?: string;
    position_x?: number;
    position_y?: number;
    list_header?: string;
    next_node?: number;
  }
  
  export interface ListOption {
    id: number;
    node: number;
    label: string;
    target_node?: number;
  }
  