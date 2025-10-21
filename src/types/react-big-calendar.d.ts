declare module "react-big-calendar" {
  import * as React from "react";

  export interface Event {
    id?: string | number;
    title?: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
  }

  export const Calendar: React.FC<any>;
  export const Views: any;
  export const dateFnsLocalizer: any;
}
