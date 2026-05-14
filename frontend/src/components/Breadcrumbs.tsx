import React from 'react';
import { Breadcrumb } from 'react-bootstrap';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {//Компонент принимает массив breadcrumbs
  return (//Контейнер bootstrap breadcrumbs
    <Breadcrumb>
      {items.map((item, index) => (//проходимся по breadcrumbs
        <Breadcrumb.Item key={index} href={item.href} active={!item.href}>
          {item.label}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;