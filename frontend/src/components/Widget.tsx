import React, { ReactNode } from 'react';
import './Widget.css';

type WidgetProps = {
  title: string;
  children: ReactNode;
};

const Widget: React.FC<WidgetProps> = ({ title, children }) => (
  <div className="widget">
    <h3>{title}</h3>
    <div className="widget-content">{children}</div>
  </div>
);

export default Widget;

 