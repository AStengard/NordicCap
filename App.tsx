import React from 'react';
import { CapTableProvider } from './context/CapTableContext';
import { RecruiterDemoProvider } from './context/RecruiterDemoContext';
import { NordicCapEngine } from './NordicCapEngine';

export function App() {
  return (
    <CapTableProvider>
      <RecruiterDemoProvider>
        <NordicCapEngine />
      </RecruiterDemoProvider>
    </CapTableProvider>
  );
}

export default App;
