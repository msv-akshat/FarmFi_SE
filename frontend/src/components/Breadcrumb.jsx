import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ paths }) => {
  return (
    <div className="text-sm text-gray-600 mb-4 flex gap-2 flex-wrap">
      {paths.map((p, i) => (
        <span key={i} className="flex items-center gap-2">
          {p.link ? (
            <Link to={p.link} className="text-teal-600 hover:underline">{p.label}</Link>
          ) : (
            <span className="text-gray-800 font-semibold">{p.label}</span>
          )}
          {i < paths.length - 1 && <span className="text-gray-400">/</span>}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumb;
