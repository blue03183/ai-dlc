import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* Routes will be added in subsequent steps */}
      <Route path="*" element={<div>테이블오더 고객 앱</div>} />
    </Routes>
  );
}

export default App;
