import React, { useEffect, useState } from 'react';
import API from '../api/api';

const Children = () => {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await API.get('children/');
      setChildren(response.data);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  return (
    <div>
      <h1>Children</h1>
      <ul>
        {children.map(child => (
          <li key={child.id}>
            {child.name} - Age: {child.age} - Parent: {child.parent_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Children;
