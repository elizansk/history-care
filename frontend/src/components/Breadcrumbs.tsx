import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
      {items.map((item) => (//проходимся по breadcrumbs
        <li
          className={`breadcrumb-item ${!item.href ? 'active' : ''}`}
          key={item.label}
          aria-current={!item.href ? 'page' : undefined}
        >
          {item.href ? <Link to={item.href}>{item.label}</Link> : item.label}
        </li>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
