import React from "react";

function UserTable({ headers, data = [] }) {
  return (
    <table>
      <thead>
        <tr>
          {headers.map((header) => {
            return <th key={header.text}>{header.text}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        
      </tbody>
    </table>
  );
}

export default UserTable;
